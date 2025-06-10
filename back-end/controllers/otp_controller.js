// backend/controllers/otp_controller.js
const db = require('../config/db');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const sendOTPEmail = require('../utils/emailService');

const otpStore = {};
const otpRateLimit = {};

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ✅ Send OTP handler
exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const now = Date.now();
  if (!otpRateLimit[email]) otpRateLimit[email] = [];

  otpRateLimit[email] = otpRateLimit[email].filter(ts => now - ts < 10 * 60 * 1000);
  if (otpRateLimit[email].length >= 3) {
    return res.status(429).json({ message: "Too many OTP requests. Try again later." });
  }

  const otp = generateOTP();
  otpStore[email] = { otp, createdAt: Date.now() };
  otpRateLimit[email].push(now);

  try {
    await sendOTPEmail(email, otp);
    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error('Error sending OTP email:', err);
    return res.status(500).json({ message: 'Failed to send OTP email' });
  }
};

// ✅ Register handler
exports.register = async (req, res) => {
  const {
    name,
    phone_number,
    email,
    password,
    role,
    otp,
    address,
    photo_path
  } = req.body;

  const uploadedFile = req.file;

  try {
    // OTP check
    if (!otpStore[email] || otpStore[email].otp !== otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Email check
    const [existing] = await db.promise().execute(
      `SELECT id FROM users WHERE email = ?`,
      [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.promise().execute(
      `INSERT INTO users (name, phone_number, email, password, role, verified, active)
       VALUES (?, ?, ?, ?, ?, 1, 1)`,
      [name, phone_number, email, hashedPassword, role]
    );
    const userId = result.insertId;

    // If role = customer (1), insert into customers
    if (Number(role) === 1) {
      const finalPhotoPath = photo_path || (uploadedFile ? `/uploads/${uploadedFile.filename}` : '');
      await db.promise().execute(
        `INSERT INTO customers (user_id, address, photo, can_buy, can_sell)
         VALUES (?, ?, ?, 1, 1)`,
        [userId, address || '', finalPhotoPath]
      );
    }

    delete otpStore[email];
    return res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
