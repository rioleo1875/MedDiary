const db = require("../config/db");

module.exports = async function parseLabReport(text, memberId) {

  const lines = text.split("\n");

  for (let raw of lines) {

    const line = raw.trim();

    // look for reference range
    const rangeMatch = line.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);
    if (!rangeMatch) continue;

    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);

    // extract numbers
    const nums = line.match(/\d+\.?\d*/g);
    if (!nums || nums.length < 2) continue;

    // the value must appear BEFORE the range
    const value = parseFloat(nums[0]);

    // reject trimester / numbered lines
    if (/^(1st|2nd|3rd|\d+\))/i.test(line)) continue;

    // extract test name
    const valueIndex = line.indexOf(nums[0]);
    let testName = line.substring(0, valueIndex).trim();

    // remove weird characters
    testName = testName.replace(/[^\w\s]/g, "");

    if (testName.length < 3) continue;

    let status = "normal";
    if (value < min || value > max) status = "abnormal";

    await db.query(
      `INSERT INTO test_results
       (member_id, test_name, value, normal_min, normal_max, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [memberId, testName.toLowerCase(), value, min, max, status]
    );

    console.log("Inserted:", testName, value);
  }
};