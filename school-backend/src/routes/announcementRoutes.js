const express = require('express');
const {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(getAnnouncements)
  .post(protect, authorize('super-admin', 'manager'), createAnnouncement);

router
  .route('/:id')
  .put(protect, authorize('super-admin', 'manager'), updateAnnouncement)
  .delete(protect, authorize('super-admin', 'manager'), deleteAnnouncement);

module.exports = router;
