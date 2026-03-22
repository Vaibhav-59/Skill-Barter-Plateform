const mongoose = require("mongoose");

const ResourceReviewSchema = new mongoose.Schema(
  {
    resource: { type: mongoose.Schema.Types.ObjectId, ref: "Resource", required: true },
    user:     { type: mongoose.Schema.Types.ObjectId, ref: "User",     required: true },
    rating:   { type: Number, required: true, min: 1, max: 5 },
    comment:  { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

// One review per user per resource
ResourceReviewSchema.index({ resource: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("ResourceReview", ResourceReviewSchema);
