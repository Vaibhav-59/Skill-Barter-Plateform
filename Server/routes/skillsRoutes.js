const express = require("express");
const router = express.Router();
const {
  getAllSkillsWithExperts,
  getExpertsBySkill,
  getExpertProfile,
} = require("../controllers/skillsController");

// GET /api/skills/explore         - all skills with expert counts
router.get("/", getAllSkillsWithExperts);

// GET /api/skills/explore/:skillName/experts  - experts for a given skill
router.get("/:skillName/experts", getExpertsBySkill);

// GET /api/skills/explore/expert/:id  - single expert profile
router.get("/expert/:id", getExpertProfile);

module.exports = router;
