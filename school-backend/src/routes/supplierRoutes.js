const express = require('express');
const { getSuppliers, createSupplier, deleteSupplier } = require('../controllers/supplierController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router
  .route('/')
  .get(authorize('super-admin', 'manager', 'inventory-manager', 'accountant'), getSuppliers)
  .post(authorize('super-admin', 'manager', 'inventory-manager'), createSupplier);

router
  .route('/:id')
  .delete(authorize('super-admin', 'manager'), deleteSupplier);

module.exports = router;
