const express = require('express');
const {
  getCategories,
  createCategory,
  getStructures,
  upsertStructure
} = require('../controllers/feeController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
  .route('/categories')
  .get(getCategories)
  .post(authorize('super-admin', 'manager'), createCategory);

router
  .route('/structures')
  .get(getStructures)
  .post(authorize('super-admin', 'manager'), upsertStructure);

module.exports = router;
