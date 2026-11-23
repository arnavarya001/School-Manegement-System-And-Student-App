const Announcement = require('../models/Announcement');

// @desc    Get all announcements
// @route   GET /api/v1/announcements
// @access  Public
exports.getAnnouncements = async (req, res, next) => {
  try {
    const { target } = req.query;
    let query = { active: true };

    if (target) {
      query.targetAudience = { $in: ['All', target] };
    }

    const announcements = await Announcement.find(query).sort('-createdAt').populate('author', 'name');
    res.status(200).json({ success: true, count: announcements.length, data: announcements });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create announcement
// @route   POST /api/v1/announcements
// @access  Private (Admin/Manager)
exports.createAnnouncement = async (req, res, next) => {
  try {
    req.body.author = req.user.id;
    const announcement = await Announcement.create(req.body);
    res.status(201).json({ success: true, data: announcement });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update announcement
// @route   PUT /api/v1/announcements/:id
// @access  Private (Admin/Manager)
exports.updateAnnouncement = async (req, res, next) => {
  try {
    let announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ success: false, error: 'Announcement not found' });
    }

    announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: announcement });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/v1/announcements/:id
// @access  Private (Admin/Manager)
exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ success: false, error: 'Announcement not found' });
    }

    await announcement.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
