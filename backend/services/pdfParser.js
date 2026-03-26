global.DOMMatrix = require("@thednp/dommatrix");
const pdfParseImport = require("pdf-parse");
const pdfParse = pdfParseImport.default || pdfParseImport;
const fs = require("fs");

async function extractPDFText(filePath) {
  try {

    const dataBuffer = fs.readFileSync(filePath);

    const data = await pdfParse(dataBuffer);

    let text = data.text || "";

    text = text
      .replace(/\r/g, "")
      .replace(/\n+/g, "\n")
      .replace(/\s{2,}/g, " ")
      .trim();

    console.log("====== RAW PDF TEXT ======");
    console.log(text);
    console.log("==========================");

    return text;

  } catch (error) {

    console.error("PDF parse failed:", error);

    return "";
  }
}

module.exports = extractPDFText;