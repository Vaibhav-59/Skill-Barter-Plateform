const mongoose = require("mongoose");

const ResourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["Web Development", "Data Science", "UI/UX Design", "Mobile Development", "AI & Machine Learning", "DevOps", "Other"],
    },
    resourceType: {
      type: String,
      required: true,
      enum: ["Video", "Article", "Course", "Documentation", "Book", "Tutorial"],
    },
    resourceLink: { type: String, required: true },
    thumbnail: { type: String, default: "" },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tags: [{ type: String, trim: true }],
    difficultyLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    duration: { type: String, default: "" }, // e.g. "2h 30m"
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    views: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Text index for full-text search
ResourceSchema.index({ title: "text", description: "text", tags: "text" });
ResourceSchema.index({ category: 1, resourceType: 1, difficultyLevel: 1 });

// Update average rating helper
ResourceSchema.statics.updateAverageRating = async function (resourceId) {
  const ResourceReview = mongoose.model("ResourceReview");
  const stats = await ResourceReview.aggregate([
    { $match: { resource: new mongoose.Types.ObjectId(resourceId) } },
    { $group: { _id: "$resource", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await this.findByIdAndUpdate(resourceId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      totalRatings: stats[0].count,
    });
  }
};

module.exports = mongoose.model("Resource", ResourceSchema);
