// /controllers/skillController.js
const Skill = require("../models/Skill");

// Add a new skill
exports.addSkill = async (req, res, next) => {
  try {
    const { name, category, subcategory, description, type } = req.body;
    console.log('Creating skill with data:', { name, category, subcategory, description, type, createdBy: req.user._id });

    const skill = await Skill.create({
      name,
      category,
      subcategory,
      description,
      type,
      createdBy: req.user._id,
    });

    console.log('Skill created successfully:', skill);
    console.log('Saved to collection:', Skill.collection.collectionName);

    res.status(201).json(skill);
  } catch (err) {
    console.error('Error creating skill:', err);
    next(err);
  }
};

// Get all skills
exports.getSkills = async (req, res, next) => {
  try {
    const skills = await Skill.find();
    res.json(skills);
  } catch (err) {
    next(err);
  }
};

// Add to teachSkills (User only)
exports.addTeachSkill = async (req, res, next) => {
  try {
    const { name, level } = req.body;

    if (!name || !level) {
      return res.status(400).json({ message: "Skill name and level required" });
    }

    console.log('Adding teach skill to user:', { userId: req.user._id, name, level });

    // Avoid duplicates
    const exists = req.user.teachSkills.find((s) => s.name === name);
    if (exists) {
      return res.status(400).json({ message: "Skill already added" });
    }

    req.user.teachSkills.push({ name, level });
    await req.user.save();

    console.log('Teach skill added to user collection');
    console.log('Saved to collection: users');

    res.status(200).json({ teachSkills: req.user.teachSkills });
  } catch (err) {
    console.error('Error adding teach skill:', err);
    next(err);
  }
};

// Add to learnSkills
exports.addLearnSkill = async (req, res, next) => {
  try {
    const { name, level } = req.body;
    if (!name || !level) {
      return res.status(400).json({ message: "Skill name and level required" });
    }

    const exists = req.user.learnSkills.find((s) => s.name === name);
    if (exists) {
      return res.status(400).json({ message: "Skill already added" });
    }

    req.user.learnSkills.push({ name, level });
    await req.user.save();

    res.status(200).json({ learnSkills: req.user.learnSkills });
  } catch (err) {
    next(err);
  }
};

// Remove from learnSkills
exports.removeLearnSkill = async (req, res, next) => {
  try {
    const name = req.query.name || req.body.name;

    req.user.learnSkills = req.user.learnSkills.filter((s) => s.name !== name);
    await req.user.save();

    res.status(200).json({ learnSkills: req.user.learnSkills });
  } catch (err) {
    next(err);
  }
};

// Remove teach skill
exports.removeTeachSkill = async (req, res, next) => {
  const name = req.query.name || req.body.name;
  req.user.teachSkills = req.user.teachSkills.filter((s) => s.name !== name);
  await req.user.save();
  res.status(200).json({ teachSkills: req.user.teachSkills });
};

// Update teach skill level
exports.updateTeachSkillLevel = async (req, res, next) => {
  try {
    const name = req.query.name || req.body.name;
    const { level } = req.body;
    if (!level) return res.status(400).json({ message: "Level required" });
    const skill = req.user.teachSkills.find((s) => s.name === name);
    if (!skill) return res.status(404).json({ message: "Skill not found" });
    skill.level = level;
    await req.user.save();
    res.status(200).json({ teachSkills: req.user.teachSkills });
  } catch (err) {
    next(err);
  }
};

// Update learn skill level
exports.updateLearnSkillLevel = async (req, res, next) => {
  try {
    const name = req.query.name || req.body.name;
    const { level } = req.body;
    if (!level) return res.status(400).json({ message: "Level required" });
    const skill = req.user.learnSkills.find((s) => s.name === name);
    if (!skill) return res.status(404).json({ message: "Skill not found" });
    skill.level = level;
    await req.user.save();
    res.status(200).json({ learnSkills: req.user.learnSkills });
  } catch (err) {
    next(err);
  }
};
