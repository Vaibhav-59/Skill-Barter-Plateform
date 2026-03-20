// models/Submission.js
const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge",
      required: true,
    },
    submissionLink: { type: String, default: "" },
    fileUrl: { type: String, default: "" },
    textAnswer: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
    score: { type: Number, default: 0 },
    feedback: { type: String, default: "" },
    aiFeedback: { type: String, default: "" },
    timeTaken: { type: Number, default: 0 }, // in seconds
    xpAwarded: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Prevent duplicate submissions (one submission per user per challenge)
submissionSchema.index({ userId: 1, challengeId: 1 }, { unique: true });

module.exports = mongoose.model("Submission", submissionSchema);
