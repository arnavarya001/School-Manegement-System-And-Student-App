const mongoose = require('mongoose');

const RoomAssignmentSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.ObjectId,
    ref: 'Room',
    required: true
  },
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'Student',
    required: true,
    unique: true // A student can only be in one room at a time
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('RoomAssignment', RoomAssignmentSchema);
