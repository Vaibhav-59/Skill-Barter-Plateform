// /server/models/SkillContract.js
const mongoose = require("mongoose");

const contractSessionSchema = new mongoose.Schema(
  {
    sessionNumber: { type: Number, required: true },
    date: { type: Date },
    startTime: { type: String },
    endTime: { type: String },
    meetingLink: { type: String, default: "" },
    notes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "scheduled", "completed", "cancelled"],
      default: "pending",
    },
    reminderSent1h: { type: Boolean, default: false },
    reminderSent10m: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const skillContractSchema = new mongoose.Schema(
  {
    userA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    skillTeach: { type: String, required: true },  // What userA teaches
    skillLearn: { type: String, required: true },   // What userA learns (userB teaches)
    totalSessions: { type: Number, required: true, min: 1, max: 100 },
    sessionDuration: { type: Number, required: true }, // minutes
    completedSessions: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    notes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled"],
      default: "pending",
    },
    // Approvals – both must approve for contract to become active
    approvedByA: { type: Boolean, default: false },
    approvedByB: { type: Boolean, default: false },
    sessions: [contractSessionSchema],
    // Optional: link to a Review after completion
    reviewLeft: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-compute completedSessions from sessions array
skillContractSchema.methods.syncCompletedSessions = function () {
  this.completedSessions = this.sessions.filter(
    (s) => s.status === "completed"
  ).length;
  if (
    this.completedSessions >= this.totalSessions &&
    this.status === "active"
  ) {
    this.status = "completed";
  }
};

module.exports = mongoose.model("SkillContract", skillContractSchema);
