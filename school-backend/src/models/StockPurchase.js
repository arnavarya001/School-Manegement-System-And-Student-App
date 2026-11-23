const mongoose = require('mongoose');

const StockPurchaseSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  purchasePrice: {
    type: Number, // In paise
    required: true
  },
  supplier: String,
  invoiceNumber: String,
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  receivedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('StockPurchase', StockPurchaseSchema);
