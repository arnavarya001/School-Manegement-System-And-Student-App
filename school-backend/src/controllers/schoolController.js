const SchoolSetting = require('../models/SchoolSetting');

// @desc    Get school settings
// @route   GET /api/v1/school/settings
// @access  Public
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await SchoolSetting.findOne();

    if (!settings) {
      // Create default settings if not found
      settings = await SchoolSetting.create({
        name: 'St. Michel School',
        address: '41 St. Michel Road, City Center',
        contactNumber: '+91 98765 43210',
        email: 'accounts@stmichel.com',
        upiId: 'stmichel@upi',
        bankName: 'HDFC Bank, St. Michel Campus Branch',
        accountNumber: '50200012345678',
        ifscCode: 'HDFC0001234',
        academicSessions: [{ year: '2026-2027', isCurrent: true }]
      });
    }

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update school settings
// @route   PUT /api/v1/school/settings
// @access  Private (Manager/Admin)
exports.updateSettings = async (req, res, next) => {
  try {
    let settings = await SchoolSetting.findOne();

    if (!settings) {
      settings = await SchoolSetting.create(req.body);
    } else {
      settings = await SchoolSetting.findOneAndUpdate({}, req.body, {
        new: true,
        runValidators: true
      });
    }

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
