const Bill = require('../models/Bill');
const Student = require('../models/Student');
const FeeStructure = require('../models/FeeStructure');
const FeeCategory = require('../models/FeeCategory');
const pdfService = require('../services/pdfService');
const mongoose = require('mongoose');

// @desc    Generate bill for individual student
// @route   POST /api/v1/bills/generate
// @access  Private (Admin/Manager/Accountant)
exports.generateBill = async (req, res, next) => {
  try {
    const { studentId, academicSession, dueDate, items, billType, amount, description } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    let defaultCat = await FeeCategory.findOne({ name: new RegExp(billType || 'Tuition', 'i') });
    if (!defaultCat) {
      defaultCat = await FeeCategory.findOne();
    }

    let billItems = Array.isArray(items) && items.length > 0 ? items : [];
    if (billItems.length === 0 && amount) {
      billItems = [{
        feeCategory: defaultCat ? defaultCat._id : null,
        description: description || `${billType || 'Tuition'} Fee`,
        amount: Math.round(Number(amount)),
        quantity: 1
      }];
    } else {
      billItems = billItems.map(item => ({
        ...item,
        feeCategory: item.feeCategory || (defaultCat ? defaultCat._id : null)
      }));
    }

    if (billItems.length === 0) {
      return res.status(400).json({ success: false, error: 'Please specify bill items or amount' });
    }

    const billNumber = `BILL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    let totalAmount = 0;
    billItems.forEach(item => {
      totalAmount += (item.amount * (item.quantity || 1));
    });

    const bill = await Bill.create({
      billNumber,
      student: studentId,
      academicSession: academicSession || student.academicSession || '2026-2027',
      items: billItems,
      totalAmount,
      payableAmount: totalAmount,
      dueAmount: totalAmount,
      dueDate: dueDate || new Date(Date.now() + 15 * 86400000),
      billType: billType || 'Tuition'
    });

    res.status(201).json({ success: true, data: bill });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Generate monthly tuition bills for a class
// @route   POST /api/v1/bills/generate/class
// @access  Private (Admin/Manager)
exports.generateClassBills = async (req, res, next) => {
  try {
    const { classId, academicSession, dueDate, month } = req.body;

    const students = await Student.find({ class: classId, status: 'Active' });
    const structures = await FeeStructure.find({
      class: classId,
      academicSession,
      frequency: 'Monthly'
    }).populate('category');

    if (structures.length === 0) {
      return res.status(400).json({ success: false, error: 'No monthly fee structures defined for this class' });
    }

    const bills = [];
    for (const student of students) {
      const items = structures.map(s => ({
        feeCategory: s.category._id,
        description: `${s.category.name} - ${month}`,
        amount: s.amount,
        quantity: 1
      }));

      const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
      const billNumber = `BILL-${student.admissionNumber}-${Date.now()}`;

      bills.push({
        billNumber,
        student: student._id,
        academicSession,
        items,
        totalAmount,
        payableAmount: totalAmount,
        dueAmount: totalAmount,
        dueDate,
        billType: 'Tuition'
      });
    }

    const createdBills = await Bill.insertMany(bills);
    res.status(201).json({ success: true, count: createdBills.length, data: createdBills });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get all bills
// @route   GET /api/v1/bills
// @access  Private (Manager/Accountant)
exports.getAllBills = async (req, res, next) => {
  try {
    const bills = await Bill.find()
      .populate({
        path: 'student',
        populate: ['class', 'section']
      })
      .populate('items.feeCategory')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bills.length,
      data: bills
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get bills for a student

// @route   GET /api/v1/bills/student/:studentId
// @access  Private
exports.getStudentBills = async (req, res, next) => {
  try {
    const bills = await Bill.find({ student: req.params.studentId }).sort('-createdAt');
    res.status(200).json({ success: true, count: bills.length, data: bills });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Download bill PDF
// @route   GET /api/v1/bills/:id/download
// @access  Private
exports.downloadBill = async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.id).populate('items.feeCategory');
    if (!bill) return res.status(404).json({ success: false, error: 'Bill not found' });

    const student = await Student.findById(bill.student).populate('class').populate('section');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=bill-${bill.billNumber}.pdf`);

    await pdfService.generateBillPDF(bill, student, res);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update a bill (amount, paid, due, status)
// @route   PUT /api/v1/bills/:id
// @access  Private (Admin/Manager/Accountant)
exports.updateBill = async (req, res, next) => {
  try {
    const { totalAmount, paidAmount, dueAmount, status, dueDate, billType } = req.body;
    let bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ success: false, error: 'Bill not found' });

    if (totalAmount !== undefined) bill.totalAmount = Math.round(Number(totalAmount));
    if (paidAmount !== undefined) bill.paidAmount = Math.round(Number(paidAmount));
    if (dueAmount !== undefined) {
      bill.dueAmount = Math.round(Number(dueAmount));
    } else if (totalAmount !== undefined || paidAmount !== undefined) {
      bill.dueAmount = Math.max(0, bill.totalAmount - bill.paidAmount);
    }
    bill.payableAmount = bill.totalAmount;

    if (status) {
      bill.status = status;
    } else {
      bill.status = bill.dueAmount === 0 ? 'Paid' : (bill.paidAmount > 0 ? 'Partially Paid' : 'Unpaid');
    }

    if (dueDate) bill.dueDate = dueDate;
    if (billType) bill.billType = billType;

    await bill.save();
    res.status(200).json({ success: true, data: bill });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Bulk apply/generate fee for all students
// @route   POST /api/v1/bills/bulk-all
// @access  Private (Admin/Manager)
exports.bulkGenerateFee = async (req, res, next) => {
  try {
    const { billType, description, amount, academicSession, classId } = req.body;
    const filter = { status: 'Active' };
    if (classId) filter.class = classId;

    const students = await Student.find(filter);
    if (!students || students.length === 0) {
      return res.status(400).json({ success: false, error: 'No active students found' });
    }

    const defaultCat = (await FeeCategory.findOne({ name: new RegExp(billType || 'Tuition', 'i') })) || (await FeeCategory.findOne());
    const amountVal = Math.round(Number(amount));

    const createdBills = [];
    for (const student of students) {
      const billNumber = `BILL-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const bill = await Bill.create({
        billNumber,
        student: student._id,
        academicSession: academicSession || student.academicSession || '2026-2027',
        items: [{
          feeCategory: defaultCat ? defaultCat._id : null,
          description: description || `${billType || 'Tuition'} Fee`,
          amount: amountVal,
          quantity: 1
        }],
        totalAmount: amountVal,
        payableAmount: amountVal,
        dueAmount: amountVal,
        dueDate: new Date(Date.now() + 15 * 86400000),
        billType: billType || 'Tuition',
        status: 'Unpaid'
      });
      createdBills.push(bill);
    }

    res.status(201).json({ success: true, count: createdBills.length, data: createdBills });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
