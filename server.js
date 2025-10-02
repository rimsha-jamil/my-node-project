// require("dotenv").config();
// console.log("MONGO_URI:", process.env.MONGO_URI);
// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const app = express();
// app.use(express.json());
// app.use(cors());
// // Connect to MongoDB
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log(":white_check_mark: MongoDB connected"))
//   .catch((err) => {
//     console.error(":x: MongoDB connection error:", err);
   
//     process.exit(1);
//   });
// // Define schema
// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   age: { type: Number, required: true },
// });
// // Create model
// const User = mongoose.model("User", userSchema);
// // Test route
// app.get("/", (req, res) => {
//   res.send("Backend is working with MongoDB!");
// });
// // Get all users
// app.get("/users", async (req, res) => {
//   try {
//     const users = await User.find();
//     res.json({ users });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Get user by ID
// app.get("/users/:id", async (req, res) => {
//   try {
//     // Check if ID is valid MongoDB ObjectId
//     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//       return res.status(400).json({ error: "Invalid user ID" });
//     }

//     const user = await User.findById(req.params.id);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Add a new user
// app.post("/users", async (req, res) => {
//   try {
//     // Basic validation
//     const { name, age } = req.body;
//     if (!name || !age) {
//       return res.status(400).json({ error: "Name and age are required" });
//     }
//     if (typeof age !== "number" || age < 0) {
//       return res.status(400).json({ error: "Age must be a positive number" });
//     }

//     const newUser = new User(req.body);
//     await newUser.save();
//     res.status(201).json(newUser);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });
// // UPDATE: Update user by ID
// app.put("/users/:id", async (req, res) => {
//   try {
//     // Check if ID is valid MongoDB ObjectId
//     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//       return res.status(400).json({ error: "Invalid user ID" });
//     }

//     const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });
//     if (!updatedUser) return res.status(404).json({ error: "User not found" });
//     res.json(updatedUser);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // DELETE: Delete user by ID
// app.delete("/users/:id", async (req, res) => {
//   try {
//     // Check if ID is valid MongoDB ObjectId
//     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//       return res.status(400).json({ error: "Invalid user ID" });
//     }

//     const deletedUser = await User.findByIdAndDelete(req.params.id);
//     if (!deletedUser) return res.status(404).json({ error: "User not found" });
//     res.json({ message: "User deleted successfully", deletedUser });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // 404 handler for undefined routes
// app.use((req, res) => {
//   res.status(404).json({ error: "Route not found" });
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(":rocket: Server running on http://localhost:" + PORT);
// });





require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const otpRoutes = require('./routes/otpRoutes');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/users', userRoutes);

// Default route
app.get('/', (req, res) => res.send('Backend is working!'));

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
