const Notification = require('../models/Notification');

class NotificationService {
  /**
   * Create a notification for a user
   * @param {string} userId
   * @param {Object} data { title, message, type, link }
   */
  async notify(userId, data) {
    try {
      await Notification.create({
        user: userId,
        ...data
      });
      // Here you could also integrate Socket.IO for real-time notifications
      // or send Push/Email/SMS notifications
    } catch (err) {
      console.error('Notification Error:', err.message);
    }
  }

  /**
   * Notify a parent about all their students (e.g. for announcements)
   */
  async notifyParent(parentId, data) {
    const Parent = require('../models/Parent');
    const parent = await Parent.findById(parentId);
    if (parent) {
      await this.notify(parent.user, data);
    }
  }
}

module.exports = new NotificationService();
