const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add expense title'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Please specify category'],
    enum: [
      'Electricity', 'Water', 'Internet', 'Maintenance', 'Cleaning',
      'Stationery', 'Staff Salaries', 'Transportation', 'Inventory Purchases',
      'Repairs', 'Other'
    ],
    default: 'Other',
  },
  amount: {
    type: Number, // In paise
    required: [true, 'Please specify expense amount'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  vendor: {
    type: String,
    trim: true,
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Cheque', 'UPI', 'Card'],
    default: 'Cash',
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending'],
    default: 'Paid',
  },
  receiptUrl: String,
  notes: String,
  recordedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Expense', ExpenseSchema);
