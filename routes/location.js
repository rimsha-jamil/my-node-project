const express = require("express");
const User = require("../models/user");
const auth = require("../middlewares/authMiddleware");
const router = express.Router();

// POST /update-location
router.post("/update-location", auth, async (req, res) => {
  try {
    const { lat, lng, city } = req.body;

    // Validate required fields
    if (!lat || !lng) {
      return res
        .status(400)
        .json({ error: "Latitude and longitude are required" });
    }

    // Validate coordinate values
    if (typeof lat !== "number" || typeof lng !== "number") {
      return res
        .status(400)
        .json({ error: "Latitude and longitude must be numbers" });
    }

    if (lat < -90 || lat > 90) {
      return res
        .status(400)
        .json({ error: "Latitude must be between -90 and 90" });
    }

    if (lng < -180 || lng > 180) {
      return res
        .status(400)
        .json({ error: "Longitude must be between -180 and 180" });
    }

    // Update user location
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        location: {
          type: "Point",
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        city: city || req.user.city,
      },
      { new: true, runValidators: true }
    ).select("-passwordHash");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "Location updated successfully",
      user: updatedUser,
      location: updatedUser.location,
    });
  } catch (error) {
    console.error("Location update error:", error);
    res.status(500).json({ error: "Server error while updating location" });
  }
});

// GET /current-location - Get current user's location
router.get("/current-location", auth, async (req, res) => {
  try {
    const user = req.user;

    if (!user.location || !user.location.coordinates) {
      return res.status(404).json({
        error: "Location not set",
        message:
          "Please update your location first using POST /update-location",
      });
    }

    const [lng, lat] = user.location.coordinates;

    res.json({
      location: user.location,
      coordinates: { lat, lng },
      city: user.city,
      lastUpdated: user.updatedAt,
    });
  } catch (error) {
    console.error("Get location error:", error);
    res.status(500).json({ error: "Server error while fetching location" });
  }
});

module.exports = router;
