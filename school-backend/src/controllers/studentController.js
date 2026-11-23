const Student = require('../models/Student');
const User = require('../models/User');
const Parent = require('../models/Parent');
const Bill = require('../models/Bill');
const Payment = require('../models/Payment');
const Product = require('../models/Product');
const StudentIssuedItem = require('../models/StudentIssuedItem');
const FeeCategory = require('../models/FeeCategory');
const mongoose = require('mongoose');

// @desc    Get all students
// @route   GET /api/v1/students
// @access  Private (Manager/Admin/Accountant)
exports.getStudents = async (req, res, next) => {
  try {
    const students = await Student.find()
      .populate('parent')
      .populate('class')
      .populate('section');

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get single student
// @route   GET /api/v1/students/:id
// @access  Private
exports.getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('parent')
      .populate('class')
      .populate('section');

    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    res.status(200).json({ success: true, data: student });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create student (Admission)
// @route   POST /api/v1/students
// @access  Private (Admin/Manager/Admission)
exports.createStudent = async (req, res, next) => {
  try {
    const {
      email,
      password,
      parentId,
      parentData,
      phone,
      dateOfBirth,
      admissionDate,
      paymentMode,
      admissionFeeAmount,
      admissionAmountPaid,
      inventoryItems, // array of { productId, quantity }
      ...studentData
    } = req.body;

    let parent;

    if (parentId) {
      parent = await Parent.findById(parentId);
      if (!parent) throw new Error('Parent not found');
    } else {
      const pEmail = (parentData && parentData.email) || `parent.${studentData.admissionNumber}@stmichel.com`;
      const pMobile = (parentData && (parentData.mobileNumber || parentData.phone)) || '';

      let existingParent = await Parent.findOne({
        $or: [
          { email: pEmail },
          ...(pMobile ? [{ mobileNumber: pMobile }] : [])
        ]
      });

      if (existingParent) {
        parent = existingParent;
      } else {
        let parentUser = await User.findOne({ email: pEmail });
        if (!parentUser) {
          parentUser = await User.create({
            name: (parentData && parentData.fullName) || 'Parent',
            email: pEmail,
            password: (parentData && parentData.password) || '123456',
            role: 'parent'
          });
        }

        parent = await Parent.create({
          address: 'St. Michel Campus',
          ...(parentData || {}),
          email: pEmail,
          mobileNumber: pMobile || '9999999999',
          user: parentUser._id
        });
      }
    }

    // Auto-fill section if missing
    if (!studentData.section) {
      const Section = require('../models/Section');
      const firstSec = await Section.findOne({ class: studentData.class }) || await Section.findOne();
      if (firstSec) studentData.section = firstSec._id;
    }

    // Student user creation: phone or email
    const studentPhone = phone || studentData.phone || '';
    const sEmail = email || (studentPhone ? `${studentPhone}@stmichel.com` : `${studentData.admissionNumber}@stmichel.com`);
    let studentUser = await User.findOne({
      $or: [
        { email: sEmail },
        ...(studentPhone ? [{ phone: studentPhone }] : [])
      ]
    });

    if (!studentUser) {
      studentUser = await User.create({
        name: `${studentData.firstName} ${studentData.lastName}`,
        email: sEmail,
        phone: studentPhone,
        password: password || '123456',
        role: 'student'
      });
    }

    // Create student profile
    const createdStudent = await Student.create({
      ...studentData,
      phone: studentPhone,
      dateOfBirth: dateOfBirth || studentData.dateOfBirth || new Date('2014-01-01'),
      admissionDate: admissionDate || studentData.admissionDate || new Date(),
      user: studentUser._id,
      parent: parent._id
    });

    // Add student to parent's student list
    await Parent.findByIdAndUpdate(parent._id, {
      $addToSet: { students: createdStudent._id }
    });

    // Bill Generation for Admission & Inventory Items
    let defaultCat = await FeeCategory.findOne({ name: /Admission/i }) || await FeeCategory.findOne();
    let invCat = await FeeCategory.findOne({ name: /Inventory|Books|Material/i }) || defaultCat;

    const billItems = [];
    let billTotal = 0;

    // Admission fee component (default 500000 paise = ₹5000 if not specified)
    const admFee = admissionFeeAmount !== undefined ? Math.round(Number(admissionFeeAmount)) : 500000;
    if (admFee > 0) {
      billItems.push({
        feeCategory: defaultCat ? defaultCat._id : null,
        description: 'Admission & Registration Fee',
        amount: admFee,
        quantity: 1
      });
      billTotal += admFee;
    }

    // Issue selected inventory products
    const issuedItemDocs = [];
    if (Array.isArray(inventoryItems) && inventoryItems.length > 0) {
      for (const item of inventoryItems) {
        if (!item.productId) continue;
        const product = useTransaction 
          ? await Product.findById(item.productId).session(session)
          : await Product.findById(item.productId);

        if (product && product.quantity >= (item.quantity || 1)) {
          const qty = Number(item.quantity) || 1;
          const lineTotal = product.sellingPrice * qty;
          billTotal += lineTotal;

          const issuedData = {
            student: createdStudent._id,
            product: product._id,
            quantity: qty,
            unitPrice: product.sellingPrice,
            totalPrice: lineTotal,
            issuedBy: req.user ? req.user.id : studentUser._id,
            status: 'Issued'
          };

          const issuedDoc = useTransaction
            ? (await StudentIssuedItem.create([issuedData], { session }))[0]
            : await StudentIssuedItem.create(issuedData);
          issuedItemDocs.push(issuedDoc);

          billItems.push({
            feeCategory: invCat ? invCat._id : null,
            description: `${product.name} (x${qty})`,
            amount: product.sellingPrice,
            quantity: qty
          });

          // Decrement stock
          product.quantity -= qty;
          if (useTransaction) {
            await product.save({ session });
          } else {
            await product.save();
          }
        }
      }
    }

    // Create Official Admission Bill
    let createdBill = null;
    let paymentDoc = null;
    if (billItems.length > 0) {
      const billNumber = `ADM-BILL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const paidPaise = admissionAmountPaid !== undefined ? Math.round(Number(admissionAmountPaid)) : 0;
      const duePaise = Math.max(0, billTotal - paidPaise);
      const status = duePaise === 0 ? 'Paid' : (paidPaise > 0 ? 'Partially Paid' : 'Unpaid');

      const billData = {
        billNumber,
        student: createdStudent._id,
        academicSession: studentData.academicSession || '2026-2027',
        items: billItems,
        totalAmount: billTotal,
        payableAmount: billTotal,
        paidAmount: paidPaise,
        dueAmount: duePaise,
        status,
        dueDate: new Date(Date.now() + 15 * 86400000),
        billType: 'Admission'
      };

      createdBill = await Bill.create(billData);

      // Link issued items to this bill
      for (const itemDoc of issuedItemDocs) {
        itemDoc.bill = createdBill._id;
        await itemDoc.save();
      }

      // Record Payment receipt if paidPaise > 0
      if (paidPaise > 0) {
        const payData = {
          paymentNumber: `PAY-ADM-${Date.now()}`,
          bill: createdBill._id,
          student: createdStudent._id,
          amount: paidPaise,
          paymentMode: paymentMode || 'Cash',
          status: 'Success',
          receivedBy: req.user ? req.user.id : null,
          notes: `Admission payment via ${paymentMode || 'Cash'}`
        };

        paymentDoc = await Payment.create(payData);
      }
    }

    res.status(201).json({
      success: true,
      data: createdStudent,
      bill: createdBill,
      payment: paymentDoc
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update student
// @route   PUT /api/v1/students/:id
// @access  Private (Admin/Manager)
exports.updateStudent = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      rollNumber,
      phone,
      academicSession,
      status,
      attendancePercentage,
      dateOfBirth,
      admissionDate,
      parent: parentData
    } = req.body;
    
    let student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    if (firstName) student.firstName = firstName;
    if (lastName) student.lastName = lastName;
    if (rollNumber !== undefined) student.rollNumber = rollNumber;
    if (phone !== undefined) student.phone = phone;
    if (academicSession) student.academicSession = academicSession;
    if (status) student.status = status;
    if (attendancePercentage !== undefined) student.attendancePercentage = Number(attendancePercentage);
    if (dateOfBirth) student.dateOfBirth = dateOfBirth;
    if (admissionDate) student.admissionDate = admissionDate;
    await student.save();

    if (parentData && student.parent) {
      await Parent.findByIdAndUpdate(student.parent, {
        ...(parentData.fullName && { fullName: parentData.fullName }),
        ...(parentData.mobileNumber && { mobileNumber: parentData.mobileNumber }),
        ...(parentData.email && { email: parentData.email }),
        ...(parentData.address && { address: parentData.address }),
      });
    }

    student = await Student.findById(req.params.id)
      .populate('parent')
      .populate('class')
      .populate('section');

    res.status(200).json({ success: true, data: student });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete student
// @route   DELETE /api/v1/students/:id
// @access  Private (Admin/Manager)
exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    // Deactivate user instead of hard delete for history
    await User.findByIdAndUpdate(student.user, { active: false });
    student.status = 'Inactive';
    await student.save();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
