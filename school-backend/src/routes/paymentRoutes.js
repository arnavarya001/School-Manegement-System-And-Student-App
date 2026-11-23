const express = require('express');
const {
  initiateOnlinePayment,
  ownpayWebhook,
  recordOfflinePayment,
  getAllPayments,
  getStudentPayments,
  payBill
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public webhook route (OwnPay calls this)
router.post('/webhook', ownpayWebhook);

// Protected routes
router.use(protect);

router.get('/', authorize('super-admin', 'manager', 'accountant'), getAllPayments);
router.get('/student/:studentId', getStudentPayments);
router.post('/initiate', authorize('parent', 'student'), initiateOnlinePayment);
router.post('/offline', authorize('super-admin', 'manager', 'accountant'), recordOfflinePayment);
router.post('/pay', authorize('parent', 'student', 'super-admin', 'manager', 'accountant'), payBill);

module.exports = router;
