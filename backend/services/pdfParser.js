global.DOMMatrix = require("@thednp/dommatrix");
const pdfParseImport = require("pdf-parse");
const pdfParse = pdfParseImport.default || pdfParseImport;
const fs = require("fs");

async function extractPDFText(filePath) {
  try {
    console.log("PDF Parser: Starting extraction for:", filePath);
    
    const dataBuffer = fs.readFileSync(filePath);
    console.log("PDF Parser: File size:", dataBuffer.length, "bytes");

    const data = await pdfParse(dataBuffer);
    console.log("PDF Parser: Raw parse result keys:", Object.keys(data));
    console.log("PDF Parser: Text length:", data.text?.length || 0);

    let text = data.text || "";

    text = text
      .replace(/\r/g, "")
      .replace(/\n+/g, "\n")
      .replace(/\s{2,}/g, " ")
      .trim();

    console.log("====== RAW PDF TEXT ======");
    console.log("Text preview:", text.substring(0, 500) + (text.length > 500 ? "..." : ""));
    console.log("Full text length:", text.length);
    console.log("==========================");

    return text;

  } catch (error) {
    console.error("PDF parse failed:", error);
    console.error("Error details:", error.message);
    return "";
  }
}

module.exports = extractPDFText;