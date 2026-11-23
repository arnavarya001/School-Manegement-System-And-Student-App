const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  paymentNumber: {
    type: String,
    unique: true,
    required: true
  },
  bill: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bill',
    required: true
  },
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'Student',
    required: true
  },
  amount: {
    type: Number, // In paise
    required: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  paymentMode: {
    type: String,
    enum: ['Cash', 'Cheque', 'Bank Transfer', 'Online', 'UPI', 'POS', 'Other'],
    required: true
  },
  transactionId: {
    type: String, // Internal or external (OwnPay)
    unique: true,
    sparse: true
  },
  referenceNumber: String, // e.g., Cheque number or Bank ref
  status: {
    type: String,
    enum: ['Pending', 'Success', 'Failed', 'Refunded'],
    default: 'Success'
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

module.exports = mongoose.model('Payment', PaymentSchema);
