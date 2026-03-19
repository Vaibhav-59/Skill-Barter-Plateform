const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "joined"],
      default: "joined",
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const chatMessageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const groupSessionSchema = new mongoose.Schema(
  {
    hostUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Session title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    skill: {
      type: String,
      required: [true, "Skill is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    date: {
      type: Date,
      required: [true, "Session date is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
    },
    maxParticipants: {
      type: Number,
      required: true,
      min: [2, "Must allow at least 2 participants"],
      max: [100, "Cannot exceed 100 participants"],
      default: 10,
    },
    participants: [participantSchema],
    meetingLink: {
      type: String,
      default: "",
    },
    sessionType: {
      type: String,
      enum: ["live", "scheduled"],
      default: "scheduled",
    },
    status: {
      type: String,
      enum: ["scheduled", "live", "completed", "cancelled"],
      default: "scheduled",
    },
    recordingLink: {
      type: String,
      default: "",
    },
    creditsAwarded: {
      type: Boolean,
      default: false,
    },
    chat: [chatMessageSchema],
  },
  { timestamps: true }
);

// Virtual for participant count
groupSessionSchema.virtual("participantCount").get(function () {
  return this.participants.length;
});

// Auto-generate meeting link before save
groupSessionSchema.pre("save", function (next) {
  if (!this.meetingLink) {
    const randomId = Math.random().toString(36).substring(2, 12);
    this.meetingLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/meeting/${randomId}`;
  }
  next();
});

module.exports = mongoose.model("GroupSession", groupSessionSchema);
