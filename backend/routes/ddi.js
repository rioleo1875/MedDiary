const express = require("express");
const axios = require("axios");
const router = express.Router();
const db = require("../config/db");


async function getDrugInfo(drugName) {
  const url = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:${drugName}&limit=1`;

  try {
    const response = await axios.get(url);
    return response.data.results[0];
  } catch (err) {
    return null;
  }
}


function checkInteraction(drugAData, drugBName) {
  const text = JSON.stringify(drugAData).toLowerCase();

  if (text.includes(drugBName.toLowerCase())) {
    return {
      severity: "High",
      message: "Possible high-risk interaction"
    };
  }

  return {
    severity: "Low",
    message: "No known interaction"
  };
}


router.post("/check/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    
    const [rows] = await db.query(
      "SELECT med_name FROM medications WHERE member_id = ?",
      [userId]
    );

    if (rows.length < 2) {
      return res.json({
        warningMessage: "Not enough medications to check interactions.",
        interactions: []
      });
    }
    const meds = [...new Set(
    rows.map(r => r.med_name.toLowerCase())
      )];
  
    let interactions = [];

    for (let i = 0; i < meds.length; i++) {
      for (let j = i + 1; j < meds.length; j++) {
        const drugA = meds[i];
        const drugB = meds[j];

        const drugAData = await getDrugInfo(drugA);
        if (!drugAData) continue;

        const result = checkInteraction(drugAData, drugB);

        if (result.severity === "High") {
          interactions.push({
            drug1: drugA,
            drug2: drugB,
            severity: "High"
          });
        }
      }
    }

    let warningMessage = "No high-risk drug interactions detected.";

    if (interactions.length > 0) {
      const pairs = interactions
        .map(i => `${i.drug1} and ${i.drug2}`)
        .join(", ");

      warningMessage = `The drugs ${pairs} have a high risk of interaction. Please consult your doctor.`;
    }

    res.json({
      userId,
      totalMedications: meds.length,
      highRiskCount: interactions.length,
      warningMessage,
      interactions
    });

  } catch (err) {
    console.error("DDI ERROR:", err);
    res.status(500).json({
      error: "Error checking drug interactions"
    });
  }
});

module.exports = router;