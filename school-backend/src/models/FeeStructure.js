const mongoose = require('mongoose');

const FeeStructureSchema = new mongoose.Schema({
  class: {
    type: mongoose.Schema.ObjectId,
    ref: 'Class',
    required: true
  },
  academicSession: {
    type: String,
    required: true
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'FeeCategory',
    required: true
  },
  amount: {
    type: Number, // Amount in paise
    required: true
  },
  frequency: {
    type: String,
    enum: ['Monthly', 'Quarterly', 'Half-Yearly', 'Annual', 'One-Time'],
    default: 'Monthly'
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a class doesn't have duplicate structure for same category/session
FeeStructureSchema.index({ class: 1, academicSession: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('FeeStructure', FeeStructureSchema);
