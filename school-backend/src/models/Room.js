const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: [true, 'Please add a room number'],
    unique: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  occupancy: {
    type: Number,
    default: 0,
  },
  monthlyRent: {
    type: Number, // In paise
    required: true,
  },
  description: String,
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Room', RoomSchema);
