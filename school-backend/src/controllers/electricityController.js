const ElectricityBill = require('../models/ElectricityBill');
const RoomAssignment = require('../models/RoomAssignment');
const Bill = require('../models/Bill');
const FeeCategory = require('../models/FeeCategory');
const mongoose = require('mongoose');

// @desc    Generate electricity bill for a student
// @route   POST /api/v1/electricity/generate
// @access  Private (Admin/Manager/Accountant)
exports.generateElectricityBill = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      studentId,
      academicSession,
      month,
      previousReading,
      currentReading,
      ratePerUnit,
      fixedCharges,
      dueDate
    } = req.body;

    const unitsConsumed = currentReading - previousReading;
    if (unitsConsumed < 0) throw new Error('Current reading cannot be less than previous reading');

    const consumptionCharge = unitsConsumed * ratePerUnit;
    const totalAmount = consumptionCharge + (fixedCharges || 0);

    // Find student's room
    const assignment = await RoomAssignment.findOne({ student: studentId, active: true }).session(session);

    // Find or create 'Electricity Fee' category
    let elecFeeCat = await FeeCategory.findOne({ name: 'Electricity Fee' }).session(session);
    if (!elecFeeCat) {
      elecFeeCat = await FeeCategory.create([{ name: 'Electricity Fee', description: 'Charges for electricity consumption' }], { session });
      elecFeeCat = elecFeeCat[0];
    }

    // Create Main Bill
    const billNumber = `ELEC-${studentId.substring(0,5)}-${Date.now()}`;
    const bill = await Bill.create([{
      billNumber,
      student: studentId,
      academicSession,
      items: [{
        feeCategory: elecFeeCat._id,
        description: `Electricity Bill - ${month} (${unitsConsumed} units)`,
        amount: totalAmount,
        quantity: 1
      }],
      totalAmount,
      payableAmount: totalAmount,
      dueAmount: totalAmount,
      dueDate,
      billType: 'Electricity'
    }], { session });

    // Record Electricity details
    const elecBill = await ElectricityBill.create([{
      student: studentId,
      room: assignment ? assignment.room : null,
      academicSession,
      month,
      previousReading,
      currentReading,
      unitsConsumed,
      ratePerUnit,
      fixedCharges,
      totalAmount,
      bill: bill[0]._id
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      data: elecBill[0]
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get electricity bill history for a student
// @route   GET /api/v1/electricity/student/:studentId
// @access  Private
exports.getStudentElectricityHistory = async (req, res, next) => {
  try {
    const history = await ElectricityBill.find({ student: req.params.studentId }).sort('-createdAt');
    res.status(200).json({ success: true, count: history.length, data: history });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
