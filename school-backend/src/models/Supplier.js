const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add supplier name'],
    unique: true,
    trim: true,
  },
  contactPerson: String,
  phone: {
    type: String,
    required: [true, 'Please add phone number'],
  },
  email: String,
  address: String,
  gstNumber: String,
  category: {
    type: String,
    default: 'Books & Uniforms',
  },
  balancePending: {
    type: Number, // In paise
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Supplier', SupplierSchema);
