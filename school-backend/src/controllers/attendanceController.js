const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// @desc    Mark attendance for a class/section
// @route   POST /api/v1/attendance
// @access  Private (Teacher/Manager)
exports.markAttendance = async (req, res, next) => {
  try {
    const { classId, sectionId, date, attendanceData } = req.body; // attendanceData: [{ studentId, status, remark }]

    const records = attendanceData.map(item => ({
      student: item.studentId,
      class: classId,
      section: sectionId,
      date: new Date(date),
      status: item.status,
      remark: item.remark,
      recordedBy: req.user.id
    }));

    // Use bulkWrite or simple insertMany with ordered: false to handle duplicates
    const attendanceRecords = await Attendance.insertMany(records, { ordered: false });

    // Update student attendance percentages (async)
    updateAttendancePercentages(classId, sectionId);

    res.status(201).json({
      success: true,
      count: attendanceRecords.length,
      data: attendanceRecords
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get attendance for a class/section on a date
// @route   GET /api/v1/attendance
// @access  Private
exports.getAttendance = async (req, res, next) => {
  try {
    const { classId, sectionId, date } = req.query;
    const query = { class: classId, section: sectionId };

    if (date) {
      const searchDate = new Date(date);
      searchDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(searchDate);
      nextDay.setDate(searchDate.getDate() + 1);

      query.date = { $gte: searchDate, $lt: nextDay };
    }

    const attendance = await Attendance.find(query).populate('student', 'firstName lastName admissionNumber');
    res.status(200).json({ success: true, count: attendance.length, data: attendance });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get student attendance report
// @route   GET /api/v1/attendance/student/:studentId
// @access  Private
exports.getStudentAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.find({ student: req.params.studentId }).sort('-date');
    res.status(200).json({ success: true, count: attendance.length, data: attendance });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Helper function to update percentages
async function updateAttendancePercentages(classId, sectionId) {
  try {
    const students = await Student.find({ class: classId, section: sectionId });
    for (const student of students) {
      const totalDays = await Attendance.countDocuments({ student: student._id });
      const presentDays = await Attendance.countDocuments({ student: student._id, status: 'Present' });

      if (totalDays > 0) {
        student.attendancePercentage = (presentDays / totalDays) * 100;
        await student.save();
      }
    }
  } catch (err) {
    console.error('Error updating attendance percentages:', err.message);
  }
}
