// routes/users.js
const express = require('express');
const User = require('../models/user');
const auth = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/nearby', auth, async (req, res) => {
  try {
    const radius = parseInt(req.query.radius) || 5000; 
    const user = req.user;

    // make sure user has location
    if (!user.location || !user.location.coordinates) {
      return res.status(400).json({ error: 'User location not set' });
    }

    const [lng, lat] = user.location.coordinates;

    // find users either in same city OR nearby
    const nearbyOrSameCityUsers = await User.find({
      _id: { $ne: user._id },
      $or: [
        { city: user.city }, 
        {
          location: { 
            $near: {
              $geometry: { type: 'Point', coordinates: [lng, lat] },
              $maxDistance: radius
            }
          }
        }
      ]
    }).select('name city location');

    res.json({ users: nearbyOrSameCityUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
