const db = require("../config/db");

function normalizeLine(line) {
  // Normalize common OCR artifacts and whitespace
  return line
    .replace(/\r/g, "")
    .replace(/[\t\u00A0]+/g, " ")
    .replace(/[\u2013\u2014]/g, "-") // en-dash/em-dash => hyphen
    // Common OCR confusion: O vs 0, comma decimals
    .replace(/(\d),\s*(\d)/g, "$1.$2")
    .replace(/O(?=\d)/g, "0")
    .replace(/(?<=\d)O/g, "0")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function matchCommonTestName(rawName) {
  if (!rawName) return rawName;

  const denyList = new Set(["HIGH", "LOW", "NORMAL", "DIABETIC", "FASTING", "POSTPRANDIAL"]);
  const upper = rawName.toUpperCase().trim();
  if (denyList.has(upper)) return rawName;

  const candidates = [
    "HDL",
    "LDL",
    "Hb",
    "Hct",
    "WBC",
    "RBC",
    "Platelets",
    "Glucose",
    "A1c",
    "TSH",
    "T4",
    "T3",
    "CRP",
    "Creatinine",
    "BUN",
    "Uric Acid",
    "Calcium",
    "Potassium",
    "Sodium",
    "Chloride",
    "Triglycerides",
    "Cholesterol",
    "Albumin",
    "Ferritin",
    "Vitamin D",
    "TSH",
    "Free T4",
    "Free T3",
    "Bilirubin",
    "ALT",
    "AST",
    "GGT",
    "ALP",
    "Immunoglobulin",
    "IgE",
    "IgG",
    "IgA",
    "IgM",
    "Thyroid",
    "Hemoglobin",
    "Hemoglobin A1c",
    "CRP",
    "ESR",
    "Sodium",
    "Potassium",
    "Chloride",
    "Bicarbonate",
    "Magnesium",
    "Phosphate",
    "eGFR",
  ];

  const normalized = rawName.toUpperCase();
  let best = { score: Infinity, name: rawName };
  for (const target of candidates) {
    const dist = levenshtein(normalized, target.toUpperCase());
    const norm = dist / Math.max(normalized.length, target.length);
    if (norm < best.score) {
      best = { score: norm, name: target };
    }
  }

  // Accept replacement for short/unclear names
  if (best.score <= 0.5 && rawName.length <= 6) {
    return best.name;
  }
  return rawName;
}

function isLikelyTestName(testName) {
  if (!testName) return false;

  const knownKeywords = new Set([
    "hdl",
    "ldl",
    "hb",
    "hct",
    "wbc",
    "rbc",
    "platelets",
    "glucose",
    "a1c",
    "tsh",
    "t4",
    "t3",
    "crp",
    "creatinine",
    "bun",
    "uric",
    "calcium",
    "potassium",
    "sodium",
    "chloride",
    "triglycerides",
    "cholesterol",
    "albumin",
    "ferritin",
    "vitamin",
    "bilirubin",
    "alt",
    "ast",
    "ggt",
    "alp",
    "immunoglobulin",
    "ige",
    "igg",
    "iga",
    "igm",
    "hemoglobin",
    "thyroid",
    "crp",
    "esr",
    "egfr",
  ]);

  const words = testName
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  for (const w of words) {
    if (knownKeywords.has(w)) return true;
    if (/^[A-Z]{2,}$/.test(w)) return true; // e.g. TSH, RBC
    if (/^\d+[a-zA-Z]+$/.test(w)) return true; // e.g. 25(OH)
  }

  // If the name is long (>3 words) but none of the tokens look medical, reject it.
  if (words.length > 3) return false;

  return true;
}

function isLikelyTestLine(testName, hasUnit, hasRange) {
  if (!testName) return false;

  const ignoreWords = new Set([
    "high",
    "low",
    "normal",
    "diabetic",
    "fasting",
    "postprandial",
    "profile",
    "panel",
    "result",
    "results",
    "value",
    "summary",
    "report",
  ]);

  const words = testName
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  // If the name is too short and we don't have a unit/range, it's likely not a test line
  if (!hasUnit && !hasRange && words.length <= 1) {
    const token = words[0] || "";
    if (!token || ignoreWords.has(token)) return false;
  }

  // Disallow common header keywords as the only word
  if (words.length === 1 && ignoreWords.has(words[0])) return false;

  // If unit/range is not present, require a known medical keyword
  if (!hasUnit && !hasRange && !isLikelyTestName(testName)) return false;

  // If it contains too many short tokens, reject it (likely OCR garbage)
  if (words.length > 4 && words.filter((w) => w.length <= 1).length > 1) return false;

  return true;
}

function parseLine(line) {

  if (!line) return null;

  line = normalizeLine(line);
  if (!line) return null;

  const lower = line.toLowerCase();

  // Ignore header / footer lines
  if (
    lower.includes("reference") ||
    lower.includes("range") ||
    lower.includes("method") ||
    lower.includes("reported") ||
    lower.includes("page")
  ) {
    return null;
  }

  // Ignore lines that only contain ranges
  if (/^\D*\d+\s*-\s*\d+\D*$/.test(line)) {
    return null;
  }

  // Find test value (first number in line)
  const valueMatch = line.match(/\b(\d+\.?\d*)\b/);
  if (!valueMatch) return null;

  const value = parseFloat(valueMatch[1]);

  // Extract test name (text before value)
  let testName = line.slice(0, valueMatch.index).trim();

  // Clean OCR garbage
  testName = testName
    .replace(/^\d+[\.\)]?\s*/, "")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim();

  if (!testName || testName.length < 2) return null;

  testName = matchCommonTestName(testName);

  // Detect reference range if present
  //  - standard ranges: 70 - 110
  //  - inequality: < 5, > 10
  const dashRangeMatch = line.match(/([<>]?\d+(?:\.\d+)?)(?:\s*[-–]\s*([<>]?\d+(?:\.\d+)?))/);
  const inequalityMatch = line.match(/([<>]\s*\d+(?:\.\d+)?)/);

  let min = null;
  let max = null;

  const normalizeBound = (raw) => {
    if (!raw) return null;
    const cleaned = raw.trim();
    const isUpper = cleaned.startsWith("<");
    const isLower = cleaned.startsWith(">");
    const number = parseFloat(cleaned.replace(/[<>\s]/g, ""));
    if (isNaN(number)) return null;
    return { number, isUpper, isLower };
  };

  if (dashRangeMatch) {
    const a = normalizeBound(dashRangeMatch[1]);
    const b = normalizeBound(dashRangeMatch[2]);

    if (a && b) {
      // Regular min-max range
      if (!a.isUpper && !a.isLower) min = a.number;
      if (!b.isUpper && !b.isLower) max = b.number;

      // Handle weird cases like "< 3 - 5" or "3 - >5"
      if (a.isUpper) max = a.number;
      if (a.isLower) min = a.number;
      if (b.isUpper) max = b.number;
      if (b.isLower) min = b.number;
    }
  } else if (inequalityMatch) {
    const bound = normalizeBound(inequalityMatch[1]);
    if (bound) {
      if (bound.isUpper) max = bound.number;
      if (bound.isLower) min = bound.number;
    }
  }

  // Detect unit (common clinical units)
  let unit = null;
  const unitMatch = line.match(/\b(mg\/dl|g\/dl|mmol\/l|u\/ml|ng\/ml|pg\/ml|%|µg\/l|ng\/dl|mmol\/l|u\/l|iu\/l)\b/i);

  if (unitMatch) {
    unit = unitMatch[1];
  }

  // Determine if this looks like a valid test line
  const isValid = isLikelyTestLine(testName, Boolean(unit), Boolean(min !== null || max !== null));
  if (!isValid) return null;

  return {
    testName,
    value,
    unit,
    min,
    max
  };
}


module.exports = async function parseLabReport(text, memberId) {
  console.log("=========== OCR TEXT ===========");
  console.log(text);
  console.log("================================");

  text = text || "";
  const lines = text.split("\n");

  for (let line of lines) {
    const parsed = parseLine(line);

    if (!parsed) {
      console.log("Skipping:", line);
      continue;
    }

    const { testName, value, unit, min, max } = parsed;

    let status = "normal";
    if (min !== null && value < min) status = "abnormal";
    if (max !== null && value > max) status = "abnormal";

    const testDate = new Date().toISOString().slice(0, 10);

    console.log("Parsed:", { testName, value, unit, min, max, status, testDate });

    await db.query(
      `INSERT INTO test_results
       (member_id, test_name, value, unit, normal_min, normal_max, status, test_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [memberId, testName, value, unit, min, max, status, testDate]
    );
  }
};