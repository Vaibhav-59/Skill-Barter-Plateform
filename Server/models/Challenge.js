// models/Challenge.js
const mongoose = require("mongoose");

const challengeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    skillCategory: {
      type: String,
      required: true,
      enum: ["Web Development", "Data Science", "UI/UX Design", "AI & Machine Learning", "Mobile Development", "DevOps", "Cybersecurity", "Other"],
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    inputOutputExamples: [
      {
        input: { type: String },
        output: { type: String },
        explanation: { type: String },
      },
    ],
    rewardXP: { type: Number, default: 50 },
    timeLimit: { type: Number, default: null }, // in minutes, null = no limit
    participantsCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isDaily: { type: Boolean, default: false },
    isTeamChallenge: { type: Boolean, default: false },
    isAIGenerated: { type: Boolean, default: false },
    tags: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    expiresAt: { type: Date, default: null }, // for daily challenges
  },
  { timestamps: true }
);

module.exports = mongoose.model("Challenge", challengeSchema);
