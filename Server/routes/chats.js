const express = require("express");
const {
  sendMessage,
  getMessages,
  getUserConversations,
  getOrCreateConversation,
  markMessageAsSeen,
  getUnreadCount,
  uploadFile,
} = require("../controllers/chatController");
const { protect } = require("../middleware/auth");
const { body } = require("express-validator");
const { runValidation } = require("../middleware/validator");
const { upload } = require("../middleware/upload");

const router = express.Router();

// Get all user conversations
router.get("/conversations", protect, getUserConversations);

// Get or create conversation for a match
router.get("/conversations/match/:matchId", protect, getOrCreateConversation);

// Get messages for a conversation
router.get("/conversations/:conversationId/messages", protect, getMessages);

// Send message
router.post(
  "/messages",
  [
    protect,
    body("conversationId")
      .notEmpty()
      .withMessage("Conversation ID is required"),
    body("text").optional().trim(),
    body("messageType")
      .optional()
      .isIn(["text", "image", "video", "document", "call"])
      .withMessage("Invalid message type"),
    runValidation,
  ],
  sendMessage
);

// Mark message as seen
router.patch("/messages/:messageId/seen", protect, markMessageAsSeen);

// Get unread message count
router.get("/unread-count", protect, getUnreadCount);

// Upload file endpoint
router.post(
  "/upload",
  protect,
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  uploadFile
);

// Legacy routes (keep for backward compatibility)
router.post("/", protect, sendMessage);
router.get("/:matchId", protect, getMessages);

module.exports = router;
