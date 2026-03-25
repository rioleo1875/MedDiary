const express = require("express");
const cors = require("cors");

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:8083', 'http://localhost:8084', 'exp://192.168.1.100:8083', 'exp://192.168.1.100:8084'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-user-id']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Test route
app.get("/", (req, res) => {
  res.send("MedDiary Backend Running (Simple Mode)");
});

// Auth routes
app.post("/auth/send-otp", (req, res) => {
  try {
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    console.log("Raw body:", JSON.stringify(req.body));
    
    const { email } = req.body;
    
    if (!email) {
      console.log("No email provided");
      return res.status(400).json({ success: false, message: "Email required" });
    }
    
    console.log("OTP request received for:", email);
    res.json({ success: true, message: "OTP sent (logged to console)" });
  } catch (error) {
    console.error("OTP error:", error);
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
});

app.post("/auth/verify-otp", (req, res) => {
  try {
    console.log("OTP verification for:", req.body.email, "OTP:", req.body.otp);
    res.json({ success: true, message: "Login successful" });
  } catch (error) {
    console.error("OTP verify error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// OCR route (without database)
const ocrRoute = require("./routes/ocr-simple");
app.use("/api/ocr", ocrRoute);

// Activity route (mock data)
const activityRoute = require("./routes/activity-simple");
app.use("/api/activity", activityRoute);

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
  console.log("✅ Auth endpoints: POST /auth/send-otp, POST /auth/verify-otp");
  console.log("✅ OCR endpoint: POST /api/ocr/scan/:memberId");
  console.log("✅ Activity endpoint: GET /api/activity/:memberId");
  console.log("✅ No database dependencies");
});

module.exports = app;
