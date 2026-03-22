const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  generatePath,
  getUserPaths,
  getSinglePath,
  updateProgress,
  savePath,
  deletePath,
  adaptPath,
  getSkillExchange,
  markDailyTask,
} = require("../controllers/learningPathController");

// All routes require authentication
router.use(protect);

// Specific named routes FIRST (before parameterized :id routes)
router.post("/generate", generatePath);
router.get("/skill-exchange/suggest", getSkillExchange);
router.put("/progress", updateProgress);
router.put("/save", savePath);
router.put("/daily-task", markDailyTask);
router.post("/adapt", adaptPath);

// Parameterized routes after
router.get("/", getUserPaths);
router.get("/:id", getSinglePath);
router.delete("/:id", deletePath);

module.exports = router;
