require("dotenv").config();
console.log("MONGO_URI:", process.env.MONGO_URI); 
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(":white_check_mark: MongoDB connected"))
  .catch((err) => console.error(":x: MongoDB connection error:", err));
// Define schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true }
});
// Create model
const User = mongoose.model("User", userSchema);
// Test route
app.get("/", (req, res) => {
  res.send("Backend is working with MongoDB!");
});
// Get all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find(); 
   res.json({users});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Add a new user (extra useful route)
app.post("/users", async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// UPDATE: Update user by ID
app.put("/users/:id", async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.params.id },  // use findOne instead of findById
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedUser) return res.status(404).json({ error: "User not found" });
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE: Delete user by ID
app.delete("/users/:id", async (req, res) => {
  try {
    const deletedUser = await User.findOneAndDelete({ _id: req.params.id });
    if (!deletedUser) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted", deletedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.listen(5000, () => {
  console.log(":rocket: Server running on http://localhost:5000");
});