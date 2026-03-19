const Verification = require("../models/Verification");
const User = require("../models/User");
const { GoogleGenAI } = require("@google/genai");

// ── Helper: shuffle array (question randomization) ────────────────────────────
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Generate MCQ Test ─────────────────────────────────────────────────────────
exports.generateTest = async (req, res) => {
  try {
    const { skillName, totalQuestions = 10, difficulty = "Medium" } = req.body;
    const userId = req.user.id;

    if (!skillName || !skillName.trim()) {
      return res.status(400).json({ success: false, message: "Skill name is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, message: "AI API key not configured" });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Generate ${totalQuestions} multiple choice questions for the skill "${skillName.trim()}".
Requirements:
* Each question must have exactly 4 options (strings, not labeled "A. " just plain text).
* Only one correct answer per question.
* Difficulty level: ${difficulty}.
* Questions must be practical, real-world, and skill-based (not trivial).
* Randomize question order.
* Return ONLY a valid JSON array. No markdown, no explanation, no preamble.

JSON Structure (strict):
[
  {
    "question": "What does ... do?",
    "options": ["Option text 1", "Option text 2", "Option text 3", "Option text 4"],
    "correctAnswer": "Option text 1"
  }
]`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    let rawData = (response.text || "").trim();
    // Strip any markdown code fences
    rawData = rawData.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();

    let generatedQuestions;
    try {
      generatedQuestions = JSON.parse(rawData);
    } catch {
      // Try to extract JSON array from mixed response
      const match = rawData.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("AI returned invalid JSON");
      generatedQuestions = JSON.parse(match[0]);
    }

    if (!Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
      throw new Error("AI returned empty or invalid questions array");
    }

    // Randomize order
    const shuffled = shuffleArray(generatedQuestions);

    const verification = await Verification.create({
      userId,
      skillName: skillName.trim(),
      difficulty,
      totalQuestions: shuffled.length,
      questions: shuffled,
      status: "pending",
    });

    res.status(201).json({ success: true, data: verification });
  } catch (error) {
    console.error("AI MCQ Generation Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to generate test. Please try again." });
  }
};

// ── Submit Test ───────────────────────────────────────────────────────────────
exports.submitTest = async (req, res) => {
  try {
    const { verificationId, answers, timeTaken = 0 } = req.body;
    const userId = req.user.id;

    const verification = await Verification.findOne({ _id: verificationId, userId });
    if (!verification) {
      return res.status(404).json({ success: false, message: "Verification record not found" });
    }

    if (verification.status !== "pending") {
      return res.status(400).json({ success: false, message: "Test already submitted" });
    }

    let correctCount = 0;

    for (let i = 0; i < verification.questions.length; i++) {
      const q = verification.questions[i];
      // answers can be keyed by string index or MongoDB ObjectId string
      const userAns = answers[String(q._id)] || answers[String(i)] || "";
      q.userAnswer = userAns;
      if (userAns && userAns === q.correctAnswer) correctCount++;
    }

    verification.markModified("questions");

    const score = correctCount;
    const percentage = Math.round((score / verification.totalQuestions) * 100);
    const status = percentage >= 70 ? "passed" : "failed";

    verification.score = score;
    verification.percentage = percentage;
    verification.status = status;
    verification.timeTaken = Math.max(0, Number(timeTaken) || 0);
    await verification.save();

    // If passed → update user's verifiedSkills
    if (status === "passed") {
      await User.findByIdAndUpdate(userId, {
        $addToSet: { verifiedSkills: verification.skillName },
      });
    }

    res.json({ success: true, data: verification });
  } catch (error) {
    console.error("Submit Verification Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get User's Test History ───────────────────────────────────────────────────
exports.getHistory = async (req, res) => {
  try {
    const history = await Verification.find({ userId: req.user.id })
      .select("skillName difficulty totalQuestions score percentage status timeTaken createdAt")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Leaderboard – top users per skill ────────────────────────────────────────
exports.getLeaderboard = async (req, res) => {
  try {
    const { skill } = req.query;

    const matchStage = {
      status: "passed",
      ...(skill ? { skillName: { $regex: skill, $options: "i" } } : {}),
    };

    const leaders = await Verification.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$userId",
          bestScore: { $max: "$percentage" },
          skillName: { $first: "$skillName" },
          attempts: { $sum: 1 },
          bestTime: { $min: "$timeTaken" },
        },
      },
      { $sort: { bestScore: -1, bestTime: 1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          name: "$user.name",
          profileImage: "$user.profileImage",
          verifiedSkills: "$user.verifiedSkills",
          bestScore: 1,
          skillName: 1,
          attempts: 1,
          bestTime: 1,
        },
      },
    ]);

    res.json({ success: true, data: leaders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get Verified Skill Count for a User ───────────────────────────────────────
exports.getVerifiedSkillsStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("verifiedSkills");
    res.json({
      success: true,
      data: {
        count: user?.verifiedSkills?.length || 0,
        skills: user?.verifiedSkills || [],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
