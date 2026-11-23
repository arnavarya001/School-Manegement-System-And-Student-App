const mongoose = require('mongoose');

const StaffSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: [true, 'Please add employee ID'],
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: [true, 'Please add staff name'],
  },
  role: {
    type: String,
    enum: ['Teacher', 'Accountant', 'Admin Staff', 'Clerk', 'Librarian', 'Security', 'Maintenance', 'Driver', 'Other'],
    default: 'Teacher',
  },
  department: {
    type: String,
    default: 'Academics',
  },
  phone: {
    type: String,
    required: [true, 'Please add phone number'],
  },
  email: {
    type: String,
    required: [true, 'Please add email'],
  },
  salary: {
    type: Number, // In paise
    required: true,
    default: 2500000, // Rs. 25,000
  },
  joiningDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Active', 'On Leave', 'Resigned'],
    default: 'Active',
  },
  assignedClasses: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Class',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Staff', StaffSchema);
