const express = require("express");
const {
  createSession,
  getUserSessions,
  acceptSession,
  rejectSession,
  completeSession,
  deleteSession,
} = require("../controllers/sessionController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect); // All routes require authentication

router.route("/").post(createSession).get(getUserSessions);

router.route("/:id/accept").put(acceptSession);
router.route("/:id/reject").put(rejectSession);
router.route("/:id/complete").put(completeSession);
router.route("/:id").delete(deleteSession);

module.exports = router;
