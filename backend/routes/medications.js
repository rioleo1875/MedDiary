const express = require("express");
const router = express.Router();
const db = require("../config/db");

function getUserId(req) {
  return parseInt(req.headers["x-user-id"], 10);
}

router.get("/:memberId", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { memberId } = req.params;

    // Verify member belongs to this user
    const [ownerCheck] = await db.query(
      `SELECT member_id FROM family_members WHERE member_id = ? AND user_id = ?`,
      [memberId, userId]
    );
    if (ownerCheck.length === 0) {
      return res.status(403).json({ error: "Access denied" });
    }

    const [rows] = await db.query(
      `SELECT med_id, med_name, dosage, frequency, start_date, end_date
       FROM medications
       WHERE member_id = ?
       ORDER BY med_name ASC`,
      [memberId]
    );

    res.json(rows);
  } catch (err) {
    console.error("GET /api/medications/:memberId error:", err);
    res.status(500).json({ error: "Failed to fetch medications" });
  }
});

router.post("/", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { member_id, med_name, dosage, frequency, start_date, end_date } =
      req.body;

    if (!member_id || !med_name) {
      return res.status(400).json({ error: "member_id and med_name are required" });
    }

    const [ownerCheck] = await db.query(
      `SELECT member_id FROM family_members WHERE member_id = ? AND user_id = ?`,
      [member_id, userId]
    );
    if (ownerCheck.length === 0) {
      return res.status(403).json({ error: "Access denied" });
    }

    const [result] = await db.query(
      `INSERT INTO medications (member_id, med_name, dosage, frequency, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [member_id, med_name, dosage ?? null, frequency ?? null,
       start_date ?? null, end_date ?? null]
    );

    res.status(201).json({ message: "Medication added", med_id: result.insertId });
  } catch (err) {
    console.error("POST /api/medications error:", err);
    res.status(500).json({ error: "Failed to add medication" });
  }
});

router.delete("/:medId", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Verify ownership via join
    const [rows] = await db.query(
      `SELECT m.med_id FROM medications m
       JOIN family_members fm ON m.member_id = fm.member_id
       WHERE m.med_id = ? AND fm.user_id = ?`,
      [req.params.medId, userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Medication not found" });
    }

    await db.query(`DELETE FROM medications WHERE med_id = ?`, [req.params.medId]);
    res.json({ message: "Medication deleted" });
  } catch (err) {
    console.error("DELETE /api/medications/:medId error:", err);
    res.status(500).json({ error: "Failed to delete medication" });
  }
});

module.exports = router;