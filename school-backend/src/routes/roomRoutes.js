const express = require('express');
const {
  getRooms,
  createRoom,
  assignRoom,
  generateRentBills
} = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getRooms)
  .post(authorize('super-admin', 'manager'), createRoom);

router.post('/assign', authorize('super-admin', 'manager'), assignRoom);
router.post('/generate-bills', authorize('super-admin', 'manager', 'accountant'), generateRentBills);

module.exports = router;
