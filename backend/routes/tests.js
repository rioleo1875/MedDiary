const express = require("express");
const router = express.Router();
const db = require("../config/db");
router.get("/test/:userId", async (req, res) => {
    const { 
        member_id,
        test_name,
        value,
        unit,
        normal_min,
        normal_max,
        test_date
     } = req.body;
     
     let status = 'normal';
        if (value < normal_min || value > normal_max) {
            status = 'abnormal';
        }
    try {        const [result] = await db.query(
            "INSERT INTO tests (member_id, test_name, value, unit, normal_min, normal_max, test_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [member_id, test_name, value, unit, normal_min, normal_max, test_date, status]
        );
        res.json({ message: "Test result added successfully", testId: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add test result" }); 
    }
});

module.exports = router;
