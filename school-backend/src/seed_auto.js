const mongoose = require('mongoose');
const User = require('./models/User');
const Parent = require('./models/Parent');
const Student = require('./models/Student');
const Class = require('./models/Class');
const Section = require('./models/Section');
const SchoolSetting = require('./models/SchoolSetting');
const FeeCategory = require('./models/FeeCategory');
const InventoryCategory = require('./models/InventoryCategory');
const Product = require('./models/Product');
const Bill = require('./models/Bill');
const Attendance = require('./models/Attendance');
const Announcement = require('./models/Announcement');

const seedAuto = async () => {
  try {
    // 1. School Settings
    let schoolSetting = await SchoolSetting.findOne();
    if (!schoolSetting) {
      schoolSetting = await SchoolSetting.create({
        name: 'St. Michel School',
        address: 'St. Michel Road, City Center, PIN-800001',
        contactNumber: '+91 98765 43210',
        email: 'info@stmichelschool.com',
        academicSessions: [{ year: '2026-2027', isCurrent: true }],
        schoolTimings: { start: '08:00 AM', end: '02:00 PM' }
      });
      console.log('✅ Default School Settings created');
    }

    // 2. Classes & Sections
    let classCount = await Class.countDocuments();
    let classTen = null;
    let sectionA = null;
    if (classCount === 0) {
      const classNames = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
      for (const name of classNames) {
        const cls = await Class.create({ name });
        const secA = await Section.create({ name: 'A', class: cls._id });
        await Section.create({ name: 'B', class: cls._id });
        if (name === 'X') {
          classTen = cls;
          sectionA = secA;
        }
      }
      console.log('✅ Classes (I-X) and Sections (A, B) created');
    } else {
      classTen = await Class.findOne({ name: 'X' });
      sectionA = await Section.findOne({ class: classTen?._id, name: 'A' });
    }

    // 3. Fee Categories
    let feeCatCount = await FeeCategory.countDocuments();
    let tuitionCat = null;
    let booksCat = null;
    if (feeCatCount === 0) {
      const feeCats = [
        'Admission Fee', 'Tuition Fee', 'Books Fee', 'School Bag Fee',
        'Tie Fee', 'Belt Fee', 'Uniform Fee', 'Room Rent', 'Electricity Bill', 'Other Charges'
      ];
      const createdCats = await FeeCategory.insertMany(feeCats.map(name => ({ name, isDefault: true })));
      tuitionCat = createdCats.find(c => c.name === 'Tuition Fee');
      booksCat = createdCats.find(c => c.name === 'Books Fee');
      console.log('✅ 10 Fee Categories created');
    } else {
      tuitionCat = await FeeCategory.findOne({ name: 'Tuition Fee' });
      booksCat = await FeeCategory.findOne({ name: 'Books Fee' });
    }

    // 4. Inventory Categories & Products
    let invCatCount = await InventoryCategory.countDocuments();
    let booksInvCat = null;
    let uniformInvCat = null;
    if (invCatCount === 0) {
      const invCats = ['Books', 'Stationery', 'Uniform', 'Bags', 'Accessories'];
      const createdInv = await InventoryCategory.insertMany(invCats.map(name => ({ name })));
      booksInvCat = createdInv.find(i => i.name === 'Books');
      uniformInvCat = createdInv.find(i => i.name === 'Uniform');
      console.log('✅ Inventory Categories created');
    } else {
      booksInvCat = await InventoryCategory.findOne({ name: 'Books' });
      uniformInvCat = await InventoryCategory.findOne({ name: 'Uniform' });
    }

    // Products
    let productCount = await Product.countDocuments();
    if (productCount === 0 && booksInvCat && uniformInvCat) {
      await Product.create([
        {
          name: 'Mathematics Class X',
          code: 'BK-MATH-10',
          category: booksInvCat._id,
          purchasePrice: 25000, // Rs. 250 in paise
          sellingPrice: 35000,  // Rs. 350 in paise
          quantity: 100,
          minStock: 10,
          supplier: 'NCERT Publishers'
        },
        {
          name: 'School Blazer (Navy Blue)',
          code: 'UNIF-BLAZ-M',
          category: uniformInvCat._id,
          purchasePrice: 90000,  // Rs. 900
          sellingPrice: 120000,  // Rs. 1200
          quantity: 50,
          minStock: 5,
          supplier: 'St. Michel Uniforms'
        }
      ]);
      console.log('✅ Default Products seeded');
    }

    // 5. Admin User
    let admin = await User.findOne({ email: 'admin@stmichel.com' });
    if (!admin) {
      admin = await User.create({
        name: 'System Admin',
        email: 'admin@stmichel.com',
        password: 'password123',
        role: 'super-admin'
      });
      console.log('✅ Super Admin account created');
    }

    // 6. Demo Parent & Student
    let parentUser = await User.findOne({ email: 'parent@stmichel.com' });
    if (!parentUser) {
      parentUser = await User.create({
        name: 'Rajesh Sharma',
        email: 'parent@stmichel.com',
        password: 'password123',
        role: 'parent'
      });
    }

    let parentProfile = await Parent.findOne({ user: parentUser._id });
    if (!parentProfile) {
      parentProfile = await Parent.create({
        user: parentUser._id,
        fullName: 'Rajesh Sharma',
        mobileNumber: '9876543210',
        email: 'parent@stmichel.com',
        address: '12 Green Park, St. Michel Road',
        occupation: 'Business'
      });
    }

    let studentUser = await User.findOne({ email: 'student@stmichel.com' });
    if (!studentUser) {
      studentUser = await User.create({
        name: 'Aarav Sharma',
        email: 'student@stmichel.com',
        password: 'password123',
        role: 'student'
      });
    }

    let studentProfile = await Student.findOne({ user: studentUser._id });
    if (!studentProfile && classTen && sectionA) {
      studentProfile = await Student.create({
        user: studentUser._id,
        parent: parentProfile._id,
        admissionNumber: 'STU2026001',
        rollNumber: '01',
        firstName: 'Aarav',
        lastName: 'Sharma',
        dateOfBirth: new Date('2010-05-15'),
        gender: 'Male',
        class: classTen._id,
        section: sectionA._id,
        academicSession: '2026-2027',
        attendancePercentage: 92,
        status: 'Active'
      });

      // Link student to parent
      parentProfile.students = [studentProfile._id];
      await parentProfile.save();
      console.log('✅ Demo Student & Parent accounts created');
    }

    // 7. Demo Bills
    if (studentProfile && tuitionCat) {
      let billCount = await Bill.countDocuments({ student: studentProfile._id });
      if (billCount === 0) {
        await Bill.create({
          billNumber: 'BILL-2026-001',
          student: studentProfile._id,
          academicSession: '2026-2027',
          items: [{
            feeCategory: tuitionCat._id,
            description: 'Tuition Fee - Quarter 1 (April - June)',
            amount: 750000, // Rs. 7,500
            quantity: 1
          }],
          totalAmount: 750000,
          discount: 0,
          lateFee: 0,
          payableAmount: 750000,
          paidAmount: 0,
          dueAmount: 750000,
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          status: 'Unpaid',
          billType: 'Tuition'
        });
        console.log('✅ Demo Tuition Bill created');
      }
    }

    // 8. Demo Announcements
    let announcementCount = await Announcement.countDocuments();
    if (announcementCount === 0 && admin) {
      await Announcement.create({
        title: 'Welcome to St. Michel School - Academic Year 2026-2027',
        content: 'We welcome all parents, students, and staff to the new academic session. School timings are 08:00 AM to 02:00 PM.',
        targetAudience: 'All',
        author: admin._id
      });
      console.log('✅ Welcome Announcement posted');
    }

    console.log('************************************************');
    console.log('  CREDENTIALS:');
    console.log('  Admin:   admin@stmichel.com   / password123');
    console.log('  Parent:  parent@stmichel.com  / password123');
    console.log('  Student: student@stmichel.com / password123');
    console.log('************************************************');

  } catch (err) {
    console.error('SYSTEM SEED ERROR:', err.message);
  }
};

module.exports = seedAuto;
