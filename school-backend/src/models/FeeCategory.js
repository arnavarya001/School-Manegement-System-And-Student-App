const mongoose = require('mongoose');

const FeeCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a fee category name'],
    unique: true,
  },
  description: String,
  isDefault: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FeeCategory', FeeCategorySchema);
