const express = require("express");
const router = express.Router();
const axios = require("axios");

// Helper function to fetch drug info
async function getDrugInfo(drugName) {
  const url = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:${drugName}&limit=1`;

  try {
    const response = await axios.get(url);
    return response.data.results[0];
  } catch (err) {
    return null;
  }
}

// Check interaction
router.post("/check", async (req, res) => {
  const { drug1, drug2 } = req.body;

  if (!drug1 || !drug2) {
    return res.status(400).json({
      error: "Both drug names are required"
    });
  }

  try {
    const drug1Data = await getDrugInfo(drug1.toLowerCase());
    const drug2Data = await getDrugInfo(drug2.toLowerCase());

    if (!drug1Data || !drug2Data) {
      return res.json({
        message: "Drug information not found",
        severity: "Unknown"
      });
    }

    const warnings1 = JSON.stringify(drug1Data).toLowerCase();
    const warnings2 = JSON.stringify(drug2Data).toLowerCase();

    let interaction = "No known interaction found";
    let severity = "Low";

    if (
      warnings1.includes(drug2.toLowerCase()) ||
      warnings2.includes(drug1.toLowerCase())
    ) {
      interaction = "Possible interaction detected. Please consult a doctor.";
      severity = "High";
    }

    res.json({
      drug1,
      drug2,
      interaction,
      severity
    });

  } catch (error) {
    res.status(500).json({
      error: "Error checking interaction"
    });
  }
});

module.exports = router;
