const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String ,required: true}, 
  age: { type: Number, required: true },
  passwordHash: { type: String }, 
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
