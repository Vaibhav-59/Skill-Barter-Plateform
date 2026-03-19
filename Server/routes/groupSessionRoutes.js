const express = require("express");
const {
  createGroupSession,
  getAllGroupSessions,
  getGroupSession,
  joinGroupSession,
  leaveGroupSession,
  updateGroupSession,
  deleteGroupSession,
  sendChatMessage,
  getMySessionStats,
  getMySessions,
  getJoinedSessions,
} = require("../controllers/groupSessionController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/stats/me", getMySessionStats);
router.get("/my-sessions", getMySessions);
router.get("/joined-sessions", getJoinedSessions);

router.post("/create", createGroupSession);
router.get("/", getAllGroupSessions);
router.get("/:id", getGroupSession);
router.post("/join/:id", joinGroupSession);
router.post("/leave/:id", leaveGroupSession);
router.put("/update/:id", updateGroupSession);
router.delete("/:id", deleteGroupSession);
router.post("/:id/chat", sendChatMessage);

module.exports = router;
