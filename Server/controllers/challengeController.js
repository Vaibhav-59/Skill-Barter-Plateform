// controllers/challengeController.js
const Challenge = require("../models/Challenge");
const Submission = require("../models/Submission");
const Gamification = require("../models/Gamification");
const { awardXP } = require("../utils/awardXP");
const { GoogleGenAI } = require("@google/genai");

// ── GET /api/challenges ─────────────────────────────────────────────────────
exports.getAllChallenges = async (req, res) => {
  try {
    const { category, difficulty, type } = req.query;
    const filter = { isActive: true };

    if (category && category !== "All") filter.skillCategory = category;
    if (difficulty && difficulty !== "All") filter.difficulty = difficulty;
    if (type === "daily") filter.isDaily = true;
    if (type === "team") filter.isTeamChallenge = true;

    const challenges = await Challenge.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: challenges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/challenges/:id ─────────────────────────────────────────────────
exports.getChallengeById = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge)
      return res.status(404).json({ success: false, message: "Challenge not found" });
    res.json({ success: true, data: challenge });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/challenges/start/:id ──────────────────────────────────────────
exports.startChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge)
      return res.status(404).json({ success: false, message: "Challenge not found" });

    // Increment participant count atomically
    await Challenge.findByIdAndUpdate(req.params.id, { $inc: { participantsCount: 1 } });

    res.json({
      success: true,
      message: "Challenge started! Good luck!",
      data: challenge,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/challenges/submit ─────────────────────────────────────────────
exports.submitChallenge = async (req, res) => {
  try {
    const { challengeId, submissionLink, fileUrl, textAnswer, timeTaken } = req.body;
    const userId = req.user.id;

    if (!challengeId) {
      return res.status(400).json({ success: false, message: "challengeId is required" });
    }

    const challenge = await Challenge.findById(challengeId);
    if (!challenge)
      return res.status(404).json({ success: false, message: "Challenge not found" });

    // Check for existing submission
    const existing = await Submission.findOne({ userId, challengeId });
    if (existing)
      return res.status(400).json({ success: false, message: "You have already submitted this challenge" });

    // ── AI Evaluation ────────────────────────────────────────────────────────
    // For ALL challenges we use AI to auto-evaluate (Accepted / Rejected)
    // and provide actionable feedback in one Gemini call.
    let aiVerdict   = "Pending";   // default if AI unavailable
    let aiFeedback  = "";
    let aiScore     = 0;

    const hasContent = textAnswer?.trim() || submissionLink?.trim() || fileUrl?.trim();

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey && hasContent) {
        const ai = new GoogleGenAI({ apiKey });

        // Build what the user actually submitted
        const submittedContent = textAnswer?.trim()
          ? `Written Answer:\n${textAnswer.trim()}`
          : submissionLink?.trim()
          ? `Submission Link: ${submissionLink.trim()}`
          : `File URL: ${fileUrl.trim()}`;

        // Build requirements string
        const requirementsText =
          challenge.requirements?.length > 0
            ? challenge.requirements.map((r, i) => `${i + 1}. ${r}`).join("\n")
            : "No specific requirements listed.";

        const prompt = `You are an expert skill evaluator on a coding/design challenge platform.

CHALLENGE DETAILS:
- Title: "${challenge.title}"
- Category: ${challenge.skillCategory}
- Difficulty: ${challenge.difficulty}
- Description: ${challenge.description}
- Requirements:
${requirementsText}

USER SUBMISSION:
---
${submittedContent}
---

EVALUATION INSTRUCTIONS:
- Carefully review the submission against the challenge requirements.
- For text answers: evaluate correctness, completeness, clarity, and depth.
- For links/URLs: assume the user submitted a genuine solution and evaluate based on the link description and context.
- Be fair but strict. A "Good" effort should pass. Incomplete or off-topic answers fail.
- Give a score out of 100.

Respond with ONLY this exact JSON (no markdown, no explanation):
{
  "verdict": "Accepted" or "Rejected",
  "score": <integer 0-100>,
  "feedback": "<2-3 sentence constructive feedback explaining the verdict, what was done well, and what to improve>"
}`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        let rawText = (response.text || "").trim();
        // Strip markdown fences if any
        rawText = rawText.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();

        let evalResult;
        try {
          evalResult = JSON.parse(rawText);
        } catch {
          const match = rawText.match(/\{[\s\S]*\}/);
          if (match) evalResult = JSON.parse(match[0]);
        }

        if (evalResult) {
          aiVerdict  = evalResult.verdict === "Rejected" ? "Rejected" : "Accepted";
          aiScore    = Math.min(100, Math.max(0, Number(evalResult.score) || 0));
          aiFeedback = (evalResult.feedback || "").trim().slice(0, 600);
        }
      } else if (!hasContent) {
        // No content submitted at all → auto-reject
        aiVerdict  = "Rejected";
        aiFeedback = "No submission content was provided. Please submit a link, written answer, or file URL.";
        aiScore    = 0;
      }
    } catch (aiErr) {
      console.error("AI Evaluation error (non-fatal):", aiErr.message);
      // Fall back to Pending only if AI completely fails
      aiVerdict = "Pending";
    }

    // ── Persist submission ───────────────────────────────────────────────────
    const submission = await Submission.create({
      userId,
      challengeId,
      submissionLink: submissionLink || "",
      fileUrl: fileUrl || "",
      textAnswer: textAnswer || "",
      timeTaken: timeTaken || 0,
      status: aiVerdict,
      score: aiScore,
      aiFeedback,
    });

    // ── Award XP immediately if Accepted ────────────────────────────────────
    if (aiVerdict === "Accepted") {
      try {
        const xpAmount = challenge.rewardXP || 30;
        // awardXP base for "challenge" is 30 from XP_MAP, bonus = remainder
        await awardXP(userId, "challenge", Math.max(0, xpAmount - 30));
        submission.xpAwarded = xpAmount;
        await submission.save();
      } catch (xpErr) {
        console.error("XP award error (non-fatal):", xpErr.message);
      }
    }

    const message =
      aiVerdict === "Accepted"
        ? `✅ Accepted! You earned ${submission.xpAwarded} XP!`
        : aiVerdict === "Rejected"
        ? "❌ Submission rejected. Review the feedback and try again."
        : "⏳ Submitted! Evaluation is pending review.";

    res.status(201).json({
      success: true,
      message,
      data: submission,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "You have already submitted this challenge" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};


// ── GET /api/challenges/history ─────────────────────────────────────────────
exports.getUserHistory = async (req, res) => {
  try {
    const submissions = await Submission.find({ userId: req.user.id })
      .populate("challengeId", "title skillCategory difficulty rewardXP")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/challenges/leaderboard ─────────────────────────────────────────
exports.getLeaderboard = async (req, res) => {
  try {
    const leaders = await Gamification.find({})
      .populate("userId", "name profileImage")
      .select("userId xp challengesCompleted level")
      .sort({ xp: -1 })
      .limit(20);

    const leaderboard = leaders
      .filter((l) => l.userId) // guard against missing user refs
      .map((l, idx) => ({
        rank: idx + 1,
        userId: l.userId._id,
        name: l.userId.name,
        profileImage: l.userId.profileImage,
        xp: l.xp,
        challengesCompleted: l.challengesCompleted || 0,
        level: l.level || 1,
      }));

    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/challenges/stats ───────────────────────────────────────────────
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [totalCompleted, activeSubmissions, gamification] = await Promise.all([
      Submission.countDocuments({ userId, status: "Accepted" }),
      Submission.countDocuments({ userId, status: "Pending" }),
      Gamification.findOne({ userId }).select("xp challengesCompleted"),
    ]);

    const xpEarned = gamification?.xp || 0;
    const challengesCompleted = gamification?.challengesCompleted || 0;

    res.json({
      success: true,
      data: { totalCompleted, activeSubmissions, xpEarned, challengesCompleted },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/challenges (create a user-defined challenge) ───────────────────
exports.createChallenge = async (req, res) => {
  try {
    const {
      title, skillCategory, difficulty, description,
      requirements, rewardXP, timeLimit, tags, isTeamChallenge,
    } = req.body;

    if (!title || !skillCategory || !description) {
      return res.status(400).json({ success: false, message: "title, skillCategory and description are required" });
    }

    const challenge = await Challenge.create({
      title: title.trim(),
      skillCategory,
      difficulty: difficulty || "Medium",
      description: description.trim(),
      requirements: Array.isArray(requirements) ? requirements.filter(Boolean) : [],
      rewardXP: Math.min(500, Math.max(10, Number(rewardXP) || 50)),
      timeLimit: timeLimit ? Number(timeLimit) : null,
      tags: Array.isArray(tags) ? tags.filter(Boolean) : [],
      isTeamChallenge: Boolean(isTeamChallenge),
      isActive: true,
      createdBy: req.user.id,
    });

    res.status(201).json({ success: true, data: challenge, message: "Challenge created successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/challenges/my-created ───────────────────────────────────────────
// Challenges the logged-in user has created
exports.getMyCreatedChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find({ createdBy: req.user.id }).sort({ createdAt: -1 });

    // Attach submission counts for each
    const withCounts = await Promise.all(
      challenges.map(async (ch) => {
        const total   = await Submission.countDocuments({ challengeId: ch._id });
        const pending = await Submission.countDocuments({ challengeId: ch._id, status: "Pending" });
        return { ...ch.toObject(), submissionCount: total, pendingCount: pending };
      })
    );

    res.json({ success: true, data: withCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/challenges/:id/submissions ───────────────────────────────────────
// All submissions for a specific challenge (only accessible to its creator)
exports.getChallengeSubmissions = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge)
      return res.status(404).json({ success: false, message: "Challenge not found" });

    // Only creator can view submissions
    if (challenge.createdBy?.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "Only the challenge creator can view submissions" });
    }

    const submissions = await Submission.find({ challengeId: req.params.id })
      .populate("userId", "name profileImage email")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── PUT /api/challenges/submission/:id/review ────────────────────────────────
// Challenge creator OR admin can accept/reject a submission + award XP
exports.reviewSubmission = async (req, res) => {
  try {
    const { status, feedback, score } = req.body;

    if (!["Accepted", "Rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "status must be Accepted or Rejected" });
    }

    const submission = await Submission.findById(req.params.id);
    if (!submission)
      return res.status(404).json({ success: false, message: "Submission not found" });

    // Check: only challenge creator can manually review
    const challenge = await Challenge.findById(submission.challengeId);
    if (!challenge)
      return res.status(404).json({ success: false, message: "Challenge not found" });

    const isCreator = challenge.createdBy?.toString() === req.user.id.toString();
    const isAdmin   = req.user.role === "admin";
    if (!isCreator && !isAdmin) {
      return res.status(403).json({ success: false, message: "Only the challenge creator can review submissions" });
    }

    // Guard: don't re-award XP if already accepted
    const wasAlreadyAccepted = submission.status === "Accepted";

    submission.status   = status;
    submission.feedback = feedback || "";
    submission.score    = Math.min(100, Math.max(0, Number(score) || 0));

    if (status === "Accepted" && !wasAlreadyAccepted) {
      const xpAmount = challenge.rewardXP || 30;
      submission.xpAwarded = xpAmount;
      try {
        await awardXP(submission.userId, "challenge", Math.max(0, xpAmount - 30));
      } catch (xpErr) {
        console.error("XP award error (review):", xpErr.message);
      }
    }

    await submission.save();
    res.json({
      success: true,
      message: status === "Accepted"
        ? `✅ Submission accepted! ${submission.xpAwarded} XP awarded to the user.`
        : "❌ Submission rejected.",
      data: submission,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/challenges/generate-ai ────────────────────────────────────────
exports.generateAIChallenge = async (req, res) => {
  try {
    const { skillCategory, difficulty = "Medium" } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ success: false, message: "AI API key not configured" });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Generate a realistic skill challenge for the category "${skillCategory}" with difficulty "${difficulty}".

Return ONLY a valid JSON object (no markdown, no explanation):
{
  "title": "Challenge title",
  "description": "Full problem description (2-3 sentences)",
  "requirements": ["Requirement 1", "Requirement 2", "Requirement 3"],
  "rewardXP": <number between 30-150>,
  "timeLimit": <number in minutes, or null if open-ended>,
  "tags": ["tag1", "tag2"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    let rawData = (response.text || "").trim();
    rawData = rawData.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();

    let aiData;
    try {
      aiData = JSON.parse(rawData);
    } catch {
      const match = rawData.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("AI returned invalid JSON");
      aiData = JSON.parse(match[0]);
    }

    const challenge = await Challenge.create({
      title: aiData.title,
      skillCategory,
      difficulty,
      description: aiData.description,
      requirements: aiData.requirements || [],
      rewardXP: aiData.rewardXP || 50,
      timeLimit: aiData.timeLimit || null,
      tags: aiData.tags || [],
      isAIGenerated: true,
      isActive: true,
    });

    res.status(201).json({ success: true, data: challenge });
  } catch (error) {
    console.error("AI Challenge Generation Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to generate AI challenge. Please try again." });
  }
};

// ── POST /api/challenges/seed ───────────────────────────────────────────────
// Seed initial challenges (run once)
exports.seedChallenges = async (req, res) => {
  try {
    const count = await Challenge.countDocuments();
    if (count > 0) {
      return res.json({ success: true, message: `Already have ${count} challenges. Skipping seed.` });
    }

    const seed = [
      {
        title: "Build a To-Do App",
        skillCategory: "Web Development",
        difficulty: "Easy",
        description: "Create a fully functional To-Do application with add, edit, delete and mark-complete features.",
        requirements: ["React frontend", "Local state management", "Responsive design", "Filter by status"],
        rewardXP: 30,
        timeLimit: 120,
        participantsCount: 245,
        tags: ["React", "CSS", "Frontend"],
        isActive: true,
      },
      {
        title: "Design a SaaS Dashboard",
        skillCategory: "UI/UX Design",
        difficulty: "Medium",
        description: "Design a modern SaaS analytics dashboard with dark mode, charts, and a sidebar navigation.",
        requirements: ["Figma / XD file", "Dark mode support", "At least 3 chart types", "Mobile responsive wireframes"],
        rewardXP: 60,
        timeLimit: 180,
        participantsCount: 143,
        tags: ["Figma", "Design", "Dashboard"],
        isActive: true,
      },
      {
        title: "Build a REST API with Authentication",
        skillCategory: "Web Development",
        difficulty: "Medium",
        description: "Build a secure RESTful API with JWT authentication, rate limiting, and comprehensive CRUD endpoints.",
        requirements: ["Node.js + Express", "MongoDB", "JWT Auth", "Rate limiting", "Error handling"],
        rewardXP: 75,
        timeLimit: 240,
        participantsCount: 98,
        tags: ["Node.js", "Express", "MongoDB", "API"],
        isActive: true,
      },
      {
        title: "Sentiment Analysis Model",
        skillCategory: "AI & Machine Learning",
        difficulty: "Hard",
        description: "Build a sentiment analysis model from scratch using Python that can classify movie reviews as positive or negative.",
        requirements: ["Python", "Scikit-learn or PyTorch", ">85% accuracy", "Confusion matrix", "Model evaluation report"],
        rewardXP: 120,
        timeLimit: null,
        participantsCount: 67,
        tags: ["Python", "ML", "NLP"],
        isActive: true,
      },
      {
        title: "Data Visualization Dashboard",
        skillCategory: "Data Science",
        difficulty: "Medium",
        description: "Create an interactive data visualization dashboard using a public dataset of your choice.",
        requirements: ["Any language/tool", "At least 5 different chart types", "Interactive filters", "Deployment link"],
        rewardXP: 65,
        timeLimit: 180,
        participantsCount: 112,
        tags: ["Python", "D3.js", "Tableau", "Data"],
        isActive: true,
      },
      {
        title: "CSS Animation Challenge",
        skillCategory: "UI/UX Design",
        difficulty: "Easy",
        description: "Create a pure CSS animation of a loading spinner, card hover effect, and a ripple button — no JavaScript allowed.",
        requirements: ["Pure CSS only", "At least 3 distinct animations", "Cross-browser compatible"],
        rewardXP: 25,
        timeLimit: 60,
        participantsCount: 389,
        tags: ["CSS", "Animation", "Frontend"],
        isActive: true,
        isDaily: true,
      },
      {
        title: "LLM Chatbot Integration",
        skillCategory: "AI & Machine Learning",
        difficulty: "Hard",
        description: "Build an AI-powered chatbot that integrates with an LLM API and maintains conversation context.",
        requirements: ["Any LLM API (OpenAI/Gemini)", "Context management", "Streaming responses", "React UI"],
        rewardXP: 150,
        timeLimit: null,
        participantsCount: 45,
        tags: ["AI", "LLM", "React", "API"],
        isActive: true,
      },
      {
        title: "Team: Full-Stack E-Commerce App",
        skillCategory: "Web Development",
        difficulty: "Hard",
        description: "Build a complete e-commerce platform as a team. Includes product listing, cart, payments (mock), and admin panel.",
        requirements: ["React + Node.js + MongoDB", "Payment gateway (mock)", "Admin dashboard", "Deployed URL", "Team of 2-4"],
        rewardXP: 200,
        timeLimit: null,
        participantsCount: 28,
        tags: ["Full-Stack", "Team", "E-Commerce"],
        isActive: true,
        isTeamChallenge: true,
      },
    ];

    await Challenge.insertMany(seed);
    res.json({ success: true, message: `Seeded ${seed.length} challenges successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
