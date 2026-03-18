const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const Session = require("../models/Session");

// Helper: get or create wallet for a user
const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    wallet = await Wallet.create({ userId });
  }
  return wallet;
};

// Helper: calculate duration from session start/end times in hours
const calcDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 1;
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const diff = eh * 60 + em - (sh * 60 + sm);
  return Math.max(1, Math.round(diff / 60));
};

// GET /api/wallet — Get current user's wallet
exports.getWallet = async (req, res) => {
  try {
    const wallet = await getOrCreateWallet(req.user.id);
    res.status(200).json({ success: true, data: wallet });
  } catch (error) {
    console.error("getWallet error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// GET /api/wallet/transactions — Get all transactions for the current user
exports.getTransactions = async (req, res) => {
  try {
    const { type, limit = 50, page = 1 } = req.query;
    const filter = { userId: req.user.id };
    if (type && type !== "all") filter.type = type;

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .populate("counterpartUser", "name avatar")
      .populate("sessionId", "skillTeach skillLearn date startTime endTime")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.status(200).json({ success: true, data: transactions, total });
  } catch (error) {
    console.error("getTransactions error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// POST /api/wallet/transaction — Create a manual transaction
exports.createTransaction = async (req, res) => {
  try {
    const { type, skillName, duration = 1, credits, status, description, counterpartUser, sessionId } = req.body;
    const userId = req.user.id;

    if (!type || !skillName || !credits) {
      return res.status(400).json({ success: false, message: "type, skillName, and credits are required" });
    }

    const wallet = await getOrCreateWallet(userId);
    const creditsNum = Number(credits);

    const tx = await Transaction.create({
      userId,
      type,
      skillName,
      duration,
      credits: creditsNum,
      status: status || "completed",
      description,
      counterpartUser,
      sessionId,
    });

    // Update wallet
    if (type === "earned" || type === "bonus") {
      wallet.earnedCredits += creditsNum;
    } else if (type === "spent" || type === "debt") {
      wallet.spentCredits += creditsNum;
    }
    await wallet.save();

    res.status(201).json({ success: true, data: tx, wallet });
  } catch (error) {
    console.error("createTransaction error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// PUT /api/wallet/update — Manually update wallet balance (admin/internal use)
exports.updateWallet = async (req, res) => {
  try {
    const { earnedCredits, spentCredits } = req.body;
    const wallet = await getOrCreateWallet(req.user.id);

    if (typeof earnedCredits === "number") wallet.earnedCredits = earnedCredits;
    if (typeof spentCredits === "number") wallet.spentCredits = spentCredits;
    await wallet.save();

    res.status(200).json({ success: true, data: wallet });
  } catch (error) {
    console.error("updateWallet error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// GET /api/wallet/stats — Credits earned per month for chart
exports.getWalletStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const stats = await Transaction.aggregate([
      { $match: { userId: require("mongoose").Types.ObjectId.createFromHexString(userId), createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            type: "$type",
          },
          total: { $sum: "$credits" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("getWalletStats error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// POST /api/wallet/request-credit — Request credit exchange even with low balance
exports.requestCredit = async (req, res) => {
  try {
    const { skillName, message, requestedCredits = 1 } = req.body;
    const userId = req.user.id;
    const wallet = await getOrCreateWallet(userId);

    // Create a pending debt transaction
    const tx = await Transaction.create({
      userId,
      type: "debt",
      skillName,
      credits: Number(requestedCredits),
      status: "pending",
      description: message || "Credit request for learning session",
    });

    res.status(201).json({ success: true, data: tx, walletBalance: wallet.balance });
  } catch (error) {
    console.error("requestCredit error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Internal helper (called by session completion) — exported for use by sessionController
exports.processSessionCredits = async (sessionId) => {
  try {
    const session = await Session.findById(sessionId)
      .populate("hostUser", "name")
      .populate("participantUser", "name");

    if (!session || session.status !== "completed") return;

    const duration = calcDuration(session.startTime, session.endTime);

    // Teacher (hostUser) earns credits
    const teacherWallet = await getOrCreateWallet(session.hostUser._id);
    teacherWallet.earnedCredits += duration;
    await teacherWallet.save();

    await Transaction.create({
      userId: session.hostUser._id,
      type: "earned",
      skillName: session.skillTeach,
      sessionId: session._id,
      duration,
      credits: duration,
      status: "completed",
      description: `Taught ${session.skillTeach} to ${session.participantUser.name}`,
      counterpartUser: session.participantUser._id,
    });

    // Learner (participantUser) spends credits
    const learnerWallet = await getOrCreateWallet(session.participantUser._id);
    learnerWallet.spentCredits += duration;
    await learnerWallet.save();

    await Transaction.create({
      userId: session.participantUser._id,
      type: "spent",
      skillName: session.skillTeach,
      sessionId: session._id,
      duration,
      credits: duration,
      status: "completed",
      description: `Learned ${session.skillTeach} from ${session.hostUser.name}`,
      counterpartUser: session.hostUser._id,
    });

    console.log(`✅ Credits processed for session ${sessionId}`);
  } catch (err) {
    console.error("processSessionCredits error:", err);
  }
};
