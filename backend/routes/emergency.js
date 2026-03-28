const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { getUserId } = require("../middleware/auth");

router.post("/add", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { email, relationship } = req.body;
    if (!email || !relationship) {
      return res.status(400).json({ error: "email and relationship are required" });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Look up the user being added as emergency contact
    const [found] = await db.query(
      "SELECT user_id, name FROM users WHERE user_email = ?",
      [cleanEmail]
    );
    if (found.length === 0) {
      return res.status(404).json({ error: "No MedDiary account found with that email" });
    }

    const emergencyUser = found[0];

   
    if (emergencyUser.user_id === userId) {
      return res.status(400).json({ error: "You cannot add yourself as an emergency contact" });
    }

    
    try {
      await db.query(
        `INSERT INTO emergency_contacts (user_id, emergency_user_id, relationship)
         VALUES (?, ?, ?)`,
        [userId, emergencyUser.user_id, relationship]
      );
    } catch (dupErr) {
      if (dupErr.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "This person is already your emergency contact" });
      }
      throw dupErr;
    }

    res.json({
      message: "Emergency contact added",
      contact: { name: emergencyUser.name, email: cleanEmail, relationship },
    });
  } catch (err) {
    console.error("POST /emergency/add error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


router.get("/my-contacts", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const [rows] = await db.query(
      `SELECT
         ec.contact_id,
         ec.relationship,
         ec.created_at,
         u.user_id,
         u.name,
         u.user_email
       FROM emergency_contacts ec
       JOIN users u ON ec.emergency_user_id = u.user_id
       WHERE ec.user_id = ?
       ORDER BY ec.created_at DESC`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("GET /emergency/my-contacts error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


router.get("/access-list", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const [rows] = await db.query(
      `SELECT
         ec.contact_id,
         ec.relationship,
         u.user_id,
         u.name,
         u.user_email
       FROM emergency_contacts ec
       JOIN users u ON ec.user_id = u.user_id
       WHERE ec.emergency_user_id = ?
       ORDER BY u.name ASC`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("GET /emergency/access-list error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


router.delete("/:contactId", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const [result] = await db.query(
      `DELETE FROM emergency_contacts
       WHERE contact_id = ? AND user_id = ?`,
      [req.params.contactId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Contact not found or not yours to remove" });
    }

    res.json({ message: "Emergency contact removed" });
  } catch (err) {
    console.error("DELETE /emergency/:contactId error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;