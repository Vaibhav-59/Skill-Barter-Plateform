const mongoose = require("mongoose");

// ── Reply sub-schema ──────────────────────────────────────────────
const ReplySchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content:   { type: String, required: true, trim: true },
  likes:     [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

// ── Comment sub-schema ────────────────────────────────────────────
const CommentSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content:   { type: String, required: true, trim: true },
  likes:     [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  replies:   [ReplySchema],
}, { timestamps: true });

// ── Answer sub-schema (for Q&A posts) ────────────────────────────
const AnswerSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content:    { type: String, required: true, trim: true },
  upvotes:    [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isAccepted: { type: Boolean, default: false },
}, { timestamps: true });

// ── Post main schema ──────────────────────────────────────────────
const PostSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content:  { type: String, required: true, trim: true },
  imageUrl: { type: String, default: "" },
  tags:     [{ type: String, trim: true }],
  postType: { type: String, enum: ["post", "question", "discussion"], default: "post" },
  title:    { type: String, trim: true, default: "" }, // for questions
  resourceLink: { type: String, default: "" },
  likes:    [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  saves:    [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [CommentSchema],
  answers:  [AnswerSchema],
  acceptedAnswerId: { type: mongoose.Schema.Types.ObjectId, default: null },
  views:    { type: Number, default: 0 },
  isPinned: { type: Boolean, default: false },
}, { timestamps: true });

PostSchema.index({ content: "text", tags: "text", title: "text" });
PostSchema.index({ postType: 1, createdAt: -1 });
PostSchema.index({ tags: 1 });

module.exports = mongoose.model("Post", PostSchema);
