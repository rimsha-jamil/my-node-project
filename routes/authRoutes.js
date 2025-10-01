const express = require('express');
const { validationResult } = require('express-validator');
const { registerUser , loginUser } = require('../services/authServices');
const { registerValidation } = require('../middlewares/validation');

const router = express.Router();

router.post('/register', registerValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { user, token } = await registerUser(req.body);
    res.status(201).json({ message: 'User registered', user: { id: user._id, name: user.name, phone: user.phone, age: user.age }, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password are required.' });
    }

    const { user, token } = await loginUser({ phone, password });

    res.json({
      message: 'Login successful',
      user: { id: user._id, name: user.name, phone: user.phone, age: user.age },
      token
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


module.exports = router;
