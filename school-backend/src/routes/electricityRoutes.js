const express = require('express');
const {
  generateElectricityBill,
  getStudentElectricityHistory
} = require('../controllers/electricityController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/generate', authorize('super-admin', 'manager', 'accountant'), generateElectricityBill);
router.get('/student/:studentId', getStudentElectricityHistory);

module.exports = router;
