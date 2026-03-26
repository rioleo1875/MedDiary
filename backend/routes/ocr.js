const express = require("express");
const multer = require("multer");
const Tesseract = require("tesseract.js");

const parseLabReport = require("../services/parseLabReport");
const testDictionary = require("../services/testDictionary");

// PDF services disabled due to Linux compatibility issues
const extractPDFText = async () => ""; // PDF text extraction disabled
const convertPDFToImages = async () => []; // PDF to image conversion disabled

const router = express.Router();

function normalizeText(raw) {
  return raw
    .toLowerCase()
    .replace(/[\r\n\t]+/g, " ")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasKnownTestAlias(text) {
  const normalized = normalizeText(text);
  return Object.values(testDictionary).some((entry) => {
    const aliases = entry.aliases || [];
    return aliases.some((alias) => normalized.includes(alias.toLowerCase()));
  });
}

function shouldFallbackToOCR(text) {
  if (!text || !text.trim()) return true;

  const wordCount = text.trim().split(/\s+/).length;
  const significant = text.trim().length >= 20;
  const knownTest = hasKnownTestAlias(text);

  if (!significant) return true;
  if (knownTest) return false;

  
  if (wordCount < 20) return true;

  return false;
}

const upload = multer({ dest: "uploads/" });

router.post("/scan/:memberId", upload.single("report"), async (req, res) => {

  try {

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const memberId = req.params.memberId;
    const filePath = req.file.path;
    const mime = req.file.mimetype;

    console.log("Uploaded:", filePath);
    console.log("Type:", mime);

    let text = "";

    if (mime === "application/pdf") {

      console.log("PDF processing disabled - only image OCR supported");
      
      return res.status(400).json({ 
        error: "PDF processing is currently disabled. Please upload an image file (JPG, PNG, etc.) instead of a PDF." 
      });

    } else {

      console.log("Running OCR on image");

      const result = await Tesseract.recognize(filePath, "eng");

      text = result.data.text;

    }

    console.log("===== EXTRACTED TEXT =====");
    console.log("Text length:", text?.length || 0);
    console.log("Text preview:", text?.substring(0, 200) + (text?.length > 200 ? "..." : ""));
    console.log("==========================");

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ 
        error: "Could not extract text from image. Please ensure the image is clear and contains readable text." 
      });
    }

    await parseLabReport(text, memberId);

    res.json({
      message: "Report processed",
      extractedText: text
    });

  } catch (err) {

    console.error("Processing error:", err);

    res.status(500).json({
      error: "Lab report processing failed"
    });

  }

});

module.exports = router;