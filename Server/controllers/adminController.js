const User = require("../models/User");
const Skill = require("../models/Skill");
const Match = require("../models/Match");
const Review = require("../models/Review");
const Meeting = require("../models/Meeting");
const ErrorResponse = require("../utils/errorResponse");

const INACTIVE_REMINDER_DAY = 10;
const INACTIVE_DELETE_DAY = 15;

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getAdminStats = async (req, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Basic counts
    const totalUsers = await User.countDocuments();
    const totalMatches = await Match.countDocuments();
    const totalReviews = await Review.countDocuments();
    const recentUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const weeklyUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const activeUsers = await User.countDocuments({ lastLogin: { $gte: thirtyDaysAgo } });

    // Total skills count
    const users = await User.find().select("teachSkills learnSkills");
    let totalSkills = 0;
    users.forEach(u => {
      totalSkills += (u.teachSkills?.length || 0) + (u.learnSkills?.length || 0);
    });

    // Top skills
    const skillMap = {};
    users.forEach(u => {
      [...(u.teachSkills || []), ...(u.learnSkills || [])].forEach(s => {
        const name = s.name || "Unknown";
        skillMap[name] = (skillMap[name] || 0) + 1;
      });
    });
    const topSkills = Object.entries(skillMap)
      .map(([name, count]) => ({ _id: name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Match stats
    const matchStats = await Match.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const matchStatistics = { pending: 0, accepted: 0, rejected: 0, completed: 0 };
    matchStats.forEach(s => {
      if (matchStatistics.hasOwnProperty(s._id)) matchStatistics[s._id] = s.count;
    });

    // Review stats
    const reviewStats = await Review.aggregate([
      { $group: { _id: null, avgRating: { $avg: "$rating" } } }
    ]);
    const averageRating = reviewStats[0]?.avgRating?.toFixed(1) || "0";

    // User growth (last 12 months)
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: oneYearAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Recent activities
    const recentActivities = [];
    
    // Recent users
    const newUsers = await User.find().select("name createdAt").sort({ createdAt: -1 }).limit(5);
    newUsers.forEach(u => {
      recentActivities.push({
        type: "user_registered",
        message: `New user "${u.name}" registered`,
        timestamp: u.createdAt,
        severity: "info"
      });
    });

    // Recent matches
    const newMatches = await Match.find().populate("requester", "name").populate("receiver", "name")
      .sort({ createdAt: -1 }).limit(3);
    newMatches.forEach(m => {
      recentActivities.push({
        type: "match_created",
        message: `Match between ${m.requester?.name || 'User'} and ${m.receiver?.name || 'User'}`,
        timestamp: m.createdAt,
        severity: "success"
      });
    });

    // Meeting History from DB
    const newMeetings = await Meeting.find({})
      .sort({ startedAt: -1 })
      .limit(3);
      
    newMeetings.forEach(m => {
      recentActivities.push({
        type: m.status === "active" ? "meeting_active" : "meeting_ended",
        message: `Video Meeting ${m.meetingId} (${m.participants.length} connected)`,
        timestamp: m.startedAt,
        severity: m.status === "active" ? "info" : "warning"
      });
    });

    // Sort and limit activities
    recentActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Platform health
    const platformHealth = {
      activeUsers,
      completedMatches: matchStatistics.completed || 0,
      systemUptime: Math.floor(process.uptime())
    };

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalSkills,
          totalMatches,
          totalReviews,
          recentUsers,
          weeklyUsers,
          activeUsers,
          averageRating,
          userGrowthRate: "0"
        },
        topSkills,
        matchStatistics,
        userGrowth,
        recentActivities: recentActivities.slice(0, 10),
        platformHealth,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    console.error("getAdminStats error:", error);
    res.status(500).json({ success: false, message: "Server error fetching stats" });
  }
};

// @desc    Get system health
// @route   GET /api/admin/system-health
// @access  Private/Admin
exports.getSystemHealth = async (req, res, next) => {
  try {
    const health = {
      database: { status: "healthy", responseTime: Date.now() },
      server: {
        uptime: Math.floor(process.uptime()),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      }
    };
    res.status(200).json({ success: true, data: health });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get user analytics
// @route   GET /api/admin/user-analytics
// @access  Private/Admin
exports.getUserAnalytics = async (req, res, next) => {
  try {
    const userStats = await User.aggregate([
      {
        $facet: {
          byRole: [{ $group: { _id: "$role", count: { $sum: 1 } } }],
          byStatus: [{ $group: { _id: "$isActive", count: { $sum: 1 } } }]
        }
      }
    ]);
    res.status(200).json({ success: true, data: userStats[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const role = req.query.role || "";
    const status = req.query.status || "";

    let filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }
    if (role) filter.role = role;
    if (status) filter.isActive = status === "active";

    const [users, totalUsers] = await Promise.all([
      User.find(filter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: { currentPage: page, totalPages, totalUsers, hasNextPage: page < totalPages, hasPrevPage: page > 1 }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const { role, isActive } = req.body;
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    await user.save();
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    
    await Promise.all([
      Skill.deleteMany({ user: user._id }),
      Match.deleteMany({ $or: [{ requester: user._id }, { receiver: user._id }] }),
      Review.deleteMany({ $or: [{ reviewer: user._id }, { reviewee: user._id }] })
    ]);
    
    await user.deleteOne();
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get all reviews
// @route   GET /api/admin/reviews
// @access  Private/Admin
exports.getAllReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [reviews, totalReviews] = await Promise.all([
      Review.find().populate("reviewer", "name email").populate("reviewee", "name email")
        .sort({ createdAt: -1 }).skip(skip).limit(limit),
      Review.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: { currentPage: page, totalPages: Math.ceil(totalReviews / limit), totalReviews, hasNextPage: page * limit < totalReviews, hasPrevPage: page > 1 }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Delete review
// @route   DELETE /api/admin/reviews/:id
// @access  Private/Admin
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    await review.deleteOne();
    res.status(200).json({ success: true, message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get all skills
// @route   GET /api/admin/skills
// @access  Private/Admin
exports.getAllSkills = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    const users = await User.find().select("name email teachSkills learnSkills");
    const allSkills = [];
    
    users.forEach(user => {
      const teachSet = new Set((user.teachSkills || []).map(s => s._id?.toString()));
      [...(user.teachSkills || []), ...(user.learnSkills || [])].forEach(skill => {
        if (!search || (skill.name && skill.name.toLowerCase().includes(search.toLowerCase()))) {
          const skillCreatedAt = skill.createdAt instanceof Date && !isNaN(skill.createdAt)
            ? skill.createdAt
            : (user.createdAt || new Date());
          allSkills.push({
            _id: skill._id,
            name: skill.name,
            type: teachSet.has(skill._id?.toString()) ? "teach" : "learn",
            level: skill.level || "Beginner",
            user: { _id: user._id, name: user.name, email: user.email },
            createdAt: skillCreatedAt
          });
        }
      });
    });

    const totalSkills = allSkills.length;
    const paginatedSkills = allSkills.slice(skip, skip + limit);

    res.status(200).json({
      success: true,
      data: {
        skills: paginatedSkills,
        statistics: [{ _id: "total", count: totalSkills }],
        pagination: { currentPage: page, totalPages: Math.ceil(totalSkills / limit), totalSkills, hasNextPage: page * limit < totalSkills, hasPrevPage: page > 1 }
      }
    });
  } catch (error) {
    console.error("getAllSkills error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Delete skill
// @route   DELETE /api/admin/skills/:id
// @access  Private/Admin
exports.deleteSkill = async (req, res, next) => {
  try {
    const skillId = req.params.id;
    const userWithSkill = await User.findOne({
      $or: [{ "teachSkills._id": skillId }, { "learnSkills._id": skillId }]
    });
    
    if (!userWithSkill) return res.status(404).json({ success: false, message: "Skill not found" });
    
    userWithSkill.teachSkills = userWithSkill.teachSkills.filter(s => s._id.toString() !== skillId);
    userWithSkill.learnSkills = userWithSkill.learnSkills.filter(s => s._id.toString() !== skillId);
    await userWithSkill.save();
    
    res.status(200).json({ success: true, message: "Skill deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get inactive users
// @route   GET /api/admin/inactive-users
// @access  Private/Admin
exports.getInactiveUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: "user" }).select("name email lastLogin createdAt");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const inactiveUsers = users.map(user => {
      const lastActivity = user.lastLogin || user.createdAt;
      const daysSinceActivity = Math.floor((today - new Date(lastActivity)) / (1000 * 60 * 60 * 24));
      
      let status = "active";
      if (daysSinceActivity >= INACTIVE_DELETE_DAY) status = "to_be_deleted";
      else if (daysSinceActivity >= INACTIVE_REMINDER_DAY) status = "reminder_sent";
      else if (daysSinceActivity > 0) status = "inactive";

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        lastActivity,
        daysInactive: daysSinceActivity,
        daysUntilDeletion: Math.max(0, INACTIVE_DELETE_DAY - daysSinceActivity),
        status
      };
    }).filter(u => u.daysInactive > 0).sort((a, b) => b.daysInactive - a.daysInactive);

    res.status(200).json({
      success: true,
      data: {
        users: inactiveUsers,
        summary: {
          totalInactive: inactiveUsers.length,
          atRisk: inactiveUsers.filter(u => u.daysUntilDeletion <= 5).length,
          toBeDeleted: inactiveUsers.filter(u => u.status === "to_be_deleted").length,
          reminderDay: INACTIVE_REMINDER_DAY,
          deleteDay: INACTIVE_DELETE_DAY
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Cleanup inactive users
// @route   POST /api/admin/cleanup-inactive-users
// @access  Private/Admin
exports.cleanupInactiveUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: "user" });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const toDelete = [];

    for (const user of users) {
      const lastActivity = user.lastLogin || user.createdAt;
      const daysSinceActivity = Math.floor((today - new Date(lastActivity)) / (1000 * 60 * 60 * 24));
      if (daysSinceActivity >= INACTIVE_DELETE_DAY) toDelete.push(user._id);
    }

    await User.deleteMany({ _id: { $in: toDelete } });
    res.status(200).json({ success: true, message: `${toDelete.length} users deleted` });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Delete inactive user
// @route   DELETE /api/admin/inactive-users/:id
// @access  Private/Admin
exports.deleteInactiveUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    
    await Promise.all([
      Skill.deleteMany({ user: user._id }),
      Match.deleteMany({ $or: [{ requester: user._id }, { receiver: user._id }] }),
      Review.deleteMany({ $or: [{ reviewer: user._id }, { reviewee: user._id }] })
    ]);
    
    await user.deleteOne();
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get all meetings (Live & Historical)
// @route   GET /api/admin/meetings
// @access  Private/Admin
exports.getActiveMeetings = async (req, res, next) => {
  try {
    const meetings = await Meeting.find({})
      .populate("host", "name email avatar")
      .populate("participants", "name email avatar")
      .sort({ startedAt: -1 });
      
    // Fetch live details from socket if needed, but DB is strictly enough
    // for a complete overview.

    res.status(200).json({
      success: true,
      data: meetings
    });
  } catch (error) {
    console.error("getMeetings error:", error);
    res.status(500).json({ success: false, message: "Server error fetching meetings" });
  }
};
