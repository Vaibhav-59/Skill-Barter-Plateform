const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    hostUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participantUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    skillTeach: {
      type: String,
      required: true,
    },
    skillLearn: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String, // format HH:mm
      required: true,
    },
    endTime: {
      type: String, // format HH:mm
      required: true,
    },
    meetingLink: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    reminder10MinSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);
