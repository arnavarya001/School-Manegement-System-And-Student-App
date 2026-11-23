const Supplier = require('../models/Supplier');

// @desc    Get all suppliers
// @route   GET /api/v1/suppliers
// @access  Private (Manager/Inventory)
exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort('-createdAt');
    res.status(200).json({ success: true, count: suppliers.length, data: suppliers });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create supplier
// @route   POST /api/v1/suppliers
// @access  Private (Manager/Inventory)
exports.createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json({ success: true, data: supplier });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete supplier
// @route   DELETE /api/v1/suppliers/:id
// @access  Private (Manager)
exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, error: 'Supplier not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
