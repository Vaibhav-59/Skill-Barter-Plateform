// /models/Gamification.js
const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema({
  badgeName: { type: String, required: true },
  description: { type: String, default: "" },
  icon: { type: String, default: "🏆" },
  category: {
    type: String,
    enum: ["session", "teaching", "learning", "streak", "verification", "social", "challenge"],
    default: "session",
  },
  earnedAt: { type: Date, default: Date.now },
});

const achievementSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  target: { type: Number, required: true },
  current: { type: Number, default: 0 },
  category: { type: String, default: "session" },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  xpReward: { type: Number, default: 50 },
});

const gamificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    learningStreak: { type: Number, default: 0 },
    teachingStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    sessionsCompleted: { type: Number, default: 0 },
    sessionsTaught: { type: Number, default: 0 },
    skillsLearned: { type: Number, default: 0 },
    skillsVerified: { type: Number, default: 0 },
    challengesCompleted: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null },
    badges: [badgeSchema],
    achievements: [achievementSchema],
    xpHistory: [
      {
        amount: { type: Number },
        reason: { type: String },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Level thresholds: level = floor(sqrt(xp / 100)) + 1
gamificationSchema.methods.computeLevel = function () {
  return Math.floor(Math.sqrt(this.xp / 100)) + 1;
};

// XP needed for next level
gamificationSchema.methods.xpForNextLevel = function () {
  const nextLevel = this.level + 1;
  return Math.pow(nextLevel - 1, 2) * 100;
};

module.exports = mongoose.model("Gamification", gamificationSchema);
