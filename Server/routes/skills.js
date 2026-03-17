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
router.delete("/learn", protect, removeLearnSkill);
router.delete("/teach", protect, removeTeachSkill);
router.patch("/teach/level", protect, updateTeachSkillLevel);
router.patch("/learn/level", protect, updateLearnSkillLevel);

module.exports = router;
