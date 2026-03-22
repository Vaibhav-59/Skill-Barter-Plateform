const mongoose = require("mongoose");

const StepSchema = new mongoose.Schema({
  stepNumber: { type: Number, required: true },
  skill: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ["Beginner", "Easy", "Medium", "Intermediate", "Advanced", "Expert"],
    default: "Medium",
  },
  estimatedTime: { type: String, default: "1 week" },
  resources: [
    {
      title: String,
      url: String,
      type: { type: String, enum: ["video", "article", "course", "other"], default: "article" },
    },
  ],
  // dependency: which step numbers must be completed first
  dependsOn: [{ type: Number }],
  xpReward: { type: Number, default: 50 },
});

const DailyPlanSchema = new mongoose.Schema({
  date: { type: String }, // "YYYY-MM-DD"
  stepNumber: { type: Number },
  task: { type: String },
  duration: { type: String, default: "30 mins" },
  done: { type: Boolean, default: false },
});

const LearningPathSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    goal: { type: String, required: true, trim: true },
    steps: [StepSchema],
    completedSteps: [{ type: Number }], // step numbers
    progress: { type: Number, default: 0 }, // 0-100 percentage
    isActive: { type: Boolean, default: true },
    totalXP: { type: Number, default: 0 },
    dailyPlan: [DailyPlanSchema],
    // notifications
    lastNotifiedStep: { type: Number, default: 0 },
    // adaptive fields
    adaptedAt: { type: Date },
    adaptationNote: { type: String },
    // streak tracking
    streakDays: { type: Number, default: 0 },
    lastActiveDate: { type: String }, // "YYYY-MM-DD"
  },
  { timestamps: true }
);

// Auto-compute progress before save
LearningPathSchema.pre("save", function (next) {
  if (this.steps && this.steps.length > 0) {
    this.progress = Math.round((this.completedSteps.length / this.steps.length) * 100);
  }
  next();
});

module.exports = mongoose.model("LearningPath", LearningPathSchema);
