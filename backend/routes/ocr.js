const express = require("express");
const multer = require("multer");
const Tesseract = require("tesseract.js");
const fs = require("fs");

const parseLabReport = require("../services/parseLabReport");
const extractPDFText = require("../services/pdfParser");
const convertPDFToImages = require("../services/pdfToImage");
const testDictionary = require("../services/testDictionary");

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

      console.log("Trying PDF parser...");

      try {
        text = await extractPDFText(filePath);
        console.log("PDF parser extracted text length:", text?.length || 0);
        
        // Only use OCR fallback if PDF extraction fails or returns minimal text
        if (!text || text.trim().length < 50) {
          console.log("PDF text insufficient, switching to OCR fallback");
          
          const imagePaths = await convertPDFToImages(filePath);
          let pages = [];

          for (const img of imagePaths) {
            const result = await Tesseract.recognize(img, "eng");
            pages.push(result.data.text);
            try { fs.unlinkSync(img); } catch {}
          }

          text = pages.join("\n");
          console.log("OCR extracted text length:", text?.length || 0);
        } else {
          console.log("PDF text extraction successful, skipping OCR");
        }
      } catch (e) {
        console.log("PDF parser failed, using OCR fallback:", e.message);
        
        const imagePaths = await convertPDFToImages(filePath);
        let pages = [];

        for (const img of imagePaths) {
          const result = await Tesseract.recognize(img, "eng");
          pages.push(result.data.text);
          try { fs.unlinkSync(img); } catch {}
        }

        text = pages.join("\n");
      }

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
        error: "Could not extract text from PDF. Please ensure the PDF contains readable text (not scanned images) and try again." 
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