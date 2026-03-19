const mongoose = require("mongoose");

const verificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    skillName: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    totalQuestions: {
      type: Number,
      required: true,
      default: 10,
    },
    score: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "passed", "failed"],
      default: "pending",
    },
    timeTaken: {
      type: Number, // seconds
      default: 0,
    },
    questions: [
      {
        question: String,
        options: [String],
        correctAnswer: String,
        userAnswer: {
          type: String,
          default: "",
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Verification", verificationSchema);

