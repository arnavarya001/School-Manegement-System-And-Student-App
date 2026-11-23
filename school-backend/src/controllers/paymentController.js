const Payment = require('../models/Payment');
const Bill = require('../models/Bill');
const Student = require('../models/Student');
const ownpayService = require('../services/ownpayService');
const mongoose = require('mongoose');

// @desc    Initiate online payment (OwnPay)
// @route   POST /api/v1/payments/initiate
// @access  Private (Parent/Student)
exports.initiateOnlinePayment = async (req, res, next) => {
  try {
    const { billId, amount } = req.body;

    const bill = await Bill.findById(billId).populate({
      path: 'student',
      populate: { path: 'parent' }
    });

    if (!bill) {
      return res.status(404).json({ success: false, error: 'Bill not found' });
    }

    if (amount > bill.dueAmount) {
      return res.status(400).json({ success: false, error: 'Amount exceeds due balance' });
    }

    // Create a pending payment record
    const paymentNumber = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const payment = await Payment.create({
      paymentNumber,
      bill: billId,
      student: bill.student._id,
      amount,
      paymentMode: 'Online',
      status: 'Pending',
      notes: `Online payment for ${bill.billNumber}`
    });

    // Initiate OwnPay Checkout
    const checkoutData = await ownpayService.createCheckout({
      amount,
      referenceId: payment._id.toString(),
      description: `Payment for ${bill.billNumber} - St. Michel School`,
      customerName: bill.student.parent.fullName,
      customerEmail: bill.student.parent.email,
      customerPhone: bill.student.parent.mobileNumber,
      callbackUrl: `${process.env.FRONTEND_URL}/payment-status`
    });

    res.status(200).json({
      success: true,
      data: {
        payment,
        checkoutUrl: checkoutData.checkout_url
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    OwnPay Webhook
// @route   POST /api/v1/payments/webhook
// @access  Public
exports.ownpayWebhook = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const signature = req.headers['x-ownpay-signature'];
    const payload = req.body;

    // 1. Verify signature
    if (!ownpayService.verifyWebhookSignature(signature, payload)) {
      return res.status(401).json({ success: false, error: 'Invalid signature' });
    }

    const { event, data } = payload;

    // 2. Process only successful payments
    if (event === 'payment.captured') {
      const paymentId = data.reference_id;
      const transactionId = data.id;

      const payment = await Payment.findById(paymentId).session(session);
      if (!payment || payment.status !== 'Pending') {
        throw new Error('Invalid or already processed payment');
      }

      // Update payment record
      payment.status = 'Success';
      payment.transactionId = transactionId;
      await payment.save({ session });

      // Update Bill status
      const bill = await Bill.findById(payment.bill).session(session);
      bill.paidAmount += payment.amount;
      bill.dueAmount -= payment.amount;

      if (bill.dueAmount <= 0) {
        bill.status = 'Paid';
      } else if (bill.paidAmount > 0) {
        bill.status = 'Partially Paid';
      }
      await bill.save({ session });

      // Add to audit log (can be implemented later)

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({ success: true, message: 'Payment processed successfully' });
    }

    res.status(200).json({ success: true, message: 'Event ignored' });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('Webhook processing error:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get all payments / receipts
// @route   GET /api/v1/payments
// @access  Private (Manager / Accountant)
exports.getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate('student', 'firstName lastName admissionNumber rollNumber')
      .populate('bill', 'billNumber totalAmount dueAmount billType')
      .populate('receivedBy', 'name email')
      .sort('-paymentDate');
    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Record offline payment
// @route   POST /api/v1/payments/offline
// @access  Private (Accountant/Manager)
exports.recordOfflinePayment = async (req, res, next) => {
  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch (e) {
    session = null;
  }

  try {
    const { billId, amount, paymentMode, referenceNumber, notes } = req.body;

    const bill = session ? await Bill.findById(billId).session(session) : await Bill.findById(billId);
    if (!bill) throw new Error('Bill not found');

    const paymentNumber = `PAY-OFF-${Date.now()}`;
    const paymentData = {
      paymentNumber,
      bill: billId,
      student: bill.student,
      amount,
      paymentMode,
      referenceNumber,
      status: 'Success',
      receivedBy: req.user.id,
      notes
    };

    let payment;
    if (session) {
      payment = (await Payment.create([paymentData], { session }))[0];
      bill.paidAmount += amount;
      bill.dueAmount -= amount;
      if (bill.dueAmount <= 0) {
        bill.status = 'Paid';
      } else if (bill.paidAmount > 0) {
        bill.status = 'Partially Paid';
      }
      await bill.save({ session });
      await session.commitTransaction();
      session.endSession();
    } else {
      payment = await Payment.create(paymentData);
      bill.paidAmount += amount;
      bill.dueAmount -= amount;
      if (bill.dueAmount <= 0) {
        bill.status = 'Paid';
      } else if (bill.paidAmount > 0) {
        bill.status = 'Partially Paid';
      }
      await bill.save();
    }

    res.status(201).json({ success: true, data: payment });
  } catch (err) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get all payments for a student
// @route   GET /api/v1/payments/student/:studentId
// @access  Private
exports.getStudentPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ student: req.params.studentId })
      .populate('bill', 'billNumber billType totalAmount dueAmount')
      .populate('receivedBy', 'name email')
      .sort('-paymentDate');
    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Direct Bill Payment (Online / UPI / Cash for Student, Parent, Admin)
// @route   POST /api/v1/payments/pay
// @access  Private
exports.payBill = async (req, res, next) => {
  try {
    const { billId, amount, paymentMode = 'UPI', referenceNumber = '', notes = '' } = req.body;
    const bill = await Bill.findById(billId);
    if (!bill) {
      return res.status(404).json({ success: false, error: 'Bill not found' });
    }

    const payAmt = Number(amount);
    if (!payAmt || payAmt <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid payment amount' });
    }

    const paymentNumber = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const payment = await Payment.create({
      paymentNumber,
      bill: bill._id,
      student: bill.student,
      amount: payAmt,
      paymentMode,
      referenceNumber,
      status: 'Success',
      receivedBy: req.user._id,
      notes: notes || `Fee Payment via ${paymentMode}`
    });

    bill.paidAmount = (bill.paidAmount || 0) + payAmt;
    bill.dueAmount = Math.max(0, (bill.totalAmount || 0) - bill.paidAmount);
    if (bill.dueAmount <= 0) {
      bill.status = 'Paid';
    } else if (bill.paidAmount > 0) {
      bill.status = 'Partially Paid';
    }
    await bill.save();

    res.status(200).json({ success: true, data: { payment, bill } });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
