// /routes/gamificationRoutes.js
const express = require("express");
const { protect } = require("../middleware/auth");
const {
  getGamification,
  updateGamification,
  getLeaderboard,
  dailyCheckIn,
} = require("../controllers/gamificationController");

const router = express.Router();

router.use(protect);

router.get("/", getGamification);
router.post("/update", updateGamification);
router.get("/leaderboard", getLeaderboard);
router.post("/daily-checkin", dailyCheckIn);

module.exports = router;
