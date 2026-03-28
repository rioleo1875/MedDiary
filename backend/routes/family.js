const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { getUserId } = require("../middleware/auth");


router.get("/members", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const [rows] = await db.query(
      `SELECT member_id, name, age, gender, blood_group, relation, allergies
       FROM family_members
       WHERE user_id = ?
       ORDER BY
         CASE WHEN relation = 'Self' THEN 0 ELSE 1 END,
         name ASC`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("GET /api/family/members error:", err);
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

router.post("/members", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { name, age, gender, blood_group, relation, allergies } = req.body;

    if (!name || !age || !gender || !blood_group || !relation) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Only allow adding non-Self members if a Self member already exists
    if (relation !== "Self") {
      const [selfCheck] = await db.query(
        `SELECT member_id FROM family_members
         WHERE user_id = ? AND relation = 'Self' LIMIT 1`,
        [userId]
      );
      if (selfCheck.length === 0) {
        return res.status(400).json({
          error: "Please add yourself (Self) before adding other family members",
        });
      }
    }

    const [result] = await db.query(
      `INSERT INTO family_members (user_id, name, age, gender, blood_group, relation, allergies)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, name, age, gender, blood_group, relation, allergies ?? null]
    );

    res.status(201).json({
      message: "Member added",
      member_id: result.insertId,
    });
  } catch (err) {
    console.error("POST /api/family/members error:", err);
    res.status(500).json({ error: "Failed to add member" });
  }
});

router.patch("/members/:memberId", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { memberId } = req.params;
    const { name, age, gender, blood_group, relation, allergies } = req.body;

    // Verify ownership and get relation
    const [rows] = await db.query(
      `SELECT member_id, relation FROM family_members
       WHERE member_id = ? AND user_id = ?`,
      [memberId, userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Member not found" });
    }

    await db.query(
      `UPDATE family_members
       SET name = ?, age = ?, gender = ?, blood_group = ?, relation = ?, allergies = ?
       WHERE member_id = ?`,
      [name, age, gender, blood_group, relation, allergies ?? null, memberId]
    );

    res.json({ message: "Member updated" });
  } catch (err) {
    console.error("PATCH /api/family/members/:memberId error:", err);
    res.status(500).json({ error: "Failed to update member" });
  }
});


router.delete("/members/:memberId", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { memberId } = req.params;
    console.log("Delete request - userId:", userId, "memberId:", memberId);

    // Verify ownership and get relation
    const [rows] = await db.query(
      `SELECT member_id, relation, name, age, gender FROM family_members
       WHERE member_id = ? AND user_id = ?`,
      [memberId, userId]
    );
    console.log("Query result:", rows);
    
    if (rows.length === 0) {
      console.log("Member not found for deletion");
      return res.status(404).json({ error: "Member not found" });
    }

    console.log("Deleting member:", rows[0]);

    // Prevent deleting Self if other members still exist (only if relation is explicitly "Self")
    if (rows[0].relation === "Self") {
      console.log("Self member protection triggered");
      const [otherMembers] = await db.query(
        `SELECT COUNT(*) as count FROM family_members
         WHERE user_id = ? AND member_id != ?`,
        [userId, memberId]
      );
      console.log("Other members count:", otherMembers[0].count);
      if (otherMembers[0].count > 0) {
        return res.status(400).json({
          error:
            "Cannot delete the Self member while other family members exist. Delete them first.",
        });
      }
    }

    console.log("Proceeding with deletion...");
    
    // First delete related data to avoid foreign key constraints
    await db.query(`DELETE FROM medications WHERE member_id = ?`, [memberId]);
    await db.query(`DELETE FROM test_results WHERE member_id = ?`, [memberId]);
    await db.query(`DELETE FROM medication_reminders WHERE member_id = ?`, [memberId]);
    
    // Then delete the family member
    const [deleteResult] = await db.query(
      `DELETE FROM family_members WHERE member_id = ? AND user_id = ?`,
      [memberId, userId]
    );
    console.log("Delete result:", deleteResult);

    res.json({ message: "Member deleted" });
  } catch (err) {
    console.error("DELETE /api/family/members/:memberId error:", err);
    res.status(500).json({ error: "Failed to delete member" });
  }
});

module.exports = router;
