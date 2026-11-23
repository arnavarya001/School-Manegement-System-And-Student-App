const express = require('express');
const {
  getClasses,
  createClass,
  getSections,
  createSection
} = require('../controllers/classController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getClasses)
  .post(authorize('super-admin', 'manager'), createClass);

router
  .route('/:classId/sections')
  .get(getSections)
  .post(authorize('super-admin', 'manager'), createSection);

module.exports = router;
