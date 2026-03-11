const express = require("express");
const multer = require("multer");
const tesseract = require("tesseract.js");
const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/scan", upload.single("report"), async (req, res) => {
    try {
        const result = await tesseract.recognize(req.file.path, "eng");
        const text = result.data.text;
        res.json({ extractedText:text });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to process image" });
    }
});

module.exports = router;