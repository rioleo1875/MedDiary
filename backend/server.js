console.log("=== SERVER.JS IS RUNNING ===");
require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 3000;

console.log("PORT:", PORT);

process.on("uncaughtException", (err) => {
  console.error("Uncaught Error:", err);
  console.error(err.stack);
});

console.log("Starting server...");
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});