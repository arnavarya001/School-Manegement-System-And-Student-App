const mongoose = require('mongoose');

const InventoryCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    unique: true,
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('InventoryCategory', InventoryCategorySchema);
