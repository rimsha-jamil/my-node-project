const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

async function registerUser({ name, phone, age, password }) {
  const existing = await User.findOne({ phone });
  if (existing) throw new Error('Phone number already registered.');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = new User({ name, phone, age, passwordHash });
  await user.save();

  const token = jwt.sign({ userId: user._id, phone: user.phone }, JWT_SECRET, { expiresIn: '7d' });

  return { user, token };
}

module.exports = { registerUser };
