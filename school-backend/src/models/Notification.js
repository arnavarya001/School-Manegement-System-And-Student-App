const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Fee', 'Payment', 'Announcement', 'Attendance', 'Inventory', 'System'],
    default: 'System'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  link: String, // Optional URL to navigate to
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);
