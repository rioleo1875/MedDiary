const express = require("express");
const router = express.Router();
const db = require("../config/db");
const sgMail = require("@sendgrid/mail");

const otpStore = {};

// Configure SendGrid if API key exists
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log("✅ Email configured with SendGrid");
} else {
  console.log("⚠️ Email not configured - OTP will be logged");
}

// Send OTP function
async function sendOTP(email, otp) {
  if (process.env.SENDGRID_API_KEY) {
    const msg = {
      to: email,
      from: process.env.EMAIL_USER, // Must be verified in SendGrid
      subject: "MedDiary OTP",
      text: `Your OTP is ${otp}. Valid for 5 minutes.`,
    };
    await sgMail.send(msg);
  } else {
    console.log(`📧 OTP for ${email}: ${otp}`);
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

// Verify OTP
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