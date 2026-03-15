const pdf = require("pdf-poppler");
const path = require("path");

async function convertPDFToImages(filePath) {
  const outDir = path.dirname(filePath);
  const outPrefix = "page";

  // Convert all pages from the PDF into PNGs
  const opts = {
    format: "png",
    out_dir: outDir,
    out_prefix: outPrefix,
    // Do not set `page` so that pdf-poppler converts all pages.
  };

  await pdf.convert(filePath, opts);

  const files = require("fs").readdirSync(outDir);
  const imageFiles = files
    .filter((f) => f.startsWith(`${outPrefix}-`) && f.endsWith(".png"))
    .sort();

  return imageFiles.map((f) => path.join(outDir, f));
}

module.exports = convertPDFToImages;