const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
  },
  content: {
    type: String,
    required: [true, 'Please add content'],
  },
  targetAudience: {
    type: String,
    enum: ['All', 'Parents', 'Students', 'Teachers', 'Staff'],
    default: 'All',
  },
  targetClass: {
    type: mongoose.Schema.ObjectId,
    ref: 'Class',
  },
  expiryDate: Date,
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  attachments: [String], // Cloudinary URLs
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);
