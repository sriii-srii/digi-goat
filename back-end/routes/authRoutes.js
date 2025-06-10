const express = require('express');
const router = express.Router();
const multer = require('multer');
const authController = require('../controllers/auth');
const otpController = require('../controllers/otp_controller');

// ✅ Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// ✅ Auth routes
router.post('/login', authController.login);
router.get('/session', authController.getSession); // ✅ make sure this now works

// ✅ OTP + registration
router.post('/send-otp', otpController.sendOtp);
router.post('/register', upload.single('photo'), otpController.register);

module.exports = router;
