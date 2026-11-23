const Staff = require('../models/Staff');

// @desc    Get all staff
// @route   GET /api/v1/staff
// @access  Private (Manager/Admin)
exports.getStaff = async (req, res) => {
  try {
    const staff = await Staff.find().populate('assignedClasses').sort('-createdAt');
    res.status(200).json({ success: true, count: staff.length, data: staff });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create staff member
// @route   POST /api/v1/staff
// @access  Private (Manager/Admin)
exports.createStaff = async (req, res) => {
  try {
    const staff = await Staff.create(req.body);
    res.status(201).json({ success: true, data: staff });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete staff member
// @route   DELETE /api/v1/staff/:id
// @access  Private (Manager/Admin)
exports.deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, error: 'Staff member not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
