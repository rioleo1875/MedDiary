console.log("1. Starting server.js");
require("dotenv").config();
console.log("2. Dotenv loaded");

const app = require("./app");
console.log("3. App loaded");

const PORT = process.env.PORT || 3000;
console.log("4. PORT:", PORT);

process.on("uncaughtException", (err) => {
  console.error("Uncaught Error:", err);
  console.error(err.stack);
});

console.log("5. About to listen...");
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
console.log("6. Listen called");

require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 3000;

process.on("uncaughtException", (err) => {
  console.error("Uncaught Error:", err);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
