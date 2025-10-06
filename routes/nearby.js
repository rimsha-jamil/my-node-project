// routes/nearby.js
const express = require("express");
const User = require("../models/user");
const auth = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/nearby", auth, async (req, res) => {
  try {
    const radiusInKm = parseFloat(req.query.radius) || 5;
    const radius = radiusInKm * 1000; 
    const user = req.user;

    if (
      !user.location ||
      !user.location.coordinates ||
      user.location.coordinates.length !== 2
    ) {
      return res.status(400).json({
        error: "User location not set. Please update your location first.",
      });
    }

    const [lng, lat] = user.location.coordinates;

    const nearbyUsers = await User.find({
      _id: { $ne: user._id },
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: radius,
        },
      },
    }).select("name city location age phone createdAt");

    res.json({
      total: nearbyUsers.length,
      radius: `${radiusInKm} km`,
      users: nearbyUsers,
    });
  } catch (error) {
    console.error("Nearby users error:", error);
    res.status(500).json({ error: "Server error while fetching nearby users" });
  }
});




module.exports = router;
