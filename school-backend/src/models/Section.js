const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a section name'],
  },
  class: {
    type: mongoose.Schema.ObjectId,
    ref: 'Class',
    required: true
  },
  classTeacher: {
    type: mongoose.Schema.ObjectId,
    ref: 'User' // Role: Teacher
  },
  capacity: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure section names are unique within a class
SectionSchema.index({ name: 1, class: 1 }, { unique: true });

module.exports = mongoose.model('Section', SectionSchema);
