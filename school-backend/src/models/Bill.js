const mongoose = require('mongoose');

const BillItemSchema = new mongoose.Schema({
  feeCategory: {
    type: mongoose.Schema.ObjectId,
    ref: 'FeeCategory',
    required: true
  },
  description: String,
  amount: {
    type: Number, // In paise
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  }
});

const BillSchema = new mongoose.Schema({
  billNumber: {
    type: String,
    unique: true,
    required: true
  },
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'Student',
    required: true
  },
  academicSession: {
    type: String,
    required: true
  },
  items: [BillItemSchema],
  totalAmount: {
    type: Number, // In paise
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  lateFee: {
    type: Number,
    default: 0
  },
  payableAmount: {
    type: Number,
    required: true
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  dueAmount: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Unpaid', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'],
    default: 'Unpaid'
  },
  billType: {
    type: String,
    enum: ['Admission', 'Tuition', 'Inventory', 'Room Rent', 'Electricity', 'Custom', 'Examination', 'Annual', 'Sports', 'Activity', 'Uniform', 'Books', 'Transport'],
    default: 'Tuition'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Bill', BillSchema);
