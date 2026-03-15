const express = require("express");
const multer = require("multer");
const tesseract = require("tesseract.js");
const fs = require("fs");

const parseLabReport = require("../services/parseLabReport");
const extractPDFText = require("../services/pdfParser");
const convertPDFToImages = require("../services/pdfToImage");

const router = express.Router();

const upload = multer({
  dest: "uploads/"
});

// words we never want to treat as test lines
const skipWords = [
  "patient",
  "name",
  "report",
  "method",
  "reference",
  "interval",
  "biochemistry",
  "specimen",
  "lab",
  "page",
  "range",
  "unit",
  "date"
];

// detect real test result lines
const testLinePattern = /^[A-Za-z][A-Za-z\s()\-\/]+?\s+\d+(\.\d+)?/;

function cleanOCRText(text) {

  return text
    .replace(/\r/g, "")
    .replace(/[|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

}

function filterTestLines(text) {

  const lines = text.split("\n");
  const validLines = [];

  for (let line of lines) {

    line = line.trim();

    if (!line) continue;

    const lower = line.toLowerCase();

    if (skipWords.some(w => lower.includes(w))) {
      continue;
    }

    if (!testLinePattern.test(line)) {
      continue;
    }

    validLines.push(line);
  }

  return validLines.join("\n");
}

router.post("/scan/:memberId", upload.single("report"), async (req, res) => {

  try {

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const memberId = req.params.memberId;
    const filePath = req.file.path;
    const mime = req.file.mimetype;

    console.log("Uploaded file:", filePath);
    console.log("File type:", mime);

    let text = "";
    let parseResult = null;

    const runParsing = async (rawText) => {
      const cleaned = cleanOCRText(rawText || "");

      console.log("===== RAW OCR TEXT =====");
      console.log(cleaned);
      console.log("========================");

      return await parseLabReport(cleaned, memberId);
    };

    // ---------- PDF ----------
    if (mime === "application/pdf") {
      console.log("Trying PDF parser...");

      text = await extractPDFText(filePath);
      parseResult = await runParsing(text);

      // If the PDF parsing did not yield any results, fall back to OCR.
      if (!parseResult || parseResult.insertedCount === 0) {
        console.log("PDF parser found no results – falling back to OCR");

        const imagePaths = await convertPDFToImages(filePath);
        const pagesText = [];

        for (const imagePath of imagePaths) {
          const { data } = await tesseract.recognize(imagePath, "eng");
          pagesText.push(data.text);

          try {
            fs.unlinkSync(imagePath);
          } catch {}
        }

        text = pagesText.join("\n");
        parseResult = await runParsing(text);
      }
    }

    // ---------- IMAGE ----------
    else {
      console.log("Running OCR on image");
      const { data } = await tesseract.recognize(filePath, "eng");
      text = data.text;
      parseResult = await runParsing(text);
    }

    if (!parseResult || parseResult.insertedCount === 0) {
      return res.status(400).json({
        error: "No valid test results detected"
      });
    }

    res.json({
      message: "Lab report processed successfully",
      extractedText: text,
      parsedResults: parseResult.inserted,
    });

    res.json({
      message: "Lab report processed successfully",
      extractedText: filteredText
    });

  } catch (err) {

    console.error("OCR error:", err);

    res.status(500).json({
      error: "Lab report processing failed"
    });

  }

});

module.exports = router;