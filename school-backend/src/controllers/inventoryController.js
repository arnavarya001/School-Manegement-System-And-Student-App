const Product = require('../models/Product');
const InventoryCategory = require('../models/InventoryCategory');
const StockPurchase = require('../models/StockPurchase');
const StudentIssuedItem = require('../models/StudentIssuedItem');
const Bill = require('../models/Bill');
const Payment = require('../models/Payment');
const FeeCategory = require('../models/FeeCategory');
const mongoose = require('mongoose');

// @desc    Get inventory categories
// @route   GET /api/v1/inventory/categories
// @access  Private
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await InventoryCategory.find();
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create inventory category
// @route   POST /api/v1/inventory/categories
// @access  Private (Admin/Manager)
exports.createCategory = async (req, res, next) => {
  try {
    const category = await InventoryCategory.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get all products
// @route   GET /api/v1/inventory/products
// @access  Private
exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find().populate('category');
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create a product
// @route   POST /api/v1/inventory/products
// @access  Private (Manager/Inventory)
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/v1/inventory/products/:id
// @access  Private (Manager/Inventory)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get stock purchases history
// @route   GET /api/v1/inventory/purchases
// @access  Private (Manager/Inventory)
exports.getStockPurchases = async (req, res, next) => {
  try {
    const purchases = await StockPurchase.find()
      .populate('product', 'name sku category')
      .populate('receivedBy', 'name email')
      .sort('-purchaseDate');
    res.status(200).json({ success: true, count: purchases.length, data: purchases });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get all product sales / issued items
// @route   GET /api/v1/inventory/sales
// @access  Private (Manager/Inventory)
exports.getProductSales = async (req, res, next) => {
  try {
    const sales = await StudentIssuedItem.find()
      .populate('student', 'firstName lastName admissionNumber rollNumber')
      .populate('product', 'name sku category sellingPrice')
      .populate('bill', 'billNumber status dueAmount')
      .populate('issuedBy', 'name email')
      .sort('-issueDate');
    res.status(200).json({ success: true, count: sales.length, data: sales });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Purchase stock
// @route   POST /api/v1/inventory/purchase
// @access  Private (Manager/Inventory)
exports.purchaseStock = async (req, res, next) => {
  try {
    const { productId, quantity, purchasePrice, supplier, invoiceNumber, notes } = req.body;

    const purchaseData = {
      product: productId,
      quantity,
      purchasePrice,
      supplier,
      invoiceNumber,
      notes,
      receivedBy: req.user ? req.user.id : null
    };

    const purchase = await StockPurchase.create(purchaseData);
    await Product.findByIdAndUpdate(productId, { $inc: { quantity: quantity } });

    res.status(201).json({ success: true, data: purchase });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Issue items to student
// @route   POST /api/v1/inventory/issue
// @access  Private (Manager/Inventory)
exports.issueItems = async (req, res, next) => {
  try {
    const { studentId, items, academicSession, dueDate, paymentMode, amountPaid } = req.body; // items: [{ productId, quantity }]

    const issuedItems = [];
    let billTotal = 0;
    const billItems = [];

    // Find or create 'Inventory Fee' category
    let invFeeCat = await FeeCategory.findOne({ name: /Inventory|Materials|Books/i }) || await FeeCategory.findOne();
    if (!invFeeCat) {
      invFeeCat = await FeeCategory.create({ name: 'Inventory Fee', description: 'Charges for issued school materials' });
    }

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product ? product.name : 'unknown product'}`);
      }

      const totalPrice = product.sellingPrice * item.quantity;
      billTotal += totalPrice;

      const itemData = {
        student: studentId,
        product: product._id,
        quantity: item.quantity,
        unitPrice: product.sellingPrice,
        totalPrice: totalPrice,
        issuedBy: req.user ? req.user.id : null
      };

      const issuedItem = await StudentIssuedItem.create(itemData);
      issuedItems.push(issuedItem);

      billItems.push({
        feeCategory: invFeeCat ? invFeeCat._id : null,
        description: `${product.name} (x${item.quantity})`,
        amount: product.sellingPrice,
        quantity: item.quantity
      });

      product.quantity -= item.quantity;
      await product.save();
    }

    // Generate Bill for these items
    const billNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const paidPaise = amountPaid !== undefined ? Math.round(Number(amountPaid)) : 0;
    const duePaise = Math.max(0, billTotal - paidPaise);
    const status = duePaise === 0 ? 'Paid' : (paidPaise > 0 ? 'Partially Paid' : 'Unpaid');

    const billData = {
      billNumber,
      student: studentId,
      academicSession: academicSession || '2026-2027',
      items: billItems,
      totalAmount: billTotal,
      payableAmount: billTotal,
      paidAmount: paidPaise,
      dueAmount: duePaise,
      dueDate: dueDate || new Date(Date.now() + 15 * 86400000),
      billType: 'Inventory',
      status
    };

    const bill = await Bill.create(billData);

    // Link issued items to bill
    for (const item of issuedItems) {
      item.bill = bill._id;
      await item.save();
    }

    let paymentDoc = null;
    if (paidPaise > 0) {
      paymentDoc = await Payment.create({
        paymentNumber: `PAY-INV-${Date.now()}`,
        bill: bill._id,
        student: studentId,
        amount: paidPaise,
        paymentMode: paymentMode || 'Cash',
        status: 'Success',
        receivedBy: req.user ? req.user.id : null,
        notes: `Materials payment via ${paymentMode || 'Cash'}`
      });
    }

    res.status(201).json({
      success: true,
      data: {
        bill,
        issuedItems,
        payment: paymentDoc
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete/Return student issued item
// @route   DELETE /api/v1/inventory/issued/:id
// @access  Private (Manager/Inventory)
exports.deleteIssuedItem = async (req, res, next) => {
  try {
    const item = await StudentIssuedItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Issued item not found' });
    }

    // Restore inventory stock
    if (item.product) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: item.quantity }
      });
    }

    // Adjust or delete linked bill if exists
    if (item.bill) {
      const bill = await Bill.findById(item.bill);
      if (bill) {
        if (bill.items.length <= 1) {
          await Bill.findByIdAndDelete(bill._id);
        } else {
          bill.totalAmount = Math.max(0, bill.totalAmount - (item.totalPrice || 0));
          bill.payableAmount = bill.totalAmount;
          bill.dueAmount = Math.max(0, bill.totalAmount - bill.paidAmount);
          bill.status = bill.dueAmount === 0 ? 'Paid' : (bill.paidAmount > 0 ? 'Partially Paid' : 'Unpaid');
          await bill.save();
        }
      }
    }

    await StudentIssuedItem.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Material returned and inventory stock restored' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get student issued items
// @route   GET /api/v1/inventory/student/:studentId
// @access  Private
exports.getStudentIssuedItems = async (req, res, next) => {
  try {
    const items = await StudentIssuedItem.find({ student: req.params.studentId }).populate('product').populate('bill');
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
