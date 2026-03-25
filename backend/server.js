// Force load Railway environment variables
console.log("All env vars:", Object.keys(process.env).filter(k => k.includes('DB')));

require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 3000;

console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);

process.on("uncaughtException", (err) => {
  console.error("Uncaught Error:", err);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});