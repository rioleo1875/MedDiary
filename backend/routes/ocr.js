const express = require("express");
const multer = require("multer");
const tesseract = require("tesseract.js");
const router = express.Router();
const parseLabReport = require("../services/parseLabReport");

const upload = multer({ dest: "uploads/" });
router.post("/scan/:memberId", upload.single("report"), async (req, res) => {
  const memberId = req.params.memberId;

  try {
    const result = await tesseract.recognize(req.file.path, "eng");
    const text = result.data.text;

    await parseLabReport(text, memberId);

    res.json({
      message: "Lab report processed successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Lab report processing failed",
      details: error.message
    });
  }
});

module.exports = router;