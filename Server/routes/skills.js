const express = require("express");
const router = express.Router();

const {
  addSkill,
  getSkills,
  addTeachSkill,
  removeTeachSkill,
  addLearnSkill,
  removeLearnSkill,
  updateTeachSkillLevel,
  updateLearnSkillLevel,
} = require("../controllers/skillController");

const { protect } = require("../middleware/auth");

// Global skill operations
router.post("/", protect, addSkill);
router.get("/", getSkills);

// User-specific skills
router.post("/teach", protect, addTeachSkill);
router.post("/learn", protect, addLearnSkill);
router.delete("/learn/:name", protect, removeLearnSkill);
router.delete("/teach/:name", protect, removeTeachSkill);
router.patch("/teach/:name/level", protect, updateTeachSkillLevel);
router.patch("/learn/:name/level", protect, updateLearnSkillLevel);

module.exports = router;
