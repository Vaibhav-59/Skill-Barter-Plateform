const Resource = require("../models/Resource");
const ResourceReview = require("../models/ResourceReview");
const User = require("../models/User");

/* ─── helpers ───────────────────────────────────────────────────── */
const POPULATE = { path: "author", select: "name avatar profileImage experienceLevel" };

/* ─── CREATE ──────────────────────────────────────────────────────
   POST /api/resources
──────────────────────────────────────────────────────────────────── */
exports.createResource = async (req, res) => {
  try {
    const { title, description, category, resourceType, resourceLink, thumbnail, tags, difficultyLevel, duration } = req.body;

    // Detect duplicate link
    const existing = await Resource.findOne({ resourceLink: resourceLink.trim() });
    if (existing) return res.status(409).json({ success: false, message: "A resource with this link already exists." });

    const resource = await Resource.create({
      title, description, category, resourceType,
      resourceLink: resourceLink.trim(),
      thumbnail: thumbnail || "",
      author: req.user._id,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(",").map(t => t.trim()) : []),
      difficultyLevel: difficultyLevel || "Beginner",
      duration: duration || "",
    });

    const populated = await resource.populate(POPULATE);
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─── GET ALL ─────────────────────────────────────────────────────
   GET /api/resources
──────────────────────────────────────────────────────────────────── */
exports.getResources = async (req, res) => {
  try {
    const {
      page = 1, limit = 12, category, resourceType, difficultyLevel,
      sort = "newest", minRating = 0, search,
    } = req.query;

    const filter = { isApproved: true };
    if (category)        filter.category = category;
    if (resourceType)    filter.resourceType = resourceType;
    if (difficultyLevel) filter.difficultyLevel = difficultyLevel;
    if (minRating > 0)   filter.averageRating = { $gte: Number(minRating) };
    if (search)          filter.$text = { $search: search };

    const sortMap = {
      newest:   { createdAt: -1 },
      popular:  { views: -1 },
      rated:    { averageRating: -1 },
      liked:    { likes: -1 },
    };
    const sortKey = sortMap[sort] || sortMap.newest;

    const [resources, total] = await Promise.all([
      Resource.find(filter)
        .sort(sortKey)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate(POPULATE)
        .lean(),
      Resource.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: resources,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─── GET ONE ─────────────────────────────────────────────────────
   GET /api/resources/:id
──────────────────────────────────────────────────────────────────── */
exports.getResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate(POPULATE).lean();

    if (!resource) return res.status(404).json({ success: false, message: "Resource not found" });

    // fetch reviews
    const reviews = await ResourceReview.find({ resource: req.params.id })
      .populate({ path: "user", select: "name avatar profileImage" })
      .sort({ createdAt: -1 })
      .lean();

    // related resources
    const related = await Resource.find({
      category: resource.category,
      _id: { $ne: resource._id },
      isApproved: true,
    })
      .limit(4)
      .populate(POPULATE)
      .lean();

    res.json({ success: true, data: { ...resource, reviews, related } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─── UPDATE ──────────────────────────────────────────────────────
   PUT /api/resources/:id
──────────────────────────────────────────────────────────────────── */
exports.updateResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: "Not found" });
    if (resource.author.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Forbidden" });

    const allowed = ["title", "description", "category", "resourceType", "resourceLink", "thumbnail", "tags", "difficultyLevel", "duration"];
    allowed.forEach(k => { if (req.body[k] !== undefined) resource[k] = req.body[k]; });
    await resource.save();
    res.json({ success: true, data: await resource.populate(POPULATE) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─── DELETE ──────────────────────────────────────────────────────
   DELETE /api/resources/:id
──────────────────────────────────────────────────────────────────── */
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: "Not found" });
    if (resource.author.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ success: false, message: "Forbidden" });
    await resource.deleteOne();
    await ResourceReview.deleteMany({ resource: req.params.id });
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─── TOGGLE LIKE ─────────────────────────────────────────────────
   POST /api/resources/:id/like
──────────────────────────────────────────────────────────────────── */
exports.toggleLike = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: "Not found" });
    const uid = req.user._id;
    const idx = resource.likes.indexOf(uid);
    if (idx === -1) resource.likes.push(uid);
    else            resource.likes.splice(idx, 1);
    await resource.save();
    res.json({ success: true, liked: idx === -1, likeCount: resource.likes.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─── TOGGLE BOOKMARK ─────────────────────────────────────────────
   POST /api/resources/:id/bookmark
──────────────────────────────────────────────────────────────────── */
exports.toggleBookmark = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: "Not found" });
    const uid = req.user._id;
    const idx = resource.bookmarks.indexOf(uid);
    if (idx === -1) resource.bookmarks.push(uid);
    else            resource.bookmarks.splice(idx, 1);
    await resource.save();
    res.json({ success: true, bookmarked: idx === -1 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─── ADD / UPDATE REVIEW ─────────────────────────────────────────
   POST /api/resources/:id/review
──────────────────────────────────────────────────────────────────── */
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const existing = await ResourceReview.findOne({ resource: req.params.id, user: req.user._id });
    if (existing) {
      existing.rating  = rating;
      existing.comment = comment || "";
      await existing.save();
    } else {
      await ResourceReview.create({ resource: req.params.id, user: req.user._id, rating, comment: comment || "" });
    }
    await Resource.updateAverageRating(req.params.id);
    res.json({ success: true, message: "Review saved" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─── MY BOOKMARKS ────────────────────────────────────────────────
   GET /api/resources/bookmarked
──────────────────────────────────────────────────────────────────── */
exports.getBookmarked = async (req, res) => {
  try {
    const resources = await Resource.find({ bookmarks: req.user._id, isApproved: true })
      .sort({ createdAt: -1 })
      .populate(POPULATE)
      .lean();
    res.json({ success: true, data: resources });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─── TRENDING ────────────────────────────────────────────────────
   GET /api/resources/trending
──────────────────────────────────────────────────────────────────── */
exports.getTrending = async (req, res) => {
  try {
    const [mostViewed, mostLiked, recent] = await Promise.all([
      Resource.find({ isApproved: true }).sort({ views: -1 }).limit(5).populate(POPULATE).lean(),
      Resource.find({ isApproved: true }).sort({ likesCount: -1 }).limit(5).populate(POPULATE).lean(),
      Resource.find({ isApproved: true }).sort({ createdAt: -1 }).limit(5).populate(POPULATE).lean(),
    ]);
    res.json({ success: true, data: { mostViewed, mostLiked, recent } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─── AI RECOMMENDATIONS ──────────────────────────────────────────
   GET /api/resources/recommended
──────────────────────────────────────────────────────────────────── */
exports.getRecommended = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("teachSkills learnSkills experienceLevel").lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const skills = [
      ...(user.learnSkills  || []).map(s => typeof s === "string" ? s : s.name || ""),
      ...(user.teachSkills  || []).map(s => typeof s === "string" ? s : s.name || ""),
    ].filter(Boolean);

    const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

    let resources = [];
    if (skills.length > 0) {
      resources = await Resource.find({
        isApproved: true,
        $or: [
          { tags: { $in: skills.map(s => new RegExp(escapeRegex(s), "i")) } },
          { title: { $in: skills.map(s => new RegExp(escapeRegex(s), "i")) } },
        ],
        difficultyLevel: user.experienceLevel === "beginner" ? "Beginner"
          : user.experienceLevel === "advanced" ? "Advanced" : { $in: ["Beginner", "Intermediate"] },
      })
        .sort({ averageRating: -1 })
        .limit(8)
        .populate(POPULATE)
        .lean();
    }

    // fallback to top-rated
    if (resources.length < 4) {
      const extra = await Resource.find({ isApproved: true }).sort({ averageRating: -1 }).limit(8).populate(POPULATE).lean();
      const seen = new Set(resources.map(r => r._id.toString()));
      resources = [...resources, ...extra.filter(r => !seen.has(r._id.toString()))].slice(0, 8);
    }

    res.json({ success: true, data: resources });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
