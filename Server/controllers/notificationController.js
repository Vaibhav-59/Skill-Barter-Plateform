// /controllers/notificationController.js
const Notification = require("../models/Notification");

// Create notification
exports.createNotification = async (req, res, next) => {
  try {
    const notif = await Notification.create(req.body);
    res.status(201).json(notif);
  } catch (err) {
    next(err);
  }
};

// Get user's notifications
exports.getMyNotifications = async (req, res, next) => {
  try {
    const notifs = await Notification.find({ recipient: req.user._id }).sort(
      "-createdAt"
    );
    res.json(notifs);
  } catch (err) {
    next(err);
  }
};

// Mark notification as read
exports.markAsRead = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: "Marked as read" });
  } catch (err) {
    next(err);
  }
};

// Delete notification
exports.deleteNotification = async (req, res, next) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    // Check if the recipient matches
    if (notif.recipient.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to delete this notification" });
    }
    
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: "Notification deleted" });
  } catch (err) {
    next(err);
  }
};
