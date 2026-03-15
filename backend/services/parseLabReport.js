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

function scaleValueIntoRange(value, min, max) {
  if (min == null || max == null || isNaN(value)) return value;

  // If it's already reasonably close to the range, keep it.
  if (value <= max * 2) return value;

  // If the range is small (e.g. hormone values) and the parsed number is large,
  // it's commonly an OCR decimal-missing issue: e.g. "310" should be "3.10".
  if (max < 20 && value >= 100) {
    const scaled100 = value / 100;
    if (scaled100 >= min / 5 && scaled100 <= max * 5) return scaled100;

    const scaled1000 = value / 1000;
    if (scaled1000 >= min / 5 && scaled1000 <= max * 5) return scaled1000;
  }

  return value;
}

const TEST_NAME_CANONICAL = {
  hdl: "HDL",
  ldl: "LDL",
  hba1c: "A1c",
  hb: "Hb",
  hct: "Hct",
  wbc: "WBC",
  rbc: "RBC",
  platelets: "Platelets",
  glucose: "Glucose",
  a1c: "A1c",
  tsh: "TSH",
  t4: "T4",
  t3: "T3",
  crp: "CRP",
  creatinine: "Creatinine",
  cr: "Creatinine",
  bun: "BUN",
  uric: "Uric Acid",
  calcium: "Calcium",
  potassium: "Potassium",
  sodium: "Sodium",
  chloride: "Chloride",
  triglycerides: "Triglycerides",
  cholesterol: "Cholesterol",
  albumin: "Albumin",
  ferritin: "Ferritin",
  vitamin: "Vitamin",
  bilirubin: "Bilirubin",
  alt: "ALT",
  ast: "AST",
  ggt: "GGT",
  alp: "ALP",
  immunoglobulin: "Immunoglobulin",
  ige: "IgE",
  igg: "IgG",
  iga: "IgA",
  igm: "IgM",
  thyroid: "Thyroid",
  hemoglobin: "Hemoglobin",
  esr: "ESR",
  egfr: "eGFR",
  bicarbonate: "Bicarbonate",
  magnesium: "Magnesium",
  phosphate: "Phosphate",
  "total cholesterol": "Total Cholesterol",
  "ldl cholesterol": "LDL Cholesterol",
  "hdl cholesterol": "HDL Cholesterol",
  "hemoglobin a1c": "Hemoglobin A1c",
  "free t4": "Free T4",
  "free t3": "Free T3",
};

function extractKnownTestName(testName) {
  if (!testName) return null;
  const lower = testName.toLowerCase();

  // Prefer phrase matches first (multi-word terms)
  const phrases = Object.keys(TEST_NAME_CANONICAL).filter((k) => k.includes(" "));
  for (const phrase of phrases) {
    if (lower.includes(phrase)) return TEST_NAME_CANONICAL[phrase];
  }

  // Then match single tokens
  const tokens = lower.split(/\s+/);
  for (const token of tokens) {
    if (TEST_NAME_CANONICAL[token]) return TEST_NAME_CANONICAL[token];
  }

  return null;
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

  // If it’s too generic (e.g., “High”), skip it.
  if (words.length === 1 && ignoreWords.has(words[0])) return false;

  // If the line doesn’t have a unit/range, require a known test keyword.
  if (!hasUnit && !hasRange) {
    const found = extractKnownTestName(testName);
    return Boolean(found);
  }

  // If the line has a unit/range, accept it even if the test name isn't in the known list,
  // because many lab PDFs use short abbreviations (e.g., "Na", "K", "T4").
  // Still, prefer canonical test names when possible.
  const found = extractKnownTestName(testName);
  if (found) return true;

  // Permit unknown test names if we detected a unit/range, but reject very generic words.
  if (hasUnit || hasRange) {
    return words.length > 0 && !ignoreWords.has(words[0]);
  }

  return false;
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

  // Find all numeric tokens (including < or >)
  const numberMatches = Array.from(line.matchAll(/([<>]?\d+(?:\.\d+)?)/g));
  if (!numberMatches.length) return null;

  const rangeMatch = line.match(/([<>]?\d+(?:\.\d+)?)(?:\s*[-–]\s*([<>]?\d+(?:\.\d+)?))/);
  const rangeStartIndex = rangeMatch ? rangeMatch.index : -1;

  const unitMatch = line.match(/\b(mg\/dl|g\/dl|mmol\/l|u\/ml|ng\/ml|pg\/ml|%|µg\/l|ng\/dl|mmol\/l|u\/l|iu\/l)\b/i);
  const unitIndex = unitMatch ? unitMatch.index : -1;
  const unit = unitMatch ? unitMatch[1] : null;

  const isLikelyNonValue = (match) => {
    const valueStr = match[1];
    const idx = match.index;
    if (idx == null) return false;

    // ignore years (e.g., 2023)
    const num = parseFloat(valueStr.replace(/[<>]/g, ""));
    if (num >= 1900 && num <= 2100) return true;

    // ignore page numbers (page 1, pg 2)
    const before = line.slice(Math.max(0, idx - 10), idx).toLowerCase();
    if (/\b(pg|page|p)\s*$/.test(before)) return true;

    // ignore "no." or "n°" patterns
    if (/\b(no|n)\s*$/.test(before)) return true;

    return false;
  };

  const findValueBefore = (boundaryIndex) => {
    for (let i = numberMatches.length - 1; i >= 0; i--) {
      const match = numberMatches[i];
      if (match.index == null) continue;
      if (match.index >= boundaryIndex) continue;
      if (isLikelyNonValue(match)) continue;
      return match;
    }
    return null;
  };

  let valueMatch = null;

  // Prefer the number immediately before the unit if available
  if (unitIndex >= 0) {
    valueMatch = findValueBefore(unitIndex);
  }

  // Otherwise prefer the number before the range
  if (!valueMatch && rangeStartIndex >= 0) {
    valueMatch = findValueBefore(rangeStartIndex);
  }

  // Otherwise fall back to first numeric token that doesn't look like a date/page
  if (!valueMatch) {
    valueMatch = numberMatches.find((m) => !isLikelyNonValue(m));
  }

  if (!valueMatch) return null;

  let value = parseFloat(valueMatch[1].replace(/[<>]/g, ""));
  if (isNaN(value)) return null;

  // Extract test name (text before the chosen value)
  let testName = line.slice(0, valueMatch.index).trim();

  // Clean OCR garbage
  testName = testName
    .replace(/^\d+[\.\)]?\s*/, "")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim();

  // If the value appears at the start of the line, the test name may come after it.
  if ((!testName || testName.length < 2) && valueMatch.index === 0) {
    const afterValue = line.slice(valueMatch.index + valueMatch[0].length).trim();
    const altName = afterValue
      .replace(/^[^a-zA-Z]*/g, "")
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .trim();

    if (altName && altName.length >= 2) {
      testName = altName;
    }
  }

  if (!testName || testName.length < 2) return null;

  // Prefer known medical test keywords (strict matching)
  const detectedKeyword = extractKnownTestName(testName);
  if (detectedKeyword) {
    testName = detectedKeyword;
  }

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

  // If the value is clearly outside the range, attempt to fix it by scaling.
  value = scaleValueIntoRange(value, min, max);

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
  const inserted = [];

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

    inserted.push({ testName, value, unit, min, max, status, testDate });
  }

  return {
    insertedCount: inserted.length,
    inserted,
  };
};