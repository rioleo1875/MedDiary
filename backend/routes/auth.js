const express = require("express");
const router = express.Router();
const db = require("../config/db");
const nodemailer = require("nodemailer");

const otpStore = {}; // temporary in-memory store

// Create transporter only if credentials exist
let transporter = null;
try {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log("✅ Email transporter configured");
  } else {
    console.warn("⚠️ Email credentials missing. OTP will be logged instead of sent.");
  }
} catch (err) {
  console.error("❌ Failed to create email transporter:", err.message);
}

// Helper function to send OTP (logs if email not configured)
async function sendOTP(email, otp) {
  if (transporter) {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "MedDiary OTP",
      text: `Your OTP is ${otp}. Valid for 5 minutes.`,
    });
  } else {
    console.log(`📧 OTP for ${email}: ${otp} (email not configured)`);
  }
}

// Send OTP
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ success: false, message: "Email required" });

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE user_email = ?", [email]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Email not registered" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

    await sendOTP(email, otp);

    res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Verify OTP (same as before)
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  const record = otpStore[email];
  if (!record) return res.status(400).json({ success: false, message: "No OTP found" });
  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ success: false, message: "OTP expired" });
  }
  if (record.otp !== otp) return res.status(400).json({ success: false, message: "Invalid OTP" });

  delete otpStore[email];
  res.json({ success: true, message: "OTP verified" });
});

// Register
router.post("/register", async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, message: "Name and email required" });
  }

  try {
    const [existing] = await db.query("SELECT * FROM users WHERE user_email = ?", [email]);
    
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    await db.query("INSERT INTO users (name, user_email) VALUES (?, ?)", [name, email]);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

    await sendOTP(email, otp);

    res.json({ success: true, message: "Account created, OTP sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;