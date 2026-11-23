const mongoose = require('mongoose');

const SchoolSettingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'St. Michel School'
  },
  logo: {
    type: String, // Cloudinary URL
  },
  address: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  academicSessions: [{
    year: String,
    isCurrent: Boolean,
  }],
  schoolTimings: {
    start: String,
    end: String,
  },
  currency: {
    type: String,
    default: 'INR'
  },
  upiId: {
    type: String,
    default: 'stmichel@upi'
  },
  upiQrCode: {
    type: String, // Base64 data URL or image URL
    default: ''
  },
  accountNumber: {
    type: String,
    default: '9876543210123'
  },
  ifscCode: {
    type: String,
    default: 'HDFC0001234'
  },
  bankName: {
    type: String,
    default: 'HDFC Bank, St. Michel Branch'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SchoolSetting', SchoolSettingSchema);
