const LearningPath = require("../models/LearningPath");
const User = require("../models/User");
const { GoogleGenAI } = require("@google/genai");
const { awardXP, deductXP } = require("../utils/awardXP");

// ── Helper: parse JSON from AI response ──────────────────────────────────────
function parseAIJson(raw) {
  let text = (raw || "").trim();
  text = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("AI returned invalid JSON");
    return JSON.parse(match[0]);
  }
}

// ── Helper: today string ──────────────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().split("T")[0];
}

// ── Helper: escape RegExp ─────────────────────────────────────────────────────
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// ── 1. Generate Learning Path ─────────────────────────────────────────────────
exports.generatePath = async (req, res) => {
  try {
    const { goal } = req.body;
    if (!goal || !goal.trim())
      return res.status(400).json({ success: false, message: "Goal is required" });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey)
      return res.status(500).json({ success: false, message: "AI API key not configured" });

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Generate a step-by-step learning roadmap for becoming a "${goal.trim()}".
Requirements:
- Include 8-12 steps arranged in logical order (easy to advanced).
- Each step must include:
  * step: number (1-based)
  * skill: short skill name
  * description: 1-2 sentence explanation of what to learn
  * difficulty: one of "Beginner", "Easy", "Medium", "Intermediate", "Advanced", "Expert"
  * estimatedTime: realistic time like "1 week", "2 weeks", "1 month"
  * dependsOn: array of step numbers that must be completed first (empty for step 1)
  * xpReward: XP points (50-200 based on difficulty)
  * resources: array of 2-3 objects with {title, url, type} where type is "video"|"article"|"course"|"other". Use real, well-known URLs (YouTube, MDN, FreeCodeCamp, Coursera, etc.).
- Return ONLY a valid JSON array. No markdown, no explanation.

Example format:
[
  {
    "step": 1,
    "skill": "HTML",
    "description": "Learn the building blocks of web pages.",
    "difficulty": "Beginner",
    "estimatedTime": "1 week",
    "dependsOn": [],
    "xpReward": 50,
    "resources": [
      {"title": "HTML Tutorial - W3Schools", "url": "https://www.w3schools.com/html/", "type": "article"},
      {"title": "HTML Crash Course", "url": "https://www.youtube.com/watch?v=UB1O30fR-EE", "type": "video"}
    ]
  }
]`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const steps = parseAIJson(response.text);
    if (!Array.isArray(steps) || steps.length === 0)
      throw new Error("AI returned empty steps");

    // Normalize step fields
    const normalizedSteps = steps.map((s, i) => ({
      stepNumber: s.step || i + 1,
      skill: s.skill || `Step ${i + 1}`,
      description: s.description || "",
      difficulty: s.difficulty || "Medium",
      estimatedTime: s.estimatedTime || "1 week",
      dependsOn: Array.isArray(s.dependsOn) ? s.dependsOn : [],
      xpReward: s.xpReward || 50,
      resources: Array.isArray(s.resources) ? s.resources : [],
    }));

    // Build daily plan (one task per step spread over 7d intervals)
    const dailyPlan = normalizedSteps.map((s, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i * 7);
      return {
        date: d.toISOString().split("T")[0],
        stepNumber: s.stepNumber,
        task: `Start learning: ${s.skill}`,
        duration: "45 mins",
        done: false,
      };
    });

    // Save to DB
    const path = await LearningPath.create({
      userId: req.user.id,
      goal: goal.trim(),
      steps: normalizedSteps,
      completedSteps: [],
      progress: 0,
      dailyPlan,
    });

    res.status(201).json({ success: true, data: path });
  } catch (err) {
    console.error("generatePath error:", err.message);
    res.status(500).json({ success: false, message: "Failed to generate learning path" });
  }
};

// ── 2. Get all paths for user ─────────────────────────────────────────────────
exports.getUserPaths = async (req, res) => {
  try {
    const paths = await LearningPath.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: paths });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── 3. Get single path ────────────────────────────────────────────────────────
exports.getSinglePath = async (req, res) => {
  try {
    const path = await LearningPath.findOne({ _id: req.params.id, userId: req.user.id });
    if (!path) return res.status(404).json({ success: false, message: "Path not found" });
    res.json({ success: true, data: path });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── 4. Update step progress ───────────────────────────────────────────────────
exports.updateProgress = async (req, res) => {
  try {
    const { pathId, stepNumber, completed } = req.body;
    const path = await LearningPath.findOne({ _id: pathId, userId: req.user.id });
    if (!path) return res.status(404).json({ success: false, message: "Path not found" });

    const step     = path.steps.find((s) => s.stepNumber === stepNumber);
    const stepXP   = step ? (step.xpReward || 50) : 50;
    const stepSkill = step ? step.skill : `Step ${stepNumber}`;

    // ── COMPLETE a step ──────────────────────────────────────────────────────
    if (completed && !path.completedSteps.includes(stepNumber)) {
      path.completedSteps.push(stepNumber);

      // Award exact step XP in Gamification.
      // awardXP("learning_step") gives 25 base XP; pass the remainder as bonusXp
      // so total Gamification XP gained = stepXP exactly.
      const BASE_LEARNING_XP = 25; // must match XP_MAP.learning_step
      const bonus = Math.max(0, stepXP - BASE_LEARNING_XP);
      try {
        await awardXP(req.user.id, "learning_step", bonus);
      } catch (e) {
        console.error("XP award failed:", e);
      }

      // Update LearningPath totalXP
      path.totalXP += stepXP;

      // Mark daily plan task done
      const today = todayStr();
      const plan = path.dailyPlan.find((p) => p.stepNumber === stepNumber);
      if (plan) {
        plan.done = true;
        path.markModified("dailyPlan");
      }

      // Streak tracking
      if (path.lastActiveDate === today) {
        // already active today — no change
      } else if (
        path.lastActiveDate ===
        new Date(Date.now() - 86400000).toISOString().split("T")[0]
      ) {
        path.streakDays += 1;
      } else {
        path.streakDays = 1;
      }
      path.lastActiveDate = today;

    // ── UNMARK a step ────────────────────────────────────────────────────────
    } else if (!completed && path.completedSteps.includes(stepNumber)) {
      path.completedSteps = path.completedSteps.filter((n) => n !== stepNumber);

      // Deduct exact step XP from Gamification profile
      try {
        await deductXP(
          req.user.id,
          stepXP,
          `Unmarked learning step: "${stepSkill}"`
        );
      } catch (e) {
        console.error("XP deduction failed:", e);
      }

      // Update LearningPath totalXP
      path.totalXP = Math.max(0, path.totalXP - stepXP);

      // Roll back daily plan task if it was marked done for this step
      const planTask = path.dailyPlan.find((p) => p.stepNumber === stepNumber);
      if (planTask && planTask.done) {
        planTask.done = false;
        path.markModified("dailyPlan");
      }
    }

    path.markModified("completedSteps");
    await path.save();

    res.json({ success: true, data: path });
  } catch (err) {
    console.error("updateProgress error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── 5. Save (toggle active) ───────────────────────────────────────────────────
exports.savePath = async (req, res) => {
  try {
    const { pathId } = req.body;
    const path = await LearningPath.findOne({ _id: pathId, userId: req.user.id });
    if (!path) return res.status(404).json({ success: false, message: "Path not found" });
    path.isActive = true;
    await path.save();
    res.json({ success: true, data: path, message: "Path saved!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── 6. Delete path ────────────────────────────────────────────────────────────
exports.deletePath = async (req, res) => {
  try {
    const path = await LearningPath.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!path) return res.status(404).json({ success: false, message: "Path not found" });
    res.json({ success: true, message: "Path deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── 7. Adaptive re-plan (AI adapts path based on progress) ──────────────────
exports.adaptPath = async (req, res) => {
  try {
    const { pathId } = req.body;
    const path = await LearningPath.findOne({ _id: pathId, userId: req.user.id });
    if (!path) return res.status(404).json({ success: false, message: "Path not found" });

    const completed = path.completedSteps;
    const remaining = path.steps
      .filter((s) => !completed.includes(s.stepNumber))
      .map((s) => s.skill)
      .join(", ");

    if (!remaining) {
      return res.json({ success: true, data: path, message: "All steps already completed!" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `A learner is working toward becoming a "${path.goal}".
They have completed: ${completed.length} steps including skills: ${path.steps.filter(s => completed.includes(s.stepNumber)).map(s => s.skill).join(", ") || "none"}.
Remaining skills to learn: ${remaining}.

Please re-optimize only the REMAINING steps for maximum learning efficiency.
Return a JSON array of the re-ordered/refined remaining steps with the SAME format:
[{"step": number, "skill": "...", "description": "...", "difficulty": "...", "estimatedTime": "...", "dependsOn": [], "xpReward": number, "resources": [{"title":"...","url":"...","type":"..."}]}]
Keep the step numbers starting from ${completed.length + 1}.
Return ONLY valid JSON array.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const newSteps = parseAIJson(response.text);
    if (!Array.isArray(newSteps) || newSteps.length === 0)
      throw new Error("AI returned empty adaptive steps");

    const kept = path.steps.filter((s) => completed.includes(s.stepNumber));
    const adapted = newSteps.map((s, i) => ({
      stepNumber: s.step || completed.length + i + 1,
      skill: s.skill || `Step ${completed.length + i + 1}`,
      description: s.description || "",
      difficulty: s.difficulty || "Medium",
      estimatedTime: s.estimatedTime || "1 week",
      dependsOn: Array.isArray(s.dependsOn) ? s.dependsOn : [],
      xpReward: s.xpReward || 50,
      resources: Array.isArray(s.resources) ? s.resources : [],
    }));

    path.steps = [...kept, ...adapted];
    path.adaptedAt = new Date();
    path.adaptationNote = `Adapted on ${new Date().toLocaleDateString()} after completing ${completed.length} steps.`;

    // Rebuild daily plan for new steps
    const existingDone = path.dailyPlan.filter((d) => d.done);
    const newPlan = adapted.map((s, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i * 7);
      return {
        date: d.toISOString().split("T")[0],
        stepNumber: s.stepNumber,
        task: `Learn: ${s.skill}`,
        duration: "45 mins",
        done: false,
      };
    });
    path.dailyPlan = [...existingDone, ...newPlan];
    path.markModified("dailyPlan");
    path.markModified("steps");

    await path.save();
    res.json({ success: true, data: path, message: "Path adapted by AI!" });
  } catch (err) {
    console.error("adaptPath error:", err.message);
    res.status(500).json({ success: false, message: "Adaptation failed" });
  }
};

// ── 8. Get suggested skill exchange (who teaches each skill) ─────────────────
exports.getSkillExchange = async (req, res) => {
  try {
    const { skills } = req.query; // comma-separated skill names
    if (!skills) return res.json({ success: true, data: [] });

    const skillList = skills.split(",").map((s) => s.trim()).filter(Boolean);

    const experts = await User.find({
      "skillsOffered.name": { $in: skillList.map((s) => new RegExp(escapeRegex(s), "i")) },
      _id: { $ne: req.user.id },
    })
      .select("name profileImage skillsOffered rating")
      .limit(10);

    res.json({ success: true, data: experts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── 9. Mark daily plan task ──────────────────────────────────────────────────
exports.markDailyTask = async (req, res) => {
  try {
    const { pathId, taskIndex, done } = req.body;
    const path = await LearningPath.findOne({ _id: pathId, userId: req.user.id });
    if (!path) return res.status(404).json({ success: false, message: "Path not found" });
    if (path.dailyPlan[taskIndex] === undefined)
      return res.status(400).json({ success: false, message: "Task not found" });
    path.dailyPlan[taskIndex].done = done;
    path.markModified("dailyPlan");
    await path.save();
    res.json({ success: true, data: path });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
