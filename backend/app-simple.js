const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get("/", (req, res) => {
  res.send("MedDiary Backend Running (Simple Mode)");
});

// OCR route (without database)
const ocrRoute = require("./routes/ocr-simple");
app.use("/api/ocr", ocrRoute);

// Activity route (mock data)
const activityRoute = require("./routes/activity-simple");
app.use("/api/activity", activityRoute);

// Mock auth route for testing
app.post("/auth/send-otp", (req, res) => {
  console.log("OTP would be sent to:", req.body.email);
  res.json({ success: true, message: "OTP sent (logged to console)" });
});

app.post("/auth/verify-otp", (req, res) => {
  console.log("OTP verification for:", req.body.email, "OTP:", req.body.otp);
  res.json({ success: true, message: "Login successful" });
});

// Mock family routes
app.get("/api/family/members", (req, res) => {
  res.json([
    { member_id: 1, name: "Test User", age: 30, blood_group: "O+", relation: "Self" }
  ]);
});

app.post("/api/family/members", (req, res) => {
  console.log("Adding member:", req.body);
  res.json({ member_id: Date.now(), ...req.body });
});

// Mock test routes
app.get("/api/tests/member/:memberId", (req, res) => {
  res.json({ groupedByDate: [] });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Simple backend running on port ${PORT}`);
  console.log("✅ OCR endpoint: POST /api/ocr/scan/:memberId");
  console.log("✅ Activity endpoint: GET /api/activity/:memberId");
  console.log("✅ No database dependencies");
});

module.exports = app;
