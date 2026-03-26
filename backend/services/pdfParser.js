// PDF Parser disabled due to Linux compatibility issues
// global.DOMMatrix = require("@thednp/dommatrix"); 
// const fs = require("fs");

// async function extractPDFText(filePath) {
//   const pdfjsLib = await import("pdfjs-dist");
//   try {
//     const dataBuffer = fs.readFileSync(filePath);
//     const data = new Uint8Array(dataBuffer);

//     const loadingTask = pdfjsLib.getDocument({ data });
//     const pdf = await loadingTask.promise;

//     let text = "";

//     for (let i = 1; i <= pdf.numPages; i++) {
//       const page = await pdf.getPage(i);
//       const content = await page.getTextContent();

//       const pageText = content.items.map((item) => item.str).join(" ");
//       text += pageText + "\n";
//     }


//     text = text
//       .replace(/\r/g, "")
//       .replace(/\n+/g, "\n")
//       .replace(/\s{2,}/g, " ")
//       .trim();

//     console.log("====== RAW PDF TEXT ======");
//     console.log(text);
//     console.log("==========================");

//     return text;

//   } catch (error) {
//     console.error("PDF parse failed:", error);
//     return "";
//   }
// }

// module.exports = extractPDFText;

// Return empty function to prevent crashes
async function extractPDFText() {
  return "";
}

module.exports = extractPDFText;