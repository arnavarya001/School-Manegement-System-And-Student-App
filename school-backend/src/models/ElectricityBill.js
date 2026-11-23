const mongoose = require('mongoose');

const ElectricityBillSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'Student',
    required: true
  },
  room: {
    type: mongoose.Schema.ObjectId,
    ref: 'Room'
  },
  academicSession: {
    type: String,
    required: true
  },
  month: {
    type: String,
    required: true
  },
  previousReading: {
    type: Number,
    required: true
  },
  currentReading: {
    type: Number,
    required: true
  },
  unitsConsumed: {
    type: Number,
    required: true
  },
  ratePerUnit: {
    type: Number, // In paise
    required: true
  },
  fixedCharges: {
    type: Number, // In paise
    default: 0
  },
  totalAmount: {
    type: Number, // In paise
    required: true
  },
  bill: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bill'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ElectricityBill', ElectricityBillSchema);
