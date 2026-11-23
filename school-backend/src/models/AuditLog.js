const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  module: {
    type: String,
    required: true
  },
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
