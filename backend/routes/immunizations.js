const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const Tesseract = require("tesseract.js");

function getUserId(req) {
  return parseInt(req.headers["x-user-id"], 10);
}

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

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

// OCR endpoint for immunization cards
router.post("/ocr", upload.single("image"), async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    console.log("Processing OCR for immunization card...");

    // Use Tesseract.js to extract text from the image
    const { data: { text } } = await Tesseract.recognize(req.file.buffer, 'eng');
    
    console.log("OCR extracted text:", text);

    // Parse the extracted text for vaccine information
    const vaccines = parseVaccineInfo(text);
    
    res.json({ 
      success: true, 
      vaccines,
      extractedText: text
    });
  } catch (error) {
    console.error("OCR processing error:", error);
    res.status(500).json({ error: "Failed to process image" });
  }
});

// Helper function to parse vaccine information from OCR text
function parseVaccineInfo(text) {
  const vaccines = [];
  
  // Common vaccine names and patterns
  const vaccinePatterns = [
    { name: "BCG", pattern: /bcg|bacillus|calmette|guérin/i },
    { name: "Hepatitis B", pattern: /hepatitis\s*b|hep\s*b|hbx/i },
    { name: "DTP", pattern: /dtp|dpt|diphtheria|tetanus|pertussis/i },
    { name: "Polio", pattern: /polio|poliomyelitis|opv|ipv/i },
    { name: "Hib", pattern: /hib|haemophilus|influenzae/i },
    { name: "MMR", pattern: /mmr|measles|mumps|rubella/i },
    { name: "Chickenpox", pattern: /chickenpox|varicella|varivax/i },
    { name: "Rotavirus", pattern: /rotavirus|rotateq|rotarix/i },
    { name: "Pneumococcal", pattern: /pneumococcal|prevnar|synflorix/i },
    { name: "Influenza", pattern: /influenza|flu|fluzone/i },
    { name: "COVID-19", pattern: /covid|coronavirus|pfizer|moderna|johnson|j&j/i },
    { name: "HPV", pattern: /hpv|human+papillomavirus|gardasil|cervarix/i },
    { name: "Typhoid", pattern: /typhoid|typhim|vi/i },
    { name: "Meningococcal", pattern: /meningococcal|meningitis/i }
  ];

  // Date patterns
  const datePatterns = [
    /\b(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b/, // DD/MM/YYYY or DD-MM-YYYY
    /\b(\d{2,4}[-/]\d{1,2}[-/]\d{1,2})\b/, // YYYY/MM/DD or YYYY-MM-DD
    /\b(\w+\s+\d{1,2},?\s+\d{4})\b/, // Jan 15, 2023
    /\b(\d{1,2}\s+\w+\s+\d{4})\b/ // 15 Jan 2023
  ];

  // Split text into lines and process each line
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  lines.forEach(line => {
    // Check if line contains a vaccine name
    for (const vaccine of vaccinePatterns) {
      if (vaccine.pattern.test(line)) {
        // Try to extract date from the same line
        let date = '';
        for (const datePattern of datePatterns) {
          const match = line.match(datePattern);
          if (match) {
            date = match[1];
            break;
          }
        }
        
        // If no date found in current line, check next few lines
        if (!date) {
          const currentLineIndex = lines.indexOf(line);
          for (let i = 1; i <= 3; i++) {
            const nextLine = lines[currentLineIndex + i];
            if (nextLine) {
              for (const datePattern of datePatterns) {
                const match = nextLine.match(datePattern);
                if (match) {
                  date = match[1];
                  break;
                }
              }
              if (date) break;
            }
          }
        }

        vaccines.push({
          name: vaccine.name,
          date: date || 'Date not found'
        });
        break; // Only match one vaccine per line
      }
    }
  });

  return vaccines;
}

module.exports = router;
