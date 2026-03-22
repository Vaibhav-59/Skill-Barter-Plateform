// routes/challengeRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getAllChallenges,
  getChallengeById,
  startChallenge,
  submitChallenge,
  getUserHistory,
  getLeaderboard,
  getUserStats,
  reviewSubmission,
  generateAIChallenge,
  seedChallenges,
  createChallenge,
  getMyCreatedChallenges,
  getChallengeSubmissions,
  getDailyChallenge,
} = require("../controllers/challengeController");

// Public / Protected routes
router.get("/", protect, getAllChallenges);
router.post("/", protect, createChallenge);
router.get("/daily", protect, getDailyChallenge);  // MUST be before /:id
router.get("/my-created", protect, getMyCreatedChallenges);
router.get("/leaderboard", protect, getLeaderboard);
router.get("/history", protect, getUserHistory);
router.get("/stats", protect, getUserStats);
router.get("/:id", protect, getChallengeById);
router.get("/:id/submissions", protect, getChallengeSubmissions);

router.post("/start/:id", protect, startChallenge);
router.post("/submit", protect, submitChallenge);
router.post("/generate-ai", protect, generateAIChallenge);

// Admin / utility / Creator review
router.post("/seed", protect, seedChallenges);
router.put("/submission/:id/review", protect, reviewSubmission);

module.exports = router;
