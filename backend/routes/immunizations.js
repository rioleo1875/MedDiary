const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { getUserId } = require("../middleware/auth");

// Get immunizations for a specific family member
router.get("/member/:memberId", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { memberId } = req.params;

    // Verify ownership
    const [ownerCheck] = await db.query(
      `SELECT member_id FROM family_members WHERE member_id = ? AND user_id = ?`,
      [memberId, userId]
    );
    if (ownerCheck.length === 0) {
      return res.status(404).json({ error: "Member not found" });
    }

    // Get immunizations from the Immunization field (stored as JSON string)
    const [rows] = await db.query(
      `SELECT Immunization FROM family_members WHERE member_id = ?`,
      [memberId]
    );

    const immunizations = rows[0]?.Immunization ? JSON.parse(rows[0].Immunization) : [];
    res.json(immunizations);
  } catch (err) {
    console.error("GET immunizations error:", err);
    res.status(500).json({ error: "Failed to fetch immunizations" });
  }
});

// Add immunization to a family member
router.post("/member/:memberId", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { memberId } = req.params;
    const { name, date } = req.body;

    if (!name || !date) {
      return res.status(400).json({ error: "Name and date are required" });
    }

    // Verify ownership
    const [ownerCheck] = await db.query(
      `SELECT member_id, Immunization FROM family_members WHERE member_id = ? AND user_id = ?`,
      [memberId, userId]
    );
    if (ownerCheck.length === 0) {
      return res.status(404).json({ error: "Member not found" });
    }

    // Get existing immunizations
    const existingImmunizations = ownerCheck[0].Immunization ? JSON.parse(ownerCheck[0].Immunization) : [];
    
    // Add new immunization
    const newImmunization = { name, date };
    existingImmunizations.push(newImmunization);

    // Update the database
    await db.query(
      `UPDATE family_members SET Immunization = ? WHERE member_id = ?`,
      [JSON.stringify(existingImmunizations), memberId]
    );

    res.status(201).json({
      message: "Immunization added",
      immunization: newImmunization
    });
  } catch (err) {
    console.error("POST immunization error:", err);
    res.status(500).json({ error: "Failed to add immunization" });
  }
});

// Delete immunization from a family member
router.delete("/member/:memberId/:index", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { memberId, index } = req.params;

    // Verify ownership
    const [ownerCheck] = await db.query(
      `SELECT member_id, Immunization FROM family_members WHERE member_id = ? AND user_id = ?`,
      [memberId, userId]
    );
    if (ownerCheck.length === 0) {
      return res.status(404).json({ error: "Member not found" });
    }

    // Get existing immunizations
    const existingImmunizations = ownerCheck[0].Immunization ? JSON.parse(ownerCheck[0].Immunization) : [];
    
    // Remove immunization at specified index
    if (index >= 0 && index < existingImmunizations.length) {
      existingImmunizations.splice(index, 1);
      
      // Update the database
      await db.query(
        `UPDATE family_members SET Immunization = ? WHERE member_id = ?`,
        [JSON.stringify(existingImmunizations), memberId]
      );
      
      res.json({ message: "Immunization deleted" });
    } else {
      res.status(400).json({ error: "Invalid immunization index" });
    }
  } catch (err) {
    console.error("DELETE immunization error:", err);
    res.status(500).json({ error: "Failed to delete immunization" });
  }
});

module.exports = router;
