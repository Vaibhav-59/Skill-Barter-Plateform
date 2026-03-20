const express = require("express");
const { protect } = require("../middleware/auth");
const {
  createNotification,
  getMyNotifications,
  markAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

const router = express.Router();

router.post("/", protect, createNotification);
router.get("/", protect, getMyNotifications);
router.put("/:id/read", protect, markAsRead);
router.delete("/:id", protect, deleteNotification);

module.exports = router;
