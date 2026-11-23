const express = require('express');
const { register, login, getMe, listUsers } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/debug/users', listUsers); // NEW: To verify admin exists

module.exports = router;
