const mongoose = require('mongoose');

const StudentIssuedItemSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'Student',
    required: true
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unitPrice: {
    type: Number, // In paise
    required: true
  },
  totalPrice: {
    type: Number, // In paise
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  bill: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bill'
  },
  status: {
    type: String,
    enum: ['Issued', 'Returned', 'Lost'],
    default: 'Issued'
  },
  issuedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('StudentIssuedItem', StudentIssuedItemSchema);
