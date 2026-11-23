const express = require('express');
const {
  markAttendance,
  getAttendance,
  getStudentAttendance
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(authorize('super-admin', 'manager', 'teacher'), getAttendance)
  .post(authorize('super-admin', 'manager', 'teacher'), markAttendance);

router.get('/student/:studentId', getStudentAttendance);

module.exports = router;
