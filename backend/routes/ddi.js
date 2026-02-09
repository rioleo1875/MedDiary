const express = require("express");
const axios = require("axios");
const router = express.Router();


const db = require("backend/config/db"); 



async function getDrugInfo(drugName) {
  const url = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:${drugName}&limit=1`;

  try {
    const response = await axios.get(url);
    return response.data.results[0];
  } catch (error) {
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
  const userId = req.params.userId;

  try {
   
    const [rows] = await db.query(
      "SELECT drug_name FROM medications WHERE user_id = ?",
      [userId]
    );

    if (rows.length < 2) {
      return res.json({
        warningMessage: "Not enough medications to check interactions.",
        interactions: []
      });
    }

  
    const medications = rows.map(r => r.drug_name.toLowerCase());

    
    let interactions = [];

    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {

        const drugA = medications[i];
        const drugB = medications[j];

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

   
    return res.json({
      userId,
      totalMedications: medications.length,
      highRiskCount: interactions.length,
      warningMessage,
      interactions
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error checking drug interactions"
    });
  }
});

module.exports = router;
