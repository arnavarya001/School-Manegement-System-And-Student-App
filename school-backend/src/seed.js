const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Class = require('./models/Class');
const Section = require('./models/Section');
const FeeCategory = require('./models/FeeCategory');
const InventoryCategory = require('./models/InventoryCategory');
const SchoolSetting = require('./models/SchoolSetting');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // 1. Clear existing data
    await User.deleteMany();
    await Class.deleteMany();
    await Section.deleteMany();
    await FeeCategory.deleteMany();
    await InventoryCategory.deleteMany();
    await SchoolSetting.deleteMany();

    // 2. Create Admin User
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@stmichel.com',
      password: 'password123',
      role: 'super-admin'
    });
    console.log('Admin user created');

    // 3. Create Default School Settings
    await SchoolSetting.create({
      name: 'St. Michel School',
      address: 'St. Michel Road, City Center, PIN-000000',
      contactNumber: '+91 12345 67890',
      email: 'info@stmichelschool.com',
      academicSessions: [{ year: '2023-2024', isCurrent: true }],
      schoolTimings: { start: '08:00', end: '14:00' }
    });

    // 4. Create Classes and Sections
    const classes = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    for (const className of classes) {
      const cls = await Class.create({ name: className });
      await Section.create({ name: 'A', class: cls._id });
      await Section.create({ name: 'B', class: cls._id });
    }
    console.log('Classes and Sections created');

    // 5. Create Fee Categories
    const feeCats = [
      'Admission Fee', 'Tuition Fee', 'Books Fee', 'School Bag Fee',
      'Tie Fee', 'Belt Fee', 'Uniform Fee', 'Room Rent', 'Electricity Fee'
    ];
    await FeeCategory.insertMany(feeCats.map(name => ({ name, isDefault: true })));
    console.log('Fee Categories created');

    // 6. Create Inventory Categories
    const invCats = ['Books', 'Stationery', 'Uniform', 'Bags', 'Accessories'];
    await InventoryCategory.insertMany(invCats.map(name => ({ name })));
    console.log('Inventory Categories created');

    console.log('Seeding completed successfully!');
    process.exit();
  } catch (err) {
    console.error('Seeding Error:', err.message);
    process.exit(1);
  }
};

seedData();
