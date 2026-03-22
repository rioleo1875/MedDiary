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
      `SELECT
         mr.reminder_id,
         mr.med_id,
         mr.hour,
         mr.minute,
         mr.label,
         mr.notification_id,
         m.med_name
       FROM medication_reminders mr
       JOIN medications m ON mr.med_id = m.med_id
       WHERE mr.member_id = ?
       ORDER BY mr.hour ASC, mr.minute ASC`,
      [memberId]
    );

    res.json(rows);
  } catch (err) {
    console.error("GET /api/reminders/:memberId error:", err);
    res.status(500).json({ error: "Failed to fetch reminders" });
  }
});


router.post("/", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { med_id, member_id, hour, minute, label, notification_id } =
      req.body;

    if (
      med_id == null ||
      member_id == null ||
      hour == null ||
      minute == null
    ) {
      return res
        .status(400)
        .json({ error: "med_id, member_id, hour, minute are required" });
    }

    // Verify member belongs to this user
    const [ownerCheck] = await db.query(
      `SELECT member_id FROM family_members WHERE member_id = ? AND user_id = ?`,
      [member_id, userId]
    );
    if (ownerCheck.length === 0) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Verify the medication belongs to this member
    const [medCheck] = await db.query(
      `SELECT med_id FROM medications WHERE med_id = ? AND member_id = ?`,
      [med_id, member_id]
    );
    if (medCheck.length === 0) {
      return res
        .status(404)
        .json({ error: "Medication not found for this member" });
    }

    const [result] = await db.query(
      `INSERT INTO medication_reminders
         (med_id, member_id, hour, minute, label, notification_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [med_id, member_id, hour, minute, label ?? null, notification_id ?? null]
    );

    res.status(201).json({
      message: "Reminder added",
      reminder_id: result.insertId,
    });
  } catch (err) {
    console.error("POST /api/reminders error:", err);
    res.status(500).json({ error: "Failed to add reminder" });
  }
});

router.patch("/:reminderId/notification", async (req, res) => {
  try {
    const { reminderId } = req.params;
    const { notification_id } = req.body;

    if (!notification_id) {
      return res.status(400).json({ error: "notification_id is required" });
    }

    await db.query(
      `UPDATE medication_reminders SET notification_id = ? WHERE reminder_id = ?`,
      [notification_id, reminderId]
    );

    res.json({ message: "Notification ID saved" });
  } catch (err) {
    console.error("PATCH /api/reminders/:reminderId/notification error:", err);
    res.status(500).json({ error: "Failed to update notification ID" });
  }
});

router.delete("/:reminderId", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { reminderId } = req.params;


    const [rows] = await db.query(
      `SELECT mr.notification_id
       FROM medication_reminders mr
       JOIN family_members fm ON mr.member_id = fm.member_id
       WHERE mr.reminder_id = ? AND fm.user_id = ?`,
      [reminderId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Reminder not found" });
    }

    const notificationId = rows[0].notification_id;

    await db.query(
      `DELETE FROM medication_reminders WHERE reminder_id = ?`,
      [reminderId]
    );

    res.json({
      message: "Reminder deleted",
      notification_id: notificationId, 
    });
  } catch (err) {
    console.error("DELETE /api/reminders/:reminderId error:", err);
    res.status(500).json({ error: "Failed to delete reminder" });
  }
});

module.exports = router;