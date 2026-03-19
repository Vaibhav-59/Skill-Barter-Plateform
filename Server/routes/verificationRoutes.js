const express = require("express");
const { protect } = require("../middleware/auth");
const {
  generateTest,
  submitTest,
  getHistory,
  getLeaderboard,
  getVerifiedSkillsStats,
} = require("../controllers/verificationController");

const router = express.Router();

router.use(protect);

router.post("/generate-test", generateTest);
router.post("/submit", submitTest);
router.get("/history", getHistory);
router.get("/leaderboard", getLeaderboard);
router.get("/stats/me", getVerifiedSkillsStats);

module.exports = router;
