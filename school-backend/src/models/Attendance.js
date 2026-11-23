const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'Student',
    required: true
  },
  class: {
    type: mongoose.Schema.ObjectId,
    ref: 'Class',
    required: true
  },
  section: {
    type: mongoose.Schema.ObjectId,
    ref: 'Section',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Leave', 'Half-Day'],
    default: 'Present'
  },
  remark: String,
  recordedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a student has only one attendance record per day
AttendanceSchema.index({ student: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
