// PDF to Image conversion disabled due to Linux compatibility issues
// const { fromPath } = require("pdf2pic");
// const path = require("path");

// async function convertPDFToImages(filePath) {
//   const convert = fromPath(filePath, {
//     density: 150,
//     saveFilename: "page",
//     savePath: path.dirname(filePath),
//     format: "png",
//     width: 1240,
//     height: 1754,
//   });

//   const pageCount = 5; 
//   const results = [];

//   for (let i = 1; i <= pageCount; i++) {
//     try {
//       const result = await convert(i);
//       if (result?.path) results.push(result.path);
//     } catch {
//       break; 
//     }
//   }

//   console.log("Generated images:", results);
//   return results;
// }

// module.exports = convertPDFToImages;

// Return empty function to prevent crashes
async function convertPDFToImages() {
  return [];
}

module.exports = convertPDFToImages;