// controllers/skillsController.js
const User = require("../models/User");
const Review = require("../models/Review");

// Helper to build a distinct skill list with expert counts
// from all users' teachSkills arrays
const buildSkillCatalog = async () => {
  const users = await User.find(
    { "teachSkills.0": { $exists: true } },
    { name: 1, profileImage: 1, teachSkills: 1, learnSkills: 1, availability: 1, bio: 1, experienceLevel: 1 }
  ).lean();

  const skillMap = {};

  for (const user of users) {
    for (const skill of user.teachSkills || []) {
      const key = skill.name.toLowerCase().trim();
      if (!skillMap[key]) {
        skillMap[key] = {
          skillName: skill.name,
          skillIcon: getSkillIcon(skill.name),
          category: getSkillCategory(skill.name),
          bgColor: getSkillColor(skill.name),
          expertCount: 0,
          experts: [],
        };
      }
      skillMap[key].expertCount += 1;
      skillMap[key].experts.push(user);
    }
  }

  return Object.values(skillMap).sort((a, b) => b.expertCount - a.expertCount);
};

// Map skill names to emoji icons
function getSkillIcon(skillName) {
  const name = skillName.toLowerCase();
  const iconMap = {
    javascript: "⚡", js: "⚡", typescript: "🔷", ts: "🔷",
    python: "🐍", java: "☕", "c++": "⚙️", c: "⚙️", rust: "🦀",
    go: "🐹", golang: "🐹", ruby: "💎", php: "🐘", swift: "🦅",
    kotlin: "🎯", dart: "🎯", flutter: "🦋",
    react: "⚛️", angular: "🔴", vue: "💚", svelte: "🔥",
    nodejs: "🟢", "node.js": "🟢", express: "🚂", django: "🦄",
    flask: "🌶️", spring: "🌱", laravel: "🎩",
    mongodb: "🍃", postgresql: "🐘", mysql: "🐬", redis: "🔴",
    graphql: "🔗", "rest api": "🌐", apis: "🌐",
    docker: "🐳", kubernetes: "☸️", aws: "☁️", azure: "💙",
    gcp: "🌈", "google cloud": "🌈", devops: "⚙️", ci: "🔄",
    git: "🌿", github: "🐙",
    "machine learning": "🤖", ml: "🤖", ai: "🧠",
    "deep learning": "🧬", tensorflow: "🔶", pytorch: "🔥",
    "data science": "📊", analytics: "📈", "data analysis": "📊",
    sql: "🗄️", excel: "📊", tableau: "📊", "power bi": "📊",
    photoshop: "🎨", illustrator: "✏️", figma: "🎭", sketch: "✏️",
    "ui/ux": "🎨", design: "🎨", "graphic design": "🎨",
    "digital marketing": "📣", seo: "🔍", marketing: "📣",
    "social media": "📱", content: "✍️", copywriting: "✍️",
    english: "🇬🇧", spanish: "🇪🇸", french: "🇫🇷", german: "🇩🇪",
    chinese: "🇨🇳", japanese: "🇯🇵", hindi: "🇮🇳", arabic: "🇸🇦",
    "public speaking": "🎤", communication: "💬", leadership: "👑",
    "project management": "📋", agile: "🔄", scrum: "🔄",
    music: "🎵", guitar: "🎸", piano: "🎹", singing: "🎶",
    photography: "📷", videography: "🎥", editing: "✂️",
    cooking: "🍳", drawing: "✏️", painting: "🖌️",
    yoga: "🧘", fitness: "💪", meditation: "🧘",
    accounting: "💰", finance: "💹", investing: "📈",
    writing: "📝", blogging: "📝", poetry: "📜",
    blockchain: "⛓️", web3: "🌐", crypto: "₿", nft: "🖼️",
    cybersecurity: "🔒", security: "🛡️", hacking: "🔐",
    networking: "🕸️", "system design": "🏗️",
    "mobile development": "📱", android: "🤖", ios: "🍎",
  };

  for (const [key, icon] of Object.entries(iconMap)) {
    if (name.includes(key)) return icon;
  }
  return "🌟";
}

function getSkillCategory(skillName) {
  const name = skillName.toLowerCase();
  const techKeywords = ["javascript", "python", "java", "react", "node", "mongodb", "docker", "aws", "ai", "ml", "typescript", "swift", "kotlin", "rust", "go", "angular", "vue", "django", "flask", "spring", "laravel", "kubernetes", "git", "sql", "mongodb", "postgresql", "redis", "graphql", "api", "blockchain", "web3", "cybersecurity", "networking", "mobile", "android", "ios", "c++", "dart", "flutter", "devops", "cloud", "gcp", "azure", "machine learning", "deep learning", "data science", "power bi", "tableau", "system design"];
  const designKeywords = ["design", "figma", "photoshop", "illustrator", "sketch", "ui", "ux", "graphic"];
  const marketingKeywords = ["marketing", "seo", "social media", "content", "copywriting", "digital marketing"];
  const languageKeywords = ["english", "spanish", "french", "german", "chinese", "japanese", "hindi", "arabic"];
  const musicKeywords = ["music", "guitar", "piano", "singing"];
  const businessKeywords = ["project management", "agile", "scrum", "leadership", "communication", "public speaking", "accounting", "finance", "investing"];

  if (techKeywords.some(k => name.includes(k))) return "Technology";
  if (designKeywords.some(k => name.includes(k))) return "Design";
  if (marketingKeywords.some(k => name.includes(k))) return "Marketing";
  if (languageKeywords.some(k => name.includes(k))) return "Language";
  if (musicKeywords.some(k => name.includes(k))) return "Music & Arts";
  if (businessKeywords.some(k => name.includes(k))) return "Business";
  return "Other";
}

function getSkillColor(skillName) {
  const colors = [
    { bg: "from-violet-500 to-purple-600", light: "bg-violet-500/10", border: "border-violet-500/30" },
    { bg: "from-blue-500 to-cyan-600", light: "bg-blue-500/10", border: "border-blue-500/30" },
    { bg: "from-emerald-500 to-teal-600", light: "bg-emerald-500/10", border: "border-emerald-500/30" },
    { bg: "from-orange-500 to-red-500", light: "bg-orange-500/10", border: "border-orange-500/30" },
    { bg: "from-pink-500 to-rose-600", light: "bg-pink-500/10", border: "border-pink-500/30" },
    { bg: "from-yellow-500 to-orange-500", light: "bg-yellow-500/10", border: "border-yellow-500/30" },
    { bg: "from-cyan-500 to-blue-600", light: "bg-cyan-500/10", border: "border-cyan-500/30" },
    { bg: "from-indigo-500 to-purple-600", light: "bg-indigo-500/10", border: "border-indigo-500/30" },
    { bg: "from-teal-500 to-green-600", light: "bg-teal-500/10", border: "border-teal-500/30" },
    { bg: "from-rose-500 to-pink-600", light: "bg-rose-500/10", border: "border-rose-500/30" },
  ];
  // Deterministic color based on skill name
  let hash = 0;
  for (let i = 0; i < skillName.length; i++) {
    hash = skillName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// GET /api/skills/explore - Return all skills with expert counts
exports.getAllSkillsWithExperts = async (req, res, next) => {
  try {
    const skills = await buildSkillCatalog();
    // Remove expert details from catalog (just counts)
    const skillList = skills.map(({ experts, ...rest }) => rest);
    res.json({ success: true, data: skillList });
  } catch (err) {
    next(err);
  }
};

// GET /api/skills/explore/:skillName/experts - Return all experts for a skill
exports.getExpertsBySkill = async (req, res, next) => {
  try {
    const { skillName } = req.params;
    const decodedSkill = decodeURIComponent(skillName).trim();
    // Escape special characters for regex
    const escapedSkill = decodedSkill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const users = await User.find(
      {
        "teachSkills.name": { $regex: new RegExp(`^${escapedSkill}$`, "i") },
      },
      { name: 1, profileImage: 1, teachSkills: 1, learnSkills: 1, availability: 1, bio: 1, experienceLevel: 1, location: 1, verifiedSkills: 1 }
    ).lean();

    // Fetch ratings for each user
    const expertsWithRatings = await Promise.all(
      users.map(async (user) => {
        const ratingData = await Review.getAverageRating(user._id);
        const skillObj = user.teachSkills.find(
          (s) => s.name.toLowerCase() === decodedSkill.toLowerCase()
        );
        return {
          _id: user._id,
          name: user.name,
          profileImage: user.profileImage,
          bio: user.bio,
          experienceLevel: user.experienceLevel,
          location: user.location,
          teachSkills: user.teachSkills,
          learnSkills: user.learnSkills,
          availability: user.availability,
          verifiedSkills: user.verifiedSkills,
          skillLevel: skillObj?.level || "Beginner",
          rating: parseFloat((ratingData.averageRating || 0).toFixed(1)),
          reviewCount: ratingData.totalReviews || 0,
        };
      })
    );

    // Sort by rating descending
    expertsWithRatings.sort((a, b) => b.rating - a.rating);

    res.json({
      success: true,
      skillName: decodeURIComponent(skillName),
      skillIcon: getSkillIcon(skillName),
      expertCount: expertsWithRatings.length,
      data: expertsWithRatings,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/skills/explore/expert/:id - Return full expert profile
exports.getExpertProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id, {
      password: 0,
      refreshTokens: 0,
      loginOtp: 0,
      loginOtpExpire: 0,
      resetToken: 0,
      resetTokenExpire: 0,
    }).lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "Expert not found" });
    }

    // Get reviews for this user
    const reviews = await Review.find({ reviewee: id })
      .populate("reviewer", "name profileImage")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get rating statistics
    const ratingData = await Review.getAverageRating(id);

    res.json({
      success: true,
      data: {
        ...user,
        rating: parseFloat((ratingData.averageRating || 0).toFixed(1)),
        reviewCount: ratingData.totalReviews || 0,
        reviews,
      },
    });
  } catch (err) {
    next(err);
  }
};
