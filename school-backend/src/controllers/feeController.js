const FeeCategory = require('../models/FeeCategory');
const FeeStructure = require('../models/FeeStructure');

// @desc    Get all fee categories
// @route   GET /api/v1/fees/categories
// @access  Private
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await FeeCategory.find();
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create a fee category
// @route   POST /api/v1/fees/categories
// @access  Private (Admin/Manager)
exports.createCategory = async (req, res, next) => {
  try {
    const category = await FeeCategory.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get all fee structures
// @route   GET /api/v1/fees/structures
// @access  Private
exports.getStructures = async (req, res, next) => {
  try {
    const structures = await FeeStructure.find().populate('class').populate('category');
    res.status(200).json({ success: true, count: structures.length, data: structures });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create/Update fee structure
// @route   POST /api/v1/fees/structures
// @access  Private (Admin/Manager)
exports.upsertStructure = async (req, res, next) => {
  try {
    const { class: classId, academicSession, category, amount, frequency } = req.body;

    let structure = await FeeStructure.findOne({ class: classId, academicSession, category });

    if (structure) {
      structure.amount = amount;
      structure.frequency = frequency;
      await structure.save();
    } else {
      structure = await FeeStructure.create(req.body);
    }

    res.status(200).json({ success: true, data: structure });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
