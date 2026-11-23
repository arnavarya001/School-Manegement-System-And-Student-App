const Bill = require('../models/Bill');
const Payment = require('../models/Payment');
const Student = require('../models/Student');
const Product = require('../models/Product');
const StockPurchase = require('../models/StockPurchase');
const StudentIssuedItem = require('../models/StudentIssuedItem');
const Expense = require('../models/Expense');
const Staff = require('../models/Staff');

const AuditLog = require('../models/AuditLog');

// @desc    Get dashboard stats
// @route   GET /api/v1/reports/dashboard-stats
// @access  Private (Admin/Manager)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalStudents = await Student.countDocuments({ status: 'Active' });
    const totalStaff = await Staff.countDocuments({ status: 'Active' });

    // Financial stats
    const payments = await Payment.find({ status: 'Success' }).sort('-paymentDate').limit(10).populate('student', 'firstName lastName admissionNumber');
    const allSuccessfulPayments = await Payment.find({ status: 'Success' });
    const totalCollection = allSuccessfulPayments.reduce((sum, p) => sum + p.amount, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayPayments = await Payment.find({ status: 'Success', paymentDate: { $gte: today } });
    const todayCollection = todayPayments.reduce((sum, p) => sum + p.amount, 0);

    const bills = await Bill.find({ status: { $ne: 'Cancelled' } });
    const totalPending = bills.reduce((sum, b) => sum + b.dueAmount, 0);
    const totalBilled = bills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    // Student payment breakdown
    const activeStudents = await Student.find({ status: 'Active' }).select('_id');
    const studentDueMap = {};
    bills.forEach(b => {
      if (b.student) {
        const sId = b.student.toString();
        studentDueMap[sId] = (studentDueMap[sId] || 0) + (b.dueAmount || 0);
      }
    });

    let paidStudentsCount = 0;
    let pendingStudentsCount = 0;
    activeStudents.forEach(st => {
      const sId = st._id.toString();
      const due = studentDueMap[sId] || 0;
      if (due > 0) {
        pendingStudentsCount++;
      } else {
        paidStudentsCount++;
      }
    });

    // Expenses stats
    const allExpenses = await Expense.find();
    const totalExpenses = allExpenses.reduce((sum, e) => sum + e.amount, 0);
    const recentExpenses = await Expense.find().sort('-date').limit(5);
    const netProfit = totalCollection - totalExpenses;

    // Inventory stats
    const products = await Product.find().populate('category');
    const lowStockCount = products.filter(p => p.quantity <= p.minStock).length;
    const totalInventoryValue = products.reduce((sum, p) => sum + (p.quantity * (p.sellingPrice || 0)), 0);

    // Recent Admissions
    const recentAdmissions = await Student.find().sort('-createdAt').limit(5).populate('class', 'name');

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalStaff,
        totalCollection,
        todayCollection,
        totalPending,
        totalBilled,
        totalExpenses,
        netProfit,
        paidStudentsCount,
        pendingStudentsCount,
        lowStockCount,
        totalInventoryValue,
        recentPayments: payments,
        recentExpenses,
        recentAdmissions
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};


// @desc    Get financial report (Collections over time)
// @route   GET /api/v1/reports/finance
// @access  Private (Admin/Manager/Accountant)
exports.getFinanceReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { status: 'Success' };

    if (startDate && endDate) {
      query.paymentDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const payments = await Payment.find(query).populate('student', 'firstName lastName admissionNumber');

    const summary = {
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      byMode: {
        Cash: payments.filter(p => p.paymentMode === 'Cash').reduce((sum, p) => sum + p.amount, 0),
        Online: payments.filter(p => p.paymentMode === 'Online').reduce((sum, p) => sum + p.amount, 0),
        Cheque: payments.filter(p => p.paymentMode === 'Cheque').reduce((sum, p) => sum + p.amount, 0),
        BankTransfer: payments.filter(p => p.paymentMode === 'Bank Transfer').reduce((sum, p) => sum + p.amount, 0)
      }
    };

    res.status(200).json({ success: true, data: { summary, payments } });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get inventory report
// @route   GET /api/v1/reports/inventory
// @access  Private (Admin/Manager/Inventory)
exports.getInventoryReport = async (req, res, next) => {
  try {
    const products = await Product.find().populate('category');
    const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.purchasePrice), 0);

    res.status(200).json({
      success: true,
      data: {
        totalValue,
        products
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get activity logs
// @route   GET /api/v1/reports/logs
// @access  Private (Admin/Manager)
exports.getActivityLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find().populate('user', 'name email role').sort('-createdAt').limit(100);
    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
