const express = require("express");
const router = express.Router();
const db = require("../config/db");


router.post("/add", async (req, res) => {
  const {
    member_id,
    test_name,
    value,
    unit,
    normal_min,
    normal_max,
    test_date
  } = req.body;

  let status = "normal";

  if (value < normal_min || value > normal_max) {
    status = "abnormal";
  }

  try {
    await db.query(
      `INSERT INTO test_results 
      (member_id, test_name, value, unit, normal_min, normal_max, status, test_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [member_id, test_name, value, unit, normal_min, normal_max, status, test_date]
    );

    res.json({ message: "Test result added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add test result" });
  }
});

module.exports = router;

router.get("/member/:memberId", async (req, res) => {
  const { memberId } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT * FROM test_results WHERE member_id = ? ORDER BY test_date DESC",
      [memberId]
    );
    res.json({
      memberId,
      totalTests: rows.length,
      results: rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch test results" });
  }
});
