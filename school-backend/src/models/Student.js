const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  parent: {
    type: mongoose.Schema.ObjectId,
    ref: 'Parent',
    required: true
  },
  admissionNumber: {
    type: String,
    required: [true, 'Please add an admission number'],
    unique: true
  },
  rollNumber: String,
  phone: String,
  admissionDate: {
    type: Date,
    default: Date.now
  },
  firstName: {
    type: String,
    required: [true, 'Please add first name'],
  },
  lastName: {
    type: String,
    required: [true, 'Please add last name'],
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Please add date of birth'],
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
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
  academicSession: {
    type: String, // e.g., "2023-2024"
    required: true
  },
  photo: {
    type: String, // Cloudinary URL
  },
  attendancePercentage: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Alumni'],
    default: 'Active'
  },
  room: {
    type: mongoose.Schema.ObjectId,
    ref: 'Room'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Student', StudentSchema);
