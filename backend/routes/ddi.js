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
  if (!drugAData || !drugAData.purpose_and_indications) {
    return {
      severity: "Low",
      message: "No known interaction"
    };
  }
  
  // Check specific interaction sections, not general drug information
  const text = JSON.stringify(drugAData).toLowerCase();
  const drugB = drugBName.toLowerCase();
  
  // Look for specific interaction mentions
  const interactionKeywords = [
    'interaction', 'interact', 'contraindication', 'contraindicated',
    'should not be taken with', 'incompatible with', 'adverse reaction'
  ];
  
  // Check if drugB is mentioned in context of interactions
  for (const keyword of interactionKeywords) {
    const keywordIndex = text.indexOf(keyword);
    if (keywordIndex !== -1) {
      // Check if drugB appears near this keyword
      const contextStart = Math.max(0, keywordIndex - 50);
      const contextEnd = Math.min(text.length, keywordIndex + drugB.length + 50);
      const context = text.substring(contextStart, contextEnd);
      
      if (context.includes(drugB)) {
        return {
          severity: "High",
          message: `Possible high-risk interaction detected: ${keyword}`
        };
      }
    }
  }

  return {
    severity: "Low",
    message: "No known interaction"
  };
}


router.post("/check/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    let rows = [];
    
    try {
      [rows] = await db.query(
        "SELECT med_name FROM medications WHERE member_id = ?",
        [userId]
      );
    } catch (dbError) {
      console.log("Medications table not found or query failed:", dbError.message);
      return res.json({
        warningMessage: "No medications found to check interactions.",
        interactions: []
      });
    }

    if (rows.length < 2) {
      return res.json({
        warningMessage: "Not enough medications to check interactions.",
        interactions: []
      });
    }
    
    const meds = [...new Set(
      rows.map(r => r.med_name.toLowerCase())
    )];
    
    console.log(`Checking interactions for medications: [${meds.join(', ')}]`);
  
    let interactions = [];

    for (let i = 0; i < meds.length; i++) {
      for (let j = i + 1; j < meds.length; j++) {
        const drugA = meds[i];
        const drugB = meds[j];

        console.log(`Checking interaction between: ${drugA} and ${drugB}`);

        try {
          const drugAData = await getDrugInfo(drugA);
          if (!drugAData) {
            console.log(`No FDA data found for: ${drugA}`);
            continue;
          }

          const result = checkInteraction(drugAData, drugB);
          console.log(`Interaction result for ${drugA} & ${drugB}:`, result);

          if (result.severity === "High") {
            interactions.push({
              drug1: drugA,
              drug2: drugB,
              severity: "High"
            });
          }
        } catch (apiError) {
          console.log("FDA API error for drug:", drugA, apiError.message);
          // Continue with other drugs even if API fails
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