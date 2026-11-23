const express = require('express');
const { getStaff, createStaff, deleteStaff } = require('../controllers/staffController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router
  .route('/')
  .get(authorize('super-admin', 'manager'), getStaff)
  .post(authorize('super-admin', 'manager'), createStaff);

router
  .route('/:id')
  .delete(authorize('super-admin', 'manager'), deleteStaff);

module.exports = router;
