const express = require('express');
const {
  getAllBills,
  generateBill,
  generateClassBills,
  getStudentBills,
  downloadBill,
  updateBill,
  bulkGenerateFee
} = require('../controllers/billController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', authorize('super-admin', 'manager', 'accountant'), getAllBills);
router.post('/generate', authorize('super-admin', 'manager', 'accountant'), generateBill);
router.post('/bulk-all', authorize('super-admin', 'manager', 'accountant'), bulkGenerateFee);

router.post('/generate/class', authorize('super-admin', 'manager'), generateClassBills);
router.get('/student/:studentId', getStudentBills);
router.put('/:id', authorize('super-admin', 'manager', 'accountant'), updateBill);
router.get('/:id/download', downloadBill);

module.exports = router;
