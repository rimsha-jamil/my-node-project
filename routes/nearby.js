// routes/nearby.js
const express = require("express");
const User = require("../models/user");
const auth = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/nearby", auth, async (req, res) => {
  try {
    const radius = parseInt(req.query.radius) || 5000;
    const user = req.user;

    // Validate radius
    if (isNaN(radius) || radius <= 0) {
      return res
        .status(400)
        .json({ error: "Radius must be a positive number" });
    }

    // Make sure user has location
    if (
      !user.location ||
      !user.location.coordinates ||
      user.location.coordinates.length !== 2
    ) {
      return res.status(400).json({
        error:
          "User location not set or invalid. Please update your location first.",
      });
    }

    const [lng, lat] = user.location.coordinates;

    // Validate coordinates
    if (!lng || !lat || isNaN(lng) || isNaN(lat)) {
      return res
        .status(400)
        .json({ error: "Invalid user location coordinates" });
    }

    // Find users either in same city OR nearby
    const nearbyOrSameCityUsers = await User.find({
      _id: { $ne: user._id },
      $or: [
        // Same city users (if city is set)
        ...(user.city ? [{ city: user.city }] : []),
        // Nearby users within radius
        {
          location: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [parseFloat(lng), parseFloat(lat)],
              },
              $maxDistance: radius,
            },
          },
        },
      ],
    }).select("name city location age phone createdAt");

    // Add distance calculation for nearby users
    const usersWithDistance = nearbyOrSameCityUsers.map((userDoc) => {
      const userObj = userDoc.toObject();

      // Calculate distance if user has location
      if (userObj.location && userObj.location.coordinates) {
        const [userLng, userLat] = userObj.location.coordinates;
        const distance = calculateDistance(lat, lng, userLat, userLng);
        userObj.distance = Math.round(distance); // Distance in meters
      }

      return userObj;
    });

    res.json({
      users: usersWithDistance,
      total: usersWithDistance.length,
      radius: radius,
      userLocation: { lat, lng, city: user.city },
    });
  } catch (error) {
    console.error("Nearby users error:", error);
    res.status(500).json({ error: "Server error while fetching nearby users" });
  }
});

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

module.exports = router;
