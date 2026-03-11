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

//Chatbot route
const chatbotRoutes = require("./routes/chatbot");
app.use("/api/chatbot", chatbotRoutes);

//Test Result route
const testRoutes = require("./routes/tests");
app.use("/api/tests", testRoutes);

// OCR route
const ocrRoute = require("./routes/ocr");
app.use("/api/ocr", ocrRoute);

// Summary route
const summaryRoute = require("./routes/summary");
app.use("/api/summary", summaryRoute);

module.exports = app;
