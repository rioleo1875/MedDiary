const express = require("express");
const multer = require("multer");
const Tesseract = require("tesseract.js");
const fs = require("fs");

const extractPDFText = require("../services/pdfParser");
const convertPDFToImages = require("../services/pdfToImage");

const router = express.Router();

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
        console.log("PDF parser succeeded, extracted length:", text.length);
        
        if (text && text.trim().length > 50) {
          console.log("PDF text looks sufficient, skipping OCR fallback");
        } else {
          console.log("PDF text too short, trying OCR fallback");
          throw new Error("Insufficient text extracted");
        }
      } catch (e) {
        console.log("PDF parser failed or insufficient text, switching to OCR fallback");

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
    console.log(text.substring(0, 500) + "...");
    console.log("==========================");

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "Could not extract text" });
    }

    // For now, just return success without database operations
    res.json({
      message: "Report processed successfully",
      extractedText: text.substring(0, 1000), // Return first 1000 chars
      memberId: memberId
    });

  } catch (err) {
    console.error("Processing error:", err);
    res.status(500).json({
      error: "Lab report processing failed: " + err.message
    });
  }
});

module.exports = router;
