const mongoose = require('mongoose');

const ParentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: {
    type: String,
    required: [true, 'Please add parent name'],
  },
  mobileNumber: {
    type: String,
    required: [true, 'Please add mobile number'],
    unique: true
  },
  email: {
    type: String,
    required: [true, 'Please add email'],
  },
  address: {
    type: String,
    required: true
  },
  occupation: String,
  students: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Student'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Parent', ParentSchema);
