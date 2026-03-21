const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Add emergency contact
router.post("/add", async (req, res) => {
  try {
    const { user_email, relationship } = req.body;
    const email = user_email.trim().toLowerCase();
    const userId = 1;

    const [user] = await db.query(
      "SELECT user_id FROM users WHERE user_email = ?",
      [email]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const emergencyUserId = user[0].user_id;

    await db.query(
      `INSERT INTO emergency_contacts (user_id, emergency_user_id, relationship)
       VALUES (?, ?, ?)`,
      [userId, emergencyUserId, relationship]
    );

    res.json({ message: "Emergency contact added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// Get people who added YOU as emergency contact
router.get("/list", async (req, res) => {
  try {
    const userId = 1;

    const [rows] = await db.query(
      `SELECT u.user_id, u.name
       FROM emergency_contacts ec
       JOIN users u ON ec.user_id = u.user_id
       WHERE ec.emergency_user_id = ?`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;