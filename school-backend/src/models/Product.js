const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
  },
  code: {
    type: String,
    unique: true,
    required: [true, 'Please add a product code'],
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'InventoryCategory',
    required: true
  },
  purchasePrice: {
    type: Number, // In paise
    required: true
  },
  sellingPrice: {
    type: Number, // In paise
    required: true
  },
  quantity: {
    type: Number,
    default: 0
  },
  minStock: {
    type: Number,
    default: 5
  },
  image: String, // Cloudinary URL
  supplier: String,
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', ProductSchema);
