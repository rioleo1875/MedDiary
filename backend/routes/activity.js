const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get recent activity for a member
router.get("/:memberId", async (req, res) => {
  try {
    const memberId = req.params.memberId;
    const limit = parseInt(req.query.limit) || 10;
    
    // Get recent test results
    const [tests] = await db.query(`
      SELECT 
        test_id as id,
        'Test Result' as type,
        test_name as text,
        CASE 
          WHEN status = 'abnormal' THEN 'Abnormal'
          WHEN status = 'moderate' THEN 'Moderate' 
          ELSE 'Normal'
        END as status,
        DATE_FORMAT(test_date, '%Y-%m-%d') as date,
        test_date as sort_date
      FROM test_results 
      WHERE member_id = ?
      ORDER BY test_date DESC 
      LIMIT ?
    `, [memberId, limit]);

    // Get recent medication updates (if medications table exists)
    let medications = [];
    try {
      const [meds] = await db.query(`
        SELECT 
          med_id as id,
          'Medication' as type,
          CONCAT(med_name, ' - ', dosage) as text,
          'Active' as status,
          DATE_FORMAT(start_date, '%Y-%m-%d') as date,
          start_date as sort_date
        FROM medications 
        WHERE member_id = ?
        ORDER BY start_date DESC 
        LIMIT ?
      `, [memberId, limit]);
      medications = meds;
    } catch (err) {
      // Medications table might not exist, that's okay
      console.log('Medications table not found, skipping...');
    }

    // Get recent edits to test results
    const [edits] = await db.query(`
      SELECT 
        eh.id,
        'Edit' as type,
        CONCAT('Edited ', test_name, ' from ', old_value, ' to ', new_value) as text,
        'Updated' as status,
        DATE_FORMAT(eh.changed_at, '%Y-%m-%d') as date,
        eh.changed_at as sort_date
      FROM edit_history eh
      WHERE eh.test_id IN (
        SELECT test_id FROM test_results WHERE member_id = ?
      )
      ORDER BY eh.changed_at DESC 
      LIMIT ?
    `, [memberId, limit]);

    // Combine all activities
    const allActivities = [...tests, ...medications, ...edits];
    
    // Sort by date descending
    allActivities.sort((a, b) => new Date(b.sort_date) - new Date(a.sort_date));
    
    // Take the most recent ones
    const recentActivities = allActivities.slice(0, limit);
    
    res.json(recentActivities);
    
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({ error: "Failed to fetch recent activity" });
  }
});

module.exports = router;
