// const mongoose = require('mongoose');

// const otpSchema = new mongoose.Schema({
//   phone: { type: String, required: true },
//   otp: { type: String, required: true },
//   createdAt: { type: Date, default: Date.now, expires: 300 } // 5 min expiry
// });

// module.exports = mongoose.model('OTP', otpSchema);




const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, index: true }
});

// TTL: auto delete after 5 minutes (300 seconds)
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

module.exports = mongoose.model('OTP', otpSchema);
