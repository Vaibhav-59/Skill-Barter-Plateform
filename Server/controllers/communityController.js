const Post = require("../models/Post");
const User = require("../models/User");

const POPULATE_USER  = { path: "user",           select: "name avatar profileImage experienceLevel verifiedSkills" };
const POPULATE_CMNT  = { path: "comments.user",   select: "name avatar profileImage" };
const POPULATE_REPLY = { path: "comments.replies.user", select: "name avatar profileImage" };
const POPULATE_ANS   = { path: "answers.user",    select: "name avatar profileImage experienceLevel verifiedSkills" };

/* ── helpers ─────────────────────────────────────────────────────── */
const populatePost = (query) =>
  query.populate(POPULATE_USER).populate(POPULATE_CMNT).populate(POPULATE_REPLY).populate(POPULATE_ANS);

const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

/* ─────────────────────────────────────────────────────────────────
   CREATE POST   POST /api/community
───────────────────────────────────────────────────────────────────*/
exports.createPost = async (req, res) => {
  try {
    const { content, imageUrl, tags, postType, title, resourceLink } = req.body;
    if (!content?.trim()) return res.status(400).json({ success: false, message: "Content is required" });

    const post = await Post.create({
      user: req.user._id,
      content: content.trim(),
      imageUrl: imageUrl || "",
      tags: Array.isArray(tags) ? tags.map(t => t.trim()).filter(Boolean)
           : (tags ? String(tags).split(",").map(t => t.trim()).filter(Boolean) : []),
      postType: postType || "post",
      title: title?.trim() || "",
      resourceLink: resourceLink?.trim() || "",
    });

    const populated = await populatePost(Post.findById(post._id));
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────────
   GET ALL POSTS  GET /api/community
───────────────────────────────────────────────────────────────────*/
exports.getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 15, postType, tag, sort = "newest", search, saved } = req.query;

    const filter = {};
    if (postType && postType !== "all") filter.postType = postType;
    if (tag)    filter.tags = { $in: [new RegExp(escapeRegex(tag), "i")] };
    if (search) filter.$text = { $search: search };
    if (saved === "true") filter.saves = req.user._id;

    const sortMap = {
      newest:     { createdAt: -1 },
      popular:    { "likes": -1 },
      unanswered: { "answers": 1, createdAt: -1 },
    };
    const sortKey = sortMap[sort] || sortMap.newest;

    const [posts, total] = await Promise.all([
      populatePost(Post.find(filter).sort(sortKey).skip((page - 1) * limit).limit(Number(limit))),
      Post.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: posts,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────────
   GET SINGLE POST  GET /api/community/:id
───────────────────────────────────────────────────────────────────*/
exports.getPost = async (req, res) => {
  try {
    const post = await populatePost(
      Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
    );
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });
    res.json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────────
   DELETE POST   DELETE /api/community/:id
───────────────────────────────────────────────────────────────────*/
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Not found" });
    if (post.user.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ success: false, message: "Forbidden" });
    await post.deleteOne();
    res.json({ success: true, message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────────
   TOGGLE LIKE   POST /api/community/:id/like
───────────────────────────────────────────────────────────────────*/
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Not found" });
    const uid = req.user._id.toString();
    const idx = post.likes.findIndex(l => l.toString() === uid);
    if (idx === -1) post.likes.push(req.user._id);
    else            post.likes.splice(idx, 1);
    await post.save();
    res.json({ success: true, liked: idx === -1, likeCount: post.likes.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────────
   TOGGLE SAVE   POST /api/community/:id/save
───────────────────────────────────────────────────────────────────*/
exports.toggleSave = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Not found" });
    const uid = req.user._id.toString();
    const idx = post.saves.findIndex(s => s.toString() === uid);
    if (idx === -1) post.saves.push(req.user._id);
    else            post.saves.splice(idx, 1);
    await post.save();
    res.json({ success: true, saved: idx === -1 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────────
   ADD COMMENT   POST /api/community/:id/comment
───────────────────────────────────────────────────────────────────*/
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ success: false, message: "Comment content required" });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Not found" });
    post.comments.push({ user: req.user._id, content: content.trim() });
    await post.save();
    const updated = await populatePost(Post.findById(post._id));
    res.json({ success: true, data: updated.comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────────
   DELETE COMMENT  DELETE /api/community/:id/comment/:commentId
───────────────────────────────────────────────────────────────────*/
exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Not found" });
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });
    if (comment.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Forbidden" });
    comment.deleteOne();
    await post.save();
    res.json({ success: true, message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────────
   LIKE COMMENT   POST /api/community/:id/comment/:commentId/like
───────────────────────────────────────────────────────────────────*/
exports.likeComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Not found" });
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });
    const uid = req.user._id.toString();
    const idx = comment.likes.findIndex(l => l.toString() === uid);
    if (idx === -1) comment.likes.push(req.user._id);
    else            comment.likes.splice(idx, 1);
    await post.save();
    res.json({ success: true, liked: idx === -1, likeCount: comment.likes.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────────
   ADD REPLY   POST /api/community/:id/comment/:commentId/reply
───────────────────────────────────────────────────────────────────*/
exports.addReply = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ success: false, message: "Reply content required" });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Not found" });
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });
    comment.replies.push({ user: req.user._id, content: content.trim() });
    await post.save();
    const updated = await populatePost(Post.findById(post._id));
    res.json({ success: true, data: updated.comments.id(req.params.commentId)?.replies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────────
   ADD ANSWER   POST /api/community/:id/answer
───────────────────────────────────────────────────────────────────*/
exports.addAnswer = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ success: false, message: "Answer content required" });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Not found" });
    if (post.postType !== "question")
      return res.status(400).json({ success: false, message: "Answers only for questions" });
    post.answers.push({ user: req.user._id, content: content.trim() });
    await post.save();
    const updated = await populatePost(Post.findById(post._id));
    res.json({ success: true, data: updated.answers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────────
   UPVOTE ANSWER  POST /api/community/:id/answer/:answerId/upvote
───────────────────────────────────────────────────────────────────*/
exports.upvoteAnswer = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Not found" });
    const answer = post.answers.id(req.params.answerId);
    if (!answer) return res.status(404).json({ success: false, message: "Answer not found" });
    const uid = req.user._id.toString();
    const idx = answer.upvotes.findIndex(u => u.toString() === uid);
    if (idx === -1) answer.upvotes.push(req.user._id);
    else            answer.upvotes.splice(idx, 1);
    await post.save();
    res.json({ success: true, upvoted: idx === -1, upvoteCount: answer.upvotes.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────────
   ACCEPT ANSWER  PUT /api/community/:id/answer/:answerId/accept
───────────────────────────────────────────────────────────────────*/
exports.acceptAnswer = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Not found" });
    if (post.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Only post author can accept answers" });
    post.answers.forEach(a => { a.isAccepted = false; });
    const answer = post.answers.id(req.params.answerId);
    if (answer) { answer.isAccepted = true; post.acceptedAnswerId = answer._id; }
    await post.save();
    res.json({ success: true, message: "Answer accepted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────────
   TRENDING TAGS  GET /api/community/trending-tags
───────────────────────────────────────────────────────────────────*/
exports.getTrendingTags = async (req, res) => {
  try {
    const tags = await Post.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 },
      { $project: { tag: "$_id", count: 1, _id: 0 } },
    ]);
    res.json({ success: true, data: tags });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────────
   RECOMMENDED POSTS  GET /api/community/recommended
───────────────────────────────────────────────────────────────────*/
exports.getRecommended = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("teachSkills learnSkills").lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const skills = [
      ...(user.learnSkills || []).map(s => typeof s === "string" ? s : s.name || ""),
      ...(user.teachSkills || []).map(s => typeof s === "string" ? s : s.name || ""),
    ].filter(Boolean);

    const posts = skills.length > 0
      ? await populatePost(Post.find({ tags: { $in: skills.map(s => new RegExp(escapeRegex(s), "i")) } }).sort({ createdAt: -1 }).limit(10))
      : await populatePost(Post.find({}).sort({ createdAt: -1 }).limit(10));

    res.json({ success: true, data: posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
