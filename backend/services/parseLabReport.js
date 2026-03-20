const db = require("../config/db");
const testDictionary = require("./testDictionary");

const DEBUG = process.env.LAB_PARSE_DEBUG === "1";
function debug(...args) {
  if (DEBUG) console.log("[parseLabReport]", ...args);
}

function normalizeNumberString(numStr) {
  numStr = numStr.replace(/\s+/g, "");
  const hasComma = numStr.includes(",");
  const hasDot = numStr.includes(".");
  if (hasComma && hasDot) {
    if (numStr.lastIndexOf(",") > numStr.lastIndexOf(".")) {
      numStr = numStr.replace(/\./g, "").replace(/,/g, ".");
    } else {
      numStr = numStr.replace(/,/g, "");
    }
  } else if (hasComma) {
    const commaCount = (numStr.match(/,/g) || []).length;
    if (commaCount === 1 && /,\d{1,2}$/.test(numStr)) {
      numStr = numStr.replace(/,/, ".");
    } else {
      numStr = numStr.replace(/,/g, "");
    }
  }
  return parseFloat(numStr);
}

function cleanForFuzzy(s) {
  return s.toLowerCase().replace(/[^a-z0-9 ]+/g, "");
}

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[a.length][b.length];
}

function fuzzyIndexOf(cleanLine, cleanAlias) {
  const windowSize = Math.max(1, cleanAlias.length);
  let best = { index: -1, dist: Infinity };
  for (let i = 0; i + windowSize <= cleanLine.length; i++) {
    const sub = cleanLine.slice(i, i + windowSize);
    const dist = levenshtein(sub, cleanAlias);
    if (dist < best.dist) best = { index: i, dist };
  }
  if (best.index === -1) return -1;
  if (cleanAlias.length <= 3) return best.dist === 0 ? best.index : -1;
  const threshold = Math.max(1, Math.floor(cleanAlias.length * 0.15));
  return best.dist <= threshold ? best.index : -1;
}

function aliasInLine(line, alias) {
  const cleanLine = cleanForFuzzy(line);
  const cleanAlias = cleanForFuzzy(alias);
  const aliasIndex = fuzzyIndexOf(cleanLine, cleanAlias);
  if (aliasIndex < 0) {
    debug(`aliasInLine: no match for "${alias}" in "${line.trim()}"`);
    return false;
  }
  const aliasLen = cleanAlias.length;
  const isLetter = (ch) => /[a-z]/.test(ch);
  const prev = cleanLine[aliasIndex - 1];
  const next = cleanLine[aliasIndex + aliasLen];
  const startOk = aliasIndex === 0 || !isLetter(prev);
  const endOk = aliasIndex + aliasLen === cleanLine.length || !isLetter(next);
  if (!(startOk && endOk)) {
    const ok = aliasLen <= 2;
    debug(`aliasInLine: boundary mismatch for "${alias}" -> okShort=${ok}`);
    return ok;
  }
  debug(`aliasInLine: matched "${alias}" in "${line.trim()}"`);
  return true;
}

function extractValueAndUnit(rawLine, alias, min, max) {

  let line = rawLine
    .replace(/([a-z]{2,})(\d)/gi, "$1 $2")   // "non" before digit → "non 3"
    .replace(/(\d)([a-z]{2,})/gi, "$1 $2");  // digit before "adults" → "5 adults"


  const cleanAlias = alias.replace(/[^a-z0-9]/gi, "").toLowerCase();
  const lineAlphaNum = line.replace(/[^a-z0-9]/gi, "").toLowerCase();
  if (cleanAlias.length > 0 && lineAlphaNum.startsWith(cleanAlias)) {
    // Walk through the line consuming exactly cleanAlias.length alphanumeric chars.
    let ai = 0;
    let li = 0;
    const lowerLine = line.toLowerCase();
    while (ai < cleanAlias.length && li < lowerLine.length) {
      if (/[a-z0-9]/i.test(lowerLine[li])) ai++;
      li++;
    }
    line = line.slice(li);
  }


  const normalizedLine = line.replace(/(\d)\s(?=\d{3}\b)/g, "$1");
  const regex = /(?<![A-Za-z0-9_])([0-9][0-9\.,]*)/g;
  let match;
  const candidates = [];

  while ((match = regex.exec(normalizedLine)) !== null) {
    const raw = match[1];
    const index = match.index;

    
    const rangePattern = /\d[\d\.,]*\s*[-–]\s*\d[\d\.,]*/g;
    let isRangePart = false;
    let rMatch;
    while ((rMatch = rangePattern.exec(normalizedLine)) !== null) {
      if (index >= rMatch.index && index < rMatch.index + rMatch[0].length) {
        isRangePart = true;
        break;
      }
    }
    if (isRangePart) {
      debug(`extractValueAndUnit: skipping "${raw}" — part of reference range`);
      continue;
    }

    candidates.push({ raw, index });
  }

  if (!candidates.length) {
    debug(`extractValueAndUnit: no number candidates in "${rawLine.trim()}"`);
    return null;
  }

  const parsedCandidates = candidates
    .map((c) => ({ ...c, value: normalizeNumberString(c.raw) }))
    .filter((c) => !Number.isNaN(c.value));

  if (!parsedCandidates.length) {
    debug(`extractValueAndUnit: no parsable numbers in "${rawLine.trim()}"`);
    return null;
  }

 
  const lineStartsWithNumber = /^\s*\d/.test(normalizedLine);
  if (!lineStartsWithNumber) {
    const firstLetterMatch = normalizedLine.match(/[A-Za-z]/);
    if (firstLetterMatch && firstLetterMatch.index > 0) {
      const filtered = parsedCandidates.filter((c) => c.index >= firstLetterMatch.index);
      if (filtered.length) {
        debug(`extractValueAndUnit: dropping ${parsedCandidates.length - filtered.length} leading number(s)`);
        parsedCandidates.length = 0;
        parsedCandidates.push(...filtered);
      }
    }
  }

  if (!parsedCandidates.length) {
    debug(`extractValueAndUnit: no candidates after filter in "${rawLine.trim()}"`);
    return null;
  }

  debug(`extractValueAndUnit: candidates=${parsedCandidates.map((c) => c.value)} in "${rawLine.trim()}"`);

  
  let bestCandidates = parsedCandidates;
  if (min != null && max != null) {
    const inRange = parsedCandidates.filter((c) => c.value >= min && c.value <= max);
    if (inRange.length) {
      bestCandidates = inRange;
      debug(`extractValueAndUnit: using in-range candidates ${inRange.map((c) => c.value)}`);
    }
    
    const hasRange = /\d\s*[-–]\s*\d/.test(normalizedLine);
    if (hasRange && !inRange.length) {
      debug(`extractValueAndUnit: reference range line with no in-range value; skipping`);
      return null;
    }
  }

  const chosen = bestCandidates[0];
  const value = chosen.value;

  if (min != null && max != null && value > max * 3) {
    for (const divisor of [1000, 100, 10]) {
      const attempt = value / divisor;
      if (attempt >= min && attempt <= max) {
        debug(`extractValueAndUnit: corrected ${value} -> ${attempt} (÷${divisor})`);
        return { value: attempt, unit: null };
      }
    }
  }

  const unitMatch = rawLine.match(/(mg\/?dl|mmol\/?l|g\/?dl|µmol\/?l|umol\/?l)/i);
  const unit = unitMatch ? unitMatch[0].toLowerCase() : null;

  return { value, unit };
}

function classify(value, min, max) {
  if (min == null || max == null) return "unknown";
  if (value >= min && value <= max) return "normal";
  const range = max - min;
  const diff = value < min ? min - value : value - max;
  if (diff / range <= 0.2) return "moderate";
  return "abnormal";
}

const aliasToTestName = {};
for (const [testName, entry] of Object.entries(testDictionary)) {
  for (const a of [testName, ...(entry.aliases || [])]) {
    aliasToTestName[a.toLowerCase()] = testName;
  }
}

module.exports = async function parseLabReport(text, memberId) {
  const lines = text.split("\n");
  const testDate = new Date().toISOString().slice(0, 10);

  const findValueInLines = (startIndex, alias, min, max) => {
    for (let offset = 0; offset <= 2; offset++) {
      const idx = startIndex + offset;
      if (idx >= lines.length) break;

      const candidateLine = lines[idx].toLowerCase();

      if (offset > 0) {
        const isOtherTest = Object.entries(testDictionary).some(([tName, entry]) => {
          if (tName === aliasToTestName[alias]) return false;
          return [tName, ...(entry.aliases || [])].some((a) =>
            aliasInLine(candidateLine, a.toLowerCase())
          );
        });
        if (isOtherTest) {
          debug(`findValueInLines: line ${idx + 1} is another test, stopping for "${alias}"`);
          break;
        }
      }

      const extracted = extractValueAndUnit(candidateLine, alias, min, max);
      if (extracted) {
        debug(`findValueInLines: value found on line ${idx + 1} (offset +${offset})`);
        return extracted;
      }

      // On lookahead lines: if this line had digits but yielded no result, stop.
      if (offset > 0 && /\d/.test(candidateLine)) {
        debug(`findValueInLines: line ${idx + 1} has digits but no result; stopping`);
        break;
      }
    }
    return null;
  };

  // Track processed tests to prevent duplicate DB writes.
  const seen = new Set();

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    if (DEBUG) debug(`line ${i + 1}: "${rawLine}"`);

    // aliasInLine uses cleanForFuzzy which strips all punctuation/spaces, so it
    // handles jammed columns like "T395.6Non-Pregnant" without pre-normalization.
    const line = rawLine.toLowerCase();

    for (const [testName, entry] of Object.entries(testDictionary)) {
      if (seen.has(testName)) continue;

      const aliases = [testName, ...(entry.aliases || [])];
      const min = entry.normal_min;
      const max = entry.normal_max;

      for (const alias of aliases) {
        const lowerAlias = alias.toLowerCase();
        if (!aliasInLine(line, lowerAlias)) continue;

        debug(`matched alias "${alias}" (test=${testName}) on line ${i + 1}: "${rawLine.trim()}"`);

        const extracted = findValueInLines(i, lowerAlias, min, max);
        if (!extracted) {
          debug(`no value extracted for "${alias}" (test=${testName}) on line ${i + 1}`);
          continue;
        }

        const { value, unit } = extracted;
        const status = classify(value, min, max);

        seen.add(testName);

        const [existing] = await db.query(
          `SELECT test_id FROM test_results
           WHERE member_id = ? AND test_name = ? AND test_date = ? LIMIT 1`,
          [memberId, testName, testDate]
        );

        if (existing.length > 0) {
          await db.query(
            `UPDATE test_results
             SET value = ?, unit = ?, normal_min = ?, normal_max = ?, status = ?
             WHERE test_id = ?`,
            [value, unit, min, max, status, existing[0].test_id]
          );
        } else {
          await db.query(
            `INSERT INTO test_results
             (member_id, test_name, value, unit, normal_min, normal_max, status, test_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [memberId, testName, value, unit, min, max, status, testDate]
          );
        }

        break;
      }
    }
  }
};