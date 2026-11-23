const Expense = require('../models/Expense');

// @desc    Get all expenses
// @route   GET /api/v1/expenses
// @access  Private (Manager/Accountant)
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort('-date');
    const totalAmount = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    res.status(200).json({
      success: true,
      count: expenses.length,
      totalAmount,
      data: expenses
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create new expense
// @route   POST /api/v1/expenses
// @access  Private (Manager/Accountant)
exports.createExpense = async (req, res) => {
  try {
    req.body.recordedBy = req.user.id;
    const expense = await Expense.create(req.body);
    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete expense
// @route   DELETE /api/v1/expenses/:id
// @access  Private (Manager)
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
