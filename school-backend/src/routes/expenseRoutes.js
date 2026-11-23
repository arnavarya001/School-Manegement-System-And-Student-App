const express = require('express');
const { getExpenses, createExpense, deleteExpense } = require('../controllers/expenseController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router
  .route('/')
  .get(authorize('super-admin', 'manager', 'accountant'), getExpenses)
  .post(authorize('super-admin', 'manager', 'accountant'), createExpense);

router
  .route('/:id')
  .delete(authorize('super-admin', 'manager'), deleteExpense);

module.exports = router;
