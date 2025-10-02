const express = require('express');
const OTP = require('../models/otp');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

// Generate random OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
}

 
// Send OTP (with check)
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone is required' });

    // Check if OTP already exists and is still valid
    const existing = await OTP.findOne({ phone });
    if (existing) {
      const now = new Date();
      const diff = (now - existing.createdAt) / 1000; 
      if (diff < 120) { 
        return res.status(400).json({ 
          error: `OTP already sent. Please wait ${120 - Math.floor(diff)} seconds before requesting again.` 
        });
      }
    }

    // Otherwise create new OTP
    const otpCode = generateOTP();
    await OTP.deleteMany({ phone }); 
    await OTP.create({ phone, otp: otpCode });

    console.log(`OTP for ${phone}: ${otpCode}`);

    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resend OTP (with check)
router.post('/resend-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone is required' });

    // Check if OTP exists
    const existing = await OTP.findOne({ phone });
    if (existing) {
      const now = new Date();
      const diff = (now - existing.createdAt) / 1000; 
      if (diff < 120) { 
        return res.status(400).json({ 
          error: `Please wait ${120 - Math.floor(diff)} seconds before resending OTP.` 
        });
      }
    }

    // Create new OTP
    const otpCode = generateOTP();
    await OTP.deleteMany({ phone });
    await OTP.create({ phone, otp: otpCode });

    console.log(`Resent OTP for ${phone}: ${otpCode}`);

    res.json({ message: 'OTP resent successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//  Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP required' });

    const record = await OTP.findOne({ phone, otp });
    if (!record) return res.status(400).json({ error: 'Invalid or expired OTP' });

    // Issue JWT
    const token = jwt.sign({ phone }, JWT_SECRET, { expiresIn: '1h' });

    // Delete OTP after verification
    await OTP.deleteMany({ phone });

    res.json({ message: 'OTP verified', token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
