const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get("/", (req, res) => {
  res.send("MedDiary Backend Running");
});

// Add auth route FIRST (safe version)
console.log("Loading auth route...");
const authRoute = require("./routes/auth");
app.use("/auth", authRoute);
console.log("Auth route loaded ✅");

module.exports = app;