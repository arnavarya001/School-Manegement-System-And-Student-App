const Room = require('../models/Room');
const RoomAssignment = require('../models/RoomAssignment');
const Student = require('../models/Student');
const Bill = require('../models/Bill');
const FeeCategory = require('../models/FeeCategory');
const mongoose = require('mongoose');

// @desc    Get all rooms
// @route   GET /api/v1/rooms
// @access  Private
exports.getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find();
    res.status(200).json({ success: true, count: rooms.length, data: rooms });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create a room
// @route   POST /api/v1/rooms
// @access  Private (Admin/Manager)
exports.createRoom = async (req, res, next) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json({ success: true, data: room });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Assign student to room
// @route   POST /api/v1/rooms/assign
// @access  Private (Admin/Manager)
exports.assignRoom = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { roomId, studentId } = req.body;

    const room = await Room.findById(roomId).session(session);
    if (!room) throw new Error('Room not found');
    if (room.occupancy >= room.capacity) throw new Error('Room is full');

    const student = await Student.findById(studentId).session(session);
    if (!student) throw new Error('Student not found');

    // Check if student already has a room
    const existingAssignment = await RoomAssignment.findOne({ student: studentId, active: true }).session(session);
    if (existingAssignment) throw new Error('Student is already assigned to a room');

    const assignment = await RoomAssignment.create([{
      room: roomId,
      student: studentId
    }], { session });

    // Update room occupancy
    room.occupancy += 1;
    await room.save({ session });

    // Link room to student profile
    student.room = roomId;
    await student.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, data: assignment[0] });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Generate monthly rent bills for all active assignments
// @route   POST /api/v1/rooms/generate-bills
// @access  Private (Admin/Manager)
exports.generateRentBills = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { academicSession, dueDate, month } = req.body;

    const assignments = await RoomAssignment.find({ active: true })
      .populate('room')
      .populate('student')
      .session(session);

    let rentFeeCat = await FeeCategory.findOne({ name: 'Room Rent' }).session(session);
    if (!rentFeeCat) {
      rentFeeCat = await FeeCategory.create([{ name: 'Room Rent', description: 'Monthly hostel room charges' }], { session });
      rentFeeCat = rentFeeCat[0];
    }

    const bills = [];
    for (const assignment of assignments) {
      const billNumber = `RENT-${assignment.student.admissionNumber}-${Date.now()}`;
      const amount = assignment.room.monthlyRent;

      bills.push({
        billNumber,
        student: assignment.student._id,
        academicSession,
        items: [{
          feeCategory: rentFeeCat._id,
          description: `Room Rent (${assignment.room.roomNumber}) - ${month}`,
          amount,
          quantity: 1
        }],
        totalAmount: amount,
        payableAmount: amount,
        dueAmount: amount,
        dueDate,
        billType: 'Room Rent'
      });
    }

    const createdBills = await Bill.insertMany(bills, { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, count: createdBills.length, data: createdBills });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, error: err.message });
  }
};
