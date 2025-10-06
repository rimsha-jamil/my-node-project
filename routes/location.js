
const express = require('express');
const User = require('../models/user');
const auth = require('../middlewares/authMiddleware');
const router = express.Router();

// POST /update-location
router.post('/update-location', auth, async (req, res) => {
  try {
    const { lat, lng, city } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        location: { type: 'Point', coordinates: [lng, lat] },
        city: city || req.user.city
      },
      { new: true }
    ).select('-passwordHash');

    res.json({ message: 'Location updated successfully', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;



