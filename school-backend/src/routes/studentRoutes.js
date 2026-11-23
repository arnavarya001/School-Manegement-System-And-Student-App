const express = require('express');
const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(authorize('super-admin', 'manager', 'accountant', 'admission-staff'), getStudents)
  .post(authorize('super-admin', 'manager', 'admission-staff'), createStudent);

router
  .route('/:id')
  .get(getStudent)
  .put(authorize('super-admin', 'manager'), updateStudent)
  .delete(authorize('super-admin', 'manager'), deleteStudent);

module.exports = router;
