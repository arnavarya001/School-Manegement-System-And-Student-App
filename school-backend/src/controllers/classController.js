const Class = require('../models/Class');
const Section = require('../models/Section');

// @desc    Get all classes
// @route   GET /api/v1/classes
// @access  Private
exports.getClasses = async (req, res, next) => {
  try {
    const classes = await Class.find().populate('sections');
    res.status(200).json({ success: true, count: classes.length, data: classes });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create a class
// @route   POST /api/v1/classes
// @access  Private (Admin/Manager)
exports.createClass = async (req, res, next) => {
  try {
    const schoolClass = await Class.create(req.body);
    res.status(201).json({ success: true, data: schoolClass });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get all sections for a class
// @route   GET /api/v1/classes/:classId/sections
// @access  Private
exports.getSections = async (req, res, next) => {
  try {
    const sections = await Section.find({ class: req.params.classId });
    res.status(200).json({ success: true, count: sections.length, data: sections });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create a section for a class
// @route   POST /api/v1/classes/:classId/sections
// @access  Private (Admin/Manager)
exports.createSection = async (req, res, next) => {
  try {
    req.body.class = req.params.classId;
    const section = await Section.create(req.body);

    // Add section to class
    await Class.findByIdAndUpdate(req.params.classId, {
      $push: { sections: section._id }
    });

    res.status(201).json({ success: true, data: section });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
