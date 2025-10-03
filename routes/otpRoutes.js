// const express = require('express');
// const OTP = require('../models/otp');
// const jwt = require('jsonwebtoken');

// const router = express.Router();
// const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

// // Generate random OTP
// function generateOTP() {
//   return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
// }

 
// // Send OTP (with check)
// router.post('/send-otp', async (req, res) => {
//   try {
//     const { phone } = req.body;
//     if (!phone) return res.status(400).json({ error: 'Phone is required' });

//     // Check if OTP already exists and is still valid
//     const existing = await OTP.findOne({ phone });
//     if (existing) {
//       const now = new Date();
//       const diff = (now - existing.createdAt) / 1000; 
//       if (diff < 120) { 
//         return res.status(400).json({ 
//           error: `OTP already sent. Please wait ${120 - Math.floor(diff)} seconds before requesting again.` 
//         });
//       }
//     }

//     // Otherwise create new OTP
//     const otpCode = generateOTP();
//     await OTP.deleteMany({ phone }); 
//     await OTP.create({ phone, otp: otpCode });

//     console.log(`OTP for ${phone}: ${otpCode}`);

//     res.json({ message: 'OTP sent successfully' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Resend OTP (with check)
// router.post('/resend-otp', async (req, res) => {
//   try {
//     const { phone } = req.body;
//     if (!phone) return res.status(400).json({ error: 'Phone is required' });

//     // Check if OTP exists
//     const existing = await OTP.findOne({ phone });
//     if (existing) {
//       const now = new Date();
//       const diff = (now - existing.createdAt) / 1000; 
//       if (diff < 120) { 
//         return res.status(400).json({ 
//           error: `Please wait ${120 - Math.floor(diff)} seconds before resending OTP.` 
//         });
//       }
//     }

//     // Create new OTP
//     const otpCode = generateOTP();
//     await OTP.deleteMany({ phone });
//     await OTP.create({ phone, otp: otpCode });

//     console.log(`Resent OTP for ${phone}: ${otpCode}`);

//     res.json({ message: 'OTP resent successfully' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


// //  Verify OTP
// router.post('/verify-otp', async (req, res) => {
//   try {
//     const { phone, otp } = req.body;
//     if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP required' });

//     const record = await OTP.findOne({ phone, otp });
//     if (!record) return res.status(400).json({ error: 'Invalid or expired OTP' });

//     // Issue JWT
//     const token = jwt.sign({ phone }, JWT_SECRET, { expiresIn: '1h' });

//     // Delete OTP after verification
//     await OTP.deleteMany({ phone });

//     res.json({ message: 'OTP verified', token });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;



require('dotenv').config();
const express = require('express');
const OTP = require('../models/otp');
const jwt = require('jsonwebtoken');
const transporter = require('../config/email');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP (with cooldown check)
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

   
    const existing = await OTP.findOne({ email });
    if (existing) {
      const diffSec = Math.floor((Date.now() - existing.createdAt) / 1000);
      const cooldownSec = 60; 
      if (diffSec < cooldownSec) {
        return res.status(429).json({ error: `OTP already sent. Wait ${cooldownSec - diffSec} seconds.` });
      }
    }

    const otpCode = generateOTP();
    await OTP.deleteMany({ email });
    await OTP.create({ email, otp: otpCode });

   
    await transporter.sendMail({
      from: `"MyApp" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is ${otpCode}. It expires in 5 minutes.`,
      html: `<p>Your OTP is <b>${otpCode}</b>. It expires in 5 minutes.</p>`
    });

    res.json({ message: 'OTP sent to email' });
  } catch (err) {
    console.error('send-otp error', err);
    res.status(500).json({ error: 'Error sending OTP' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' });

    const record = await OTP.findOne({ email, otp });
    if (!record) return res.status(400).json({ error: 'Invalid or expired OTP' });

   
    await OTP.deleteMany({ email });

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'OTP verified', token });
  } catch (err) {
    console.error('verify-otp error', err);
    res.status(500).json({ error: 'Error verifying OTP' });
  }
});

module.exports = router;
