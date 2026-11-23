const User = require('../models/User');
const Parent = require('../models/Parent');
const Student = require('../models/Student');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await User.create({ name, email, password, role });
    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.login = async (req, res, next) => {
  try {
    let { email, password, phone } = req.body;
    let identifier = (email || phone || '').trim();
    if (password) password = password.trim();

    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: 'Enter email/phone and password' });
    }

    const lowerId = identifier.toLowerCase();
    let user = await User.findOne({
      $or: [
        { email: lowerId },
        { phone: identifier }
      ]
    }).select('+password');

    // If not found directly, check if identifier matches a student's phone or admissionNumber
    if (!user) {
      const student = await Student.findOne({
        $or: [
          { phone: identifier },
          { admissionNumber: identifier.toUpperCase() },
          { admissionNumber: identifier }
        ]
      }).populate('user');
      if (student && student.user) {
        user = await User.findById(student.user._id).select('+password');
      }
    }

    // If still not found, check if identifier matches a parent's mobileNumber
    if (!user) {
      const parent = await Parent.findOne({ mobileNumber: identifier }).populate('user');
      if (parent && parent.user) {
        user = await User.findById(parent.user._id).select('+password');
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found. Check phone or email.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Wrong password' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('CRITICAL LOGIN ERROR:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
};

// TEMPORARY: Debug route to see all users in memory
exports.listUsers = async (req, res) => {
  const users = await User.find({});
  res.json({ count: users.length, users: users.map(u => ({ email: u.email, role: u.role })) });
};

exports.getMe = async (req, res, next) => {
  try {
    let user = await User.findById(req.user.id);
    let profile = null;

    if (user.role === 'parent') {
      profile = await Parent.findOne({ user: user._id }).populate({
        path: 'students',
        populate: ['class', 'section']
      });
    } else if (user.role === 'student') {
      profile = await Student.findOne({ user: user._id }).populate(['class', 'section', 'parent']);
    }

    res.status(200).json({ success: true, data: user, profile: profile });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
};
