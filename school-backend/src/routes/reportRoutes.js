const express = require('express');
const {
  getDashboardStats,
  getFinanceReport,
  getInventoryReport,
  getActivityLogs
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('super-admin', 'manager'));

router.get('/dashboard-stats', getDashboardStats);
router.get('/finance', getFinanceReport);
router.get('/inventory', getInventoryReport);
router.get('/logs', getActivityLogs);

module.exports = router;
