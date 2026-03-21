const express = require("express");
const router = express.Router();
const db = require("../config/db");


function classify(value, min, max) {
  if (min == null || max == null) return "unknown";
  if (value >= min && value <= max) return "normal";
  const range = max - min;
  const diff = value < min ? min - value : value - max;
  return diff / range <= 0.2 ? "moderate" : "abnormal";
}

function sanityWarning(value, min, max, testName) {
  if (min == null || max == null) return null;
  const range = max - min;
  const lowerBound = min - range * 10;
  const upperBound = max + range * 10;
  if (value < lowerBound || value > upperBound) {
    return `${value} looks unusual for ${testName} (expected range: ${min}–${max}). Please double-check before saving.`;
  }
  return null;
}

router.post("/add", async (req, res) => {
  const { member_id, test_name, value, unit, normal_min, normal_max, test_date } = req.body;

  if (value == null || isNaN(parseFloat(value))) {
    return res.status(400).json({ error: "value must be a number" });
  }

  const numericValue = parseFloat(value);
  const status = classify(numericValue, normal_min, normal_max);

  try {
    await db.query(
      `INSERT INTO test_results
       (member_id, test_name, value, unit, normal_min, normal_max, status, test_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [member_id, test_name, numericValue, unit, normal_min, normal_max, status, test_date]
    );
    res.json({ message: "Test result added successfully" });
  } catch (error) {
    console.error("POST /tests/add error:", error);
    res.status(500).json({ error: "Failed to add test result" });
  }
});


router.get("/member/:memberId", async (req, res) => {
  const { memberId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT
         test_id, member_id, test_name, value, unit,
         normal_min, normal_max, status, test_date,
         edited_by_user, edited_at
       FROM test_results
       WHERE member_id = ?
       ORDER BY test_date DESC, test_name ASC`,
      [memberId]
    );

    
    const grouped = {};
    for (const row of rows) {
      const date = row.test_date;
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(row);
    }

    const groupedByDate = Object.entries(grouped).map(([date, results]) => ({
      date,
      results,
    }));

    res.json({
      memberId,
      totalTests: rows.length,
      groupedByDate,
    });
  } catch (error) {
    console.error("GET /tests/member/:memberId error:", error);
    res.status(500).json({ error: "Failed to fetch test results" });
  }
});


router.get("/single/:testId", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM test_results WHERE test_id = ? LIMIT 1`,
      [req.params.testId]
    );
    if (!rows.length) return res.status(404).json({ error: "Result not found" });
    res.json(rows[0]);
  } catch (error) {
    console.error("GET /tests/single/:testId error:", error);
    res.status(500).json({ error: "Failed to fetch result" });
  }
});

router.patch("/:testId", async (req, res) => {
  const { testId } = req.params;
  const { value, unit, confirm } = req.body;

  // Validate
  if (value == null || value === "") {
    return res.status(400).json({ error: "value is required" });
  }
  const numericValue = parseFloat(value);
  if (isNaN(numericValue)) {
    return res.status(400).json({ error: "value must be a number" });
  }

  try {
    const [rows] = await db.query(
      `SELECT test_id, test_name, value AS old_value, unit AS old_unit,
              status AS old_status, normal_min, normal_max, member_id
       FROM test_results WHERE test_id = ? LIMIT 1`,
      [testId]
    );
    if (!rows.length) return res.status(404).json({ error: "Result not found" });

    const existing = rows[0];
    const { normal_min, normal_max, test_name } = existing;

    // Sanity check — warn but don't block unless user hasn't confirmed
    const warning = sanityWarning(numericValue, normal_min, normal_max, test_name);
    if (warning && !confirm) {
      return res.status(200).json({ warning, requiresConfirmation: true });
    }

    const newStatus = classify(numericValue, normal_min, normal_max);
    const newUnit = unit !== undefined ? unit : existing.old_unit;

    // Save old value to audit trail before overwriting
    await db.query(
      `INSERT INTO edit_history
         (test_id, member_id, test_name, old_value, old_unit, old_status, changed_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [testId, existing.member_id, test_name, existing.old_value, existing.old_unit, existing.old_status]
    );

    // Update the result
    await db.query(
      `UPDATE test_results
       SET value = ?, unit = ?, status = ?, edited_by_user = 1, edited_at = NOW()
       WHERE test_id = ?`,
      [numericValue, newUnit, newStatus, testId]
    );

    res.json({
      message: "Result updated",
      test_id: testId,
      new_value: numericValue,
      new_unit: newUnit,
      new_status: newStatus,
      warning: warning || null,
    });
  } catch (error) {
    console.error("PATCH /tests/:testId error:", error);
    res.status(500).json({ error: "Failed to update result" });
  }
});


router.get("/history/:testId", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM edit_history WHERE test_id = ? ORDER BY changed_at DESC`,
      [req.params.testId]
    );
    res.json(rows);
  } catch (error) {
    console.error("GET /tests/history/:testId error:", error);
    res.status(500).json({ error: "Failed to fetch edit history" });
  }
});


router.delete("/:testId", async (req, res) => {
  try {
    const [result] = await db.query(
      `DELETE FROM test_results WHERE test_id = ?`,
      [req.params.testId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Result not found" });
    }
    res.json({ message: "Result deleted" });
  } catch (error) {
    console.error("DELETE /tests/:testId error:", error);
    res.status(500).json({ error: "Failed to delete result" });
  }
});

module.exports = router;