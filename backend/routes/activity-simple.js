const express = require("express");
const router = express.Router();

// Get recent activity for a member (mock data for now)
router.get("/:memberId", async (req, res) => {
  try {
    const memberId = req.params.memberId;
    const limit = parseInt(req.query.limit) || 10;
    
    console.log(`Fetching activity for member ${memberId}, limit ${limit}`);
    
    // Return mock activity data for testing
    const mockActivities = [
      {
        id: 1,
        type: "Test Result",
        text: "Blood Glucose - Normal",
        status: "Normal",
        date: new Date().toISOString().split('T')[0]
      },
      {
        id: 2,
        type: "Info",
        text: "System initialized successfully",
        status: "Active",
        date: new Date().toISOString().split('T')[0]
      }
    ];
    
    res.json(mockActivities.slice(0, limit));
    
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({ error: "Failed to fetch recent activity" });
  }
});

module.exports = router;
