const express = require('express');
const { getSettings, updateSettings } = require('../controllers/schoolController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/settings', getSettings);
router.put('/settings', protect, authorize('super-admin', 'manager'), updateSettings);

module.exports = router;
