const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("MedDiary Backend Running");
});

// DDI route
const ddiRoute = require("./routes/ddi");
app.use("/api/ddi", ddiRoute);

module.exports = app;
