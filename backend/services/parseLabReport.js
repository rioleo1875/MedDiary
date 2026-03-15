const db = require("../config/db");
const testDictionary = require("./testDictionary");

const DEBUG = process.env.LAB_PARSE_DEBUG === "1";
function debug(...args) {
  if (DEBUG) console.log("[parseLabReport]", ...args);
}

function normalizeNumberString(numStr) {
  // Strip whitespace inside the number (e.g. "1 234" -> "1234")
  numStr = numStr.replace(/\s+/g, "");

  // Handle comma/decimal formatting (e.g. "1,234.56" or "1.234,56").
  const hasComma = numStr.includes(",");
  const hasDot = numStr.includes(".");

  if (hasComma && hasDot) {
    // Assume the last separator is decimal
    if (numStr.lastIndexOf(",") > numStr.lastIndexOf(".")) {
      // European style: 1.234,56
      numStr = numStr.replace(/\./g, "").replace(/,/g, ".");
    } else {
      // US style: 1,234.56
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

  // For short aliases, require exact match to avoid collisions (e.g., "rbs" vs "fbs").
  if (cleanAlias.length <= 3) {
    return best.dist === 0 ? best.index : -1;
  }

  const threshold = Math.max(1, Math.floor(cleanAlias.length * 0.15));
  return best.dist <= threshold ? best.index : -1;
}

function aliasInLine(line, alias) {
  const cleanLine = cleanForFuzzy(line);
  const cleanAlias = cleanForFuzzy(alias);
  const aliasIndex = fuzzyIndexOf(cleanLine, cleanAlias);

  if (aliasIndex < 0) {
    debug(`aliasInLine: no match for "${alias}" (clean="${cleanAlias}") in "${line.trim()}"`);
    return false;
  }

  const aliasLen = cleanAlias.length;
  const isLetter = (ch) => /[a-z]/.test(ch);
  const prev = cleanLine[aliasIndex - 1];
  const next = cleanLine[aliasIndex + aliasLen];

  // Allow aliases to be preceded/followed by digits or punctuation (common in OCR output),
  // but avoid matching inside larger words.
  const startOk = aliasIndex === 0 || !isLetter(prev);
  const endOk =
    aliasIndex + aliasLen === cleanLine.length ||
    !isLetter(next);

  // Treat aliases as whole words so a small code (e.g., "ast") doesn't match inside "fasting".
  if (!(startOk && endOk)) {
    // Allow some short codes (t3/t4) to match without strict boundaries.
    const ok = aliasLen <= 2;
    debug(
      `aliasInLine: boundary mismatch for "${alias}" (index=${aliasIndex}, len=${aliasLen}) in "${line.trim()}" -> okShort=${ok}`
    );
    return ok;
  }

  debug(`aliasInLine: matched "${alias}" (clean="${cleanAlias}") in "${line.trim()}"`);
  return true;
}

function extractValueAndUnit(line, alias, min, max) {
  // Normalize common grouping spaces (e.g. "1 520" -> "1520") without affecting ranges like "70 - 100".
  const normalizedLine = line.replace(/(\d)\s(?=\d{3}\b)/g, "$1");

  // Match numbers that are not part of a surrounding word (e.g., avoid matching the "3" in "T3").
  const regex = /(?<![A-Za-z0-9_])([0-9][0-9\.,]*)/g;
  let match;
  const candidates = [];

  while ((match = regex.exec(normalizedLine)) !== null) {
    const raw = match[1];
    const index = match.index;
    const endIndex = index + raw.length;

    // Skip numbers that are likely part of a range (e.g., "70 - 100")
    const after = normalizedLine.slice(endIndex, endIndex + 2);
    const before = normalizedLine.slice(Math.max(0, index - 2), index);
    if (after.includes("-") || before.includes("-")) continue;

    candidates.push({ raw, index });
  }

  if (!candidates.length) {
    debug(`extractValueAndUnit: no number candidates found in "${line.trim()}"`);
    return null;
  }

  // Parse numeric candidates for the line.
  const parsedCandidates = candidates
    .map((c) => {
      const value = normalizeNumberString(c.raw);
      return { ...c, value };
    })
    .filter((c) => !Number.isNaN(c.value));

  if (!parsedCandidates.length) {
    debug(`extractValueAndUnit: no parsable numbers in "${line.trim()}"`);
    return null;
  }

  // Ignore leading numeric tokens that are likely table row numbers or bullet points.
  const firstLetterMatch = normalizedLine.match(/[A-Za-z]/);
  if (firstLetterMatch) {
    const firstLetterIndex = firstLetterMatch.index;
    if (firstLetterIndex > 0) {
      const filtered = parsedCandidates.filter((c) => c.index >= firstLetterIndex);
      if (filtered.length) {
        debug(
          `extractValueAndUnit: dropping ${parsedCandidates.length - filtered.length} leading numeric candidate(s) before first letter`
        );
        parsedCandidates.length = 0;
        parsedCandidates.push(...filtered);
      }
    }
  }

  if (!parsedCandidates.length) {
    debug(`extractValueAndUnit: no candidates after removing leading numbers in "${line.trim()}"`);
    return null;
  }

  debug(`extractValueAndUnit: candidates=${parsedCandidates.map((c) => c.value).join(",")} in "${line.trim()}"`);

  // Prefer a candidate whose value falls within the expected range (if provided).
  let bestCandidates = parsedCandidates;
  let inRange = parsedCandidates;
  if (min != null && max != null) {
    inRange = parsedCandidates.filter((c) => c.value >= min && c.value <= max);
    if (inRange.length) {
      bestCandidates = inRange;
      debug(`extractValueAndUnit: using in-range candidates ${inRange.map((c) => c.value).join(",")} for expected range ${min}-${max}`);
    }

    // If the line looks like a reference range (e.g. "70 - 100") and we didn't find any
    // values within the expected range, don't treat the first number as the test result.
    const hasRange = /\d\s*-\s*\d/.test(normalizedLine);
    if (hasRange && inRange.length === 0) {
      debug(`extractValueAndUnit: line appears to contain a reference range and no in-range values; skipping: "${line.trim()}"`);
      return null;
    }
  }

  // Prefer the first candidate (usually the result number), after filtering.
  const chosen = bestCandidates[0];
  const value = chosen.value;

  // Try to fix common OCR decimal-loss issues (e.g. 7050 should be 70.50)
  if (min != null && max != null && value > max * 3) {
    for (const divisor of [1000, 100, 10]) {
      const attempt = value / divisor;
      if (attempt >= min && attempt <= max) {
        debug(
          `extractValueAndUnit: corrected ${value} -> ${attempt} using divisor ${divisor} for range ${min}-${max}`
        );
        return { value: attempt, unit: null };
      }
    }
  }

  const unitMatch = line.match(/(mg\/?dl|mmol\/?l|g\/?dl|µmol\/?l|umol\/?l)/i);
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

module.exports = async function parseLabReport(text, memberId) {
  const lines = text.split("\n");

  const testDate = new Date().toISOString().slice(0,10);

  const findValueInLines = (startIndex, alias, min, max) => {
    // Try the current line first, then a small window of subsequent lines.
    for (let offset = 0; offset < 3; offset++) {
      const idx = startIndex + offset;
      if (idx >= lines.length) break;

      const candidateLine = lines[idx].toLowerCase();
      const extracted = extractValueAndUnit(candidateLine, alias, min, max);
      if (extracted) return extracted;
    }
    return null;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];

    if (DEBUG) debug(`line ${i + 1}: "${rawLine}"`);

    const line = rawLine.toLowerCase();

    for (const [testName, entry] of Object.entries(testDictionary)) {
      const aliases = [testName, ...(entry.aliases || [])];
      const min = entry.normal_min;
      const max = entry.normal_max;

      for (const alias of aliases) {
        const lowerAlias = alias.toLowerCase();
        if (!aliasInLine(line, lowerAlias)) continue;

        debug(`matched alias "${alias}" (test=${testName}) on line ${i + 1}: "${rawLine.trim()}"`);

        const extracted = findValueInLines(i, lowerAlias, min, max);
        if (!extracted) {
          debug(`no value extracted for alias "${alias}" (test=${testName}) on line ${i + 1}`);
          continue;
        }

        const { value, unit } = extracted;
        const status = classify(value, min, max);

        // If a result already exists for this member/date/test, update it instead of inserting a duplicate.
        const [existing] = await db.query(
          `SELECT test_id FROM test_results WHERE member_id = ? AND test_name = ? AND test_date = ? LIMIT 1`,
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