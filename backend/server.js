
require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 3000;

process.on("uncaughtException", (err) => {
  console.error("Uncaught Error:", err);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
