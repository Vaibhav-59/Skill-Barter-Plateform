// /controllers/gamificationController.js
const Gamification = require("../models/Gamification");
const User = require("../models/User");
const { awardXP } = require("../utils/awardXP");

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LEVEL_THRESHOLDS = [
  0, 100, 300, 600, 1000, 1600, 2400, 3400, 4600, 6000, 8000,
];

function computeLevel(xp) {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return level;
}

function xpForNextLevel(level) {
  return LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 1000;
}

// Default badges catalogue
const BADGE_CATALOGUE = [
  { id: "first_session", badgeName: "First Step", description: "Completed your first session", icon: "🎯", category: "session", milestone: { field: "sessionsCompleted", value: 1 } },
  { id: "five_sessions", badgeName: "Session Pro", description: "Completed 5 sessions", icon: "⭐", category: "session", milestone: { field: "sessionsCompleted", value: 5 } },
  { id: "ten_sessions", badgeName: "Session Master", description: "Completed 10 sessions", icon: "🏅", category: "session", milestone: { field: "sessionsCompleted", value: 10 } },
  { id: "first_teach", badgeName: "First Teacher", description: "Taught your first session", icon: "🎓", category: "teaching", milestone: { field: "sessionsTaught", value: 1 } },
  { id: "five_teach", badgeName: "Knowledge Sharer", description: "Taught 5 sessions", icon: "📚", category: "teaching", milestone: { field: "sessionsTaught", value: 5 } },
  { id: "streak_3", badgeName: "On Fire", description: "Maintained a 3-day streak", icon: "🔥", category: "streak", milestone: { field: "learningStreak", value: 3 } },
  { id: "streak_7", badgeName: "Week Warrior", description: "Maintained a 7-day streak", icon: "💪", category: "streak", milestone: { field: "learningStreak", value: 7 } },
  { id: "streak_30", badgeName: "Unstoppable", description: "Maintained a 30-day streak", icon: "🦁", category: "streak", milestone: { field: "learningStreak", value: 30 } },
  { id: "verified_skill", badgeName: "Verified Expert", description: "Passed 1 skill verification", icon: "✅", category: "verification", milestone: { field: "skillsVerified", value: 1 } },
  { id: "five_verified", badgeName: "Multi-Expert", description: "Passed 5 skill verifications", icon: "🏆", category: "verification", milestone: { field: "skillsVerified", value: 5 } },
  { id: "five_skills", badgeName: "Skill Seeker", description: "Learned 5 different skills", icon: "🌱", category: "learning", milestone: { field: "skillsLearned", value: 5 } },
  { id: "challenge_win", badgeName: "Challenge Champion", description: "Completed your first challenge", icon: "🥇", category: "challenge", milestone: { field: "challengesCompleted", value: 1 } },
  { id: "level_5", badgeName: "Rising Star", description: "Reached Level 5", icon: "⚡", category: "session", milestone: { field: "level", value: 5 } },
  { id: "level_10", badgeName: "Elite Skill Barter", description: "Reached Level 10", icon: "👑", category: "session", milestone: { field: "level", value: 10 } },
];

// Default achievements catalogue
const ACHIEVEMENT_CATALOGUE = [
  { name: "Complete 10 sessions", description: "Attend 10 barter sessions", target: 10, category: "session", xpReward: 100 },
  { name: "Teach 5 sessions", description: "Share your knowledge 5 times", target: 5, category: "teaching", xpReward: 75 },
  { name: "Learn 5 skills", description: "Broaden your skill set", target: 5, category: "learning", xpReward: 75 },
  { name: "7-Day streak", description: "Stay active for 7 consecutive days", target: 7, category: "streak", xpReward: 150 },
  { name: "Verify 3 skills", description: "Get 3 skills verified by the system", target: 3, category: "verification", xpReward: 100 },
  { name: "Complete 3 challenges", description: "Win 3 skill challenges", target: 3, category: "challenge", xpReward: 100 },
];

function getOrCreateProfile(userId) {
  return Gamification.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId, achievements: ACHIEVEMENT_CATALOGUE } },
    { upsert: true, new: true }
  );
}

async function checkAndUnlockBadges(profile) {
  const earned = new Set(profile.badges.map((b) => b.id));
  const newBadges = [];

  for (const badge of BADGE_CATALOGUE) {
    if (earned.has(badge.id)) continue;
    const fieldValue =
      badge.milestone.field === "level"
        ? profile.level
        : profile[badge.milestone.field] || 0;
    if (fieldValue >= badge.milestone.value) {
      newBadges.push({
        id: badge.id,
        badgeName: badge.badgeName,
        description: badge.description,
        icon: badge.icon,
        category: badge.category,
        earnedAt: new Date(),
      });
    }
  }

  if (newBadges.length > 0) {
    profile.badges.push(...newBadges);
  }

  return newBadges;
}

function updateAchievements(profile) {
  const mapping = {
    "Complete 10 sessions": "sessionsCompleted",
    "Teach 5 sessions": "sessionsTaught",
    "Learn 5 skills": "skillsLearned",
    "7-Day streak": "learningStreak",
    "Verify 3 skills": "skillsVerified",
    "Complete 3 challenges": "challengesCompleted",
  };

  const justCompleted = [];
  for (const ach of profile.achievements) {
    if (ach.completed) continue;
    const field = mapping[ach.name];
    if (!field) continue;
    const val = profile[field] || 0;
    ach.current = Math.min(val, ach.target);
    if (ach.current >= ach.target) {
      ach.completed = true;
      ach.completedAt = new Date();
      // Award XP for achievement
      profile.xp += ach.xpReward;
      profile.xpHistory.push({ amount: ach.xpReward, reason: `Achievement: ${ach.name}` });
      justCompleted.push(ach.name);
    }
  }
  return justCompleted;
}

// ─── Controllers ──────────────────────────────────────────────────────────────

// GET /api/gamification
exports.getGamification = async (req, res) => {
  try {
    const profile = await getOrCreateProfile(req.user._id);

    // Self-healing: Automatically deduplicate existing badges by badgeName to clean corrupt arrays
    const uniqueMap = new Map();
    profile.badges.forEach((b) => uniqueMap.set(b.badgeName, b));
    if (uniqueMap.size !== profile.badges.length) {
      profile.badges = Array.from(uniqueMap.values());
      await profile.save();
    }

    profile.level = computeLevel(profile.xp);
    const nextLevelXp = xpForNextLevel(profile.level);
    const currentLevelXp = LEVEL_THRESHOLDS[profile.level - 1] || 0;

    res.json({
      success: true,
      data: {
        ...profile.toObject(),
        level: profile.level,
        nextLevelXp,
        currentLevelXp,
        xpProgress: profile.xp - currentLevelXp,
        xpNeeded: nextLevelXp - currentLevelXp,
        badgeCatalogue: BADGE_CATALOGUE,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/gamification/update
exports.updateGamification = async (req, res) => {
  try {
    const { activity, xpBonus = 0 } = req.body;

    // Fallback to shared awardXP function so streak logic is never duplicated!
    const result = await awardXP(req.user._id, activity, xpBonus);

    if (!result.profile) {
      return res.status(500).json({ success: false, message: "Gamification update failed internally" });
    }

    // Determine what achievements might have just completed by analyzing change
    // If we wanted exact achievement popups, the helper needs to return it.
    // For demo/UI simulator purposes, we return empty completedAchievements for now,
    // though the DB is fully updated. (The client can re-fetch to see them full).

    res.json({
      success: true,
      data: result.profile,
      earned: result.earned,
      newBadges: result.newBadges,
      completedAchievements: [], // We rely on standard page load for achievements
      message: `+${result.earned} XP earned!`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/gamification/leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const top = await Gamification.find()
      .sort({ xp: -1 })
      .limit(20)
      .populate("userId", "name profileImage");

    const leaderboard = top.map((g, idx) => ({
      rank: idx + 1,
      userId: g.userId?._id,
      name: g.userId?.name || "Unknown",
      profileImage: g.userId?.profileImage || "",
      xp: g.xp,
      level: computeLevel(g.xp),
      sessionsCompleted: g.sessionsCompleted,
      badges: new Set(g.badges.map((b) => b.badgeName)).size,
      learningStreak: g.learningStreak,
    }));

    res.json({ success: true, data: leaderboard });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/gamification/daily-checkin
exports.dailyCheckIn = async (req, res) => {
  try {
    const profile = await getOrCreateProfile(req.user._id);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (profile.lastActiveDate) {
      const last = new Date(profile.lastActiveDate);
      last.setHours(0, 0, 0, 0);
      if (last.getTime() === today.getTime()) {
        return res.json({ success: false, message: "Already checked in today!" });
      }
    }

    const { earned, newBadges } = await awardXP(req.user._id, "daily_checkin");

    res.json({
      success: true,
      message: `Daily check-in! +${earned} XP`,
      earned,
      newBadges,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
