const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a class name'],
    unique: true,
  },
  description: String,
  sections: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Section'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Class', ClassSchema);
