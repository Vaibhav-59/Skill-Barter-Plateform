// utils/awardXP.js
// Shared helper – call this from any controller to award XP automatically.
const Gamification = require("../models/Gamification");
const Notification = require("../models/Notification");

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1600, 2400, 3400, 4600, 6000, 8000];

function computeLevel(xp) {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return level;
}

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

const ACHIEVEMENT_CATALOGUE = [
  { name: "Complete 10 sessions", description: "Attend 10 barter sessions", target: 10, category: "session", xpReward: 100 },
  { name: "Teach 5 sessions", description: "Share your knowledge 5 times", target: 5, category: "teaching", xpReward: 75 },
  { name: "Learn 5 skills", description: "Broaden your skill set", target: 5, category: "learning", xpReward: 75 },
  { name: "7-Day streak", description: "Stay active for 7 consecutive days", target: 7, category: "streak", xpReward: 150 },
  { name: "Verify 3 skills", description: "Get 3 skills verified by the system", target: 3, category: "verification", xpReward: 100 },
  { name: "Complete 3 challenges", description: "Win 3 skill challenges", target: 3, category: "challenge", xpReward: 100 },
];

const XP_MAP = {
  session_complete: 40,
  session_teach: 50,
  skill_learn: 30,
  skill_verify: 60,
  challenge: 30,
  daily_checkin: 15,
  learning_step: 25,
};

async function getOrCreate(userId) {
  return Gamification.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId, achievements: ACHIEVEMENT_CATALOGUE } },
    { upsert: true, new: true }
  );
}

function checkBadges(profile) {
  const earned = new Set(profile.badges.map((b) => b.badgeName));
  const newBadges = [];
  for (const badge of BADGE_CATALOGUE) {
    if (earned.has(badge.badgeName)) continue;
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
    // Deduplicate array purely by badgeName before returning
    const uniqueMap = new Map();
    profile.badges.forEach((b) => uniqueMap.set(b.badgeName, b));
    profile.badges = Array.from(uniqueMap.values());
  }
  return newBadges;
}

const ACHIEVEMENT_FIELD_MAP = {
  "Complete 10 sessions": "sessionsCompleted",
  "Teach 5 sessions": "sessionsTaught",
  "Learn 5 skills": "skillsLearned",
  "7-Day streak": "learningStreak",
  "Verify 3 skills": "skillsVerified",
  "Complete 3 challenges": "challengesCompleted",
};

function updateAchievements(profile) {
  const justCompleted = [];
  for (const ach of profile.achievements) {
    if (ach.completed) continue;
    const field = ACHIEVEMENT_FIELD_MAP[ach.name];
    if (!field) continue;
    ach.current = Math.min(profile[field] || 0, ach.target);
    if (ach.current >= ach.target) {
      ach.completed = true;
      ach.completedAt = new Date();
      profile.xp += ach.xpReward;
      profile.xpHistory.push({ amount: ach.xpReward, reason: `Achievement: ${ach.name}` });
      justCompleted.push(ach.name);
    }
  }
  return justCompleted;
}

/**
 * Award XP to a user for an activity.
 *
 * @param {ObjectId|string} userId
 * @param {"session_complete"|"session_teach"|"skill_learn"|"skill_verify"|"challenge"|"daily_checkin"} activity
 * @param {number} [bonusXp=0]
 * @returns {Promise<{earned:number, newBadges:Array, profile:Document}>}
 */
async function awardXP(userId, activity, bonusXp = 0) {
  try {
    const profile = await getOrCreate(userId);

    let earned = (XP_MAP[activity] || 0) + bonusXp;

    // ── Streak logic ────────────────────────────────────────────────────────
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActive = profile.lastActiveDate ? new Date(profile.lastActiveDate) : null;
    if (lastActive) lastActive.setHours(0, 0, 0, 0);

    const dayDiff = lastActive
      ? Math.floor((today - lastActive) / (1000 * 60 * 60 * 24))
      : null;

    if (dayDiff !== 0) {
      // Automatic daily limit/activity XP for their first action of the day
      if (activity !== "daily_checkin") {
        earned += XP_MAP.daily_checkin || 15;
        profile.xpHistory.push({ amount: XP_MAP.daily_checkin || 15, reason: "Daily activity bonus" });
      }

      if (dayDiff === null || dayDiff > 1) {
        profile.learningStreak = 1;
        profile.teachingStreak = activity === "session_teach" ? 1 : 0;
      } else if (dayDiff === 1) {
        profile.learningStreak += 1;
        if (activity === "session_teach") {
          profile.teachingStreak += 1;
        }
        
        // 7-day streak bonus XP adds when learningStreak hits a multiple of 7
        if (profile.learningStreak % 7 === 0) {
          earned += 50;
          profile.xpHistory.push({ amount: 50, reason: "7-day streak bonus! 🔥" });
        }
      }
    }

    profile.longestStreak = Math.max(profile.longestStreak, profile.learningStreak, profile.teachingStreak);
    profile.lastActiveDate = new Date();

    // ── Counters ───────────────────────────────────────────────────────────
    if (activity === "session_complete") profile.sessionsCompleted += 1;
    if (activity === "session_teach") { profile.sessionsTaught += 1; profile.sessionsCompleted += 1; }
    if (activity === "skill_learn") profile.skillsLearned += 1;
    if (activity === "skill_verify") profile.skillsVerified += 1;
    if (activity === "challenge") profile.challengesCompleted += 1;

    // ── XP & Level Progression ──────────────────────────────────────────────
    const oldLevel = profile.level || 1;
    profile.xp += earned;
    profile.xpHistory.push({ amount: earned, reason: activity.replace(/_/g, " ") });
    profile.level = computeLevel(profile.xp);
    
    // Notifications Pipeline
    if (earned > 0) {
      await Notification.create({
        recipient: userId,
        type: 'gamification',
        content: `You earned +${earned} XP for ${activity.replace(/_/g, " ")}!`,
      }).catch(err => console.error('Silent XP Notification error:', err));
    }
    
    if (profile.level > oldLevel) {
      await Notification.create({
        recipient: userId,
        type: 'gamification',
        content: `⭐ Level Up! You reached Level ${profile.level}!`,
      }).catch(err => console.error('Silent Level Notification error:', err));
    }

    // ── Achievements & badges ───────────────────────────────────────────────
    updateAchievements(profile);
    const newBadges = checkBadges(profile);
    
    // Notify for newly earned badges
    for (const badge of newBadges) {
      await Notification.create({
        recipient: userId,
        type: 'gamification',
        content: `🏅 New Badge Unlocked: ${badge.badgeName} - ${badge.description}`,
      }).catch(err => console.error('Silent Badge Notification error:', err));
    }

    await profile.save();
    return { earned, newBadges, profile };
  } catch (err) {
    console.error("awardXP error:", err.message);
    return { earned: 0, newBadges: [], profile: null };
  }
}

/**
 * Deduct XP from a user's gamification profile.
 * Used when a learning step is unmarked / reversed.
 *
 * @param {ObjectId|string} userId
 * @param {number} amount  — positive number; will be subtracted
 * @param {string} reason  — human-readable label
 */
async function deductXP(userId, amount, reason = "step unmarked") {
  try {
    if (!amount || amount <= 0) return { deducted: 0, profile: null };

    const profile = await getOrCreate(userId);
    const oldLevel = profile.level || 1;

    const deducted = Math.min(amount, profile.xp); // cannot go below 0
    profile.xp = Math.max(0, profile.xp - deducted);

    // Log negative entry in xpHistory
    profile.xpHistory.push({
      amount: -deducted,
      reason: reason,
    });

    // Recompute level
    profile.level = computeLevel(profile.xp);

    // Notify user
    await Notification.create({
      recipient: userId,
      type: "gamification",
      content: `⚠️ -${deducted} XP deducted (${reason})`,
    }).catch((err) => console.error("Silent deductXP Notification error:", err));

    if (profile.level < oldLevel) {
      await Notification.create({
        recipient: userId,
        type: "gamification",
        content: `📉 Level dropped to Level ${profile.level} after XP deduction.`,
      }).catch((err) => console.error("Silent level-drop Notification error:", err));
    }

    await profile.save();
    return { deducted, profile };
  } catch (err) {
    console.error("deductXP error:", err.message);
    return { deducted: 0, profile: null };
  }
}

module.exports = { awardXP, deductXP };

