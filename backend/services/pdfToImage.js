const pdf = require("pdf-poppler");
const path = require("path");
const fs = require("fs");

async function convertPDFToImages(filePath) {

  const outDir = path.dirname(filePath);
  const outPrefix = "page";

  const opts = {
    format: "png",
    out_dir: outDir,
    out_prefix: outPrefix
  };

  console.log("Converting PDF to images...");

  await pdf.convert(filePath, opts);

  const files = fs.readdirSync(outDir);

  const imageFiles = files
    .filter(f => f.startsWith("page-") && f.endsWith(".png"))
    .map(f => path.join(outDir, f));

  console.log("Generated images:", imageFiles);

  return imageFiles;
}

module.exports = convertPDFToImages;