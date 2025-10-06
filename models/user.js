const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  age: { type: Number, required: true },
  passwordHash: { type: String },

  //  Location fields
  city: { type: String },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], 
      default: [0, 0]
    }
  }
}, { timestamps: true });

// Create GeoJSON index for nearby user queries
userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);
