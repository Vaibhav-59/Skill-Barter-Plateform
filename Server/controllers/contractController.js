// /server/controllers/contractController.js
const SkillContract = require("../models/SkillContract");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { sendContractReminders } = require("../services/contractReminderService");

// ─── Create Contract ──────────────────────────────────────────────────────────
exports.createContract = async (req, res) => {
  try {
    const userAId = req.user._id;
    const {
      userBId,
      skillTeach,
      skillLearn,
      totalSessions,
      sessionDuration,
      startDate,
      notes,
    } = req.body;

    if (userAId.toString() === userBId) {
      return res.status(400).json({ success: false, message: "Cannot create contract with yourself" });
    }

    const userB = await User.findById(userBId);
    if (!userB) return res.status(404).json({ success: false, message: "Partner user not found" });

    // Build empty session slots
    const sessions = Array.from({ length: totalSessions }, (_, i) => ({
      sessionNumber: i + 1,
      status: "pending",
    }));

    const contract = await SkillContract.create({
      userA: userAId,
      userB: userBId,
      skillTeach,
      skillLearn,
      totalSessions,
      sessionDuration,
      startDate,
      notes,
      sessions,
      approvedByA: true, // Creator auto-approves
      approvedByB: false,
      status: "pending",
    });

    const populated = await SkillContract.findById(contract._id)
      .populate("userA", "name email avatar")
      .populate("userB", "name email avatar");

    // Notify userB
    const notif = await Notification.create({
      recipient: userBId,
      type: "match_request",
      content: `${req.user.name} invited you to a Skill Exchange Contract: teach ${skillLearn} and learn ${skillTeach}. Please review and approve.`,
      relatedId: contract._id,
      relatedModel: "Match",
    });

    const io = req.app.get("io");
    if (io && io.sendNotificationToUser) {
      io.sendNotificationToUser(userBId.toString(), notif);
    }

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    console.error("createContract error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Get My Contracts ─────────────────────────────────────────────────────────
exports.getUserContracts = async (req, res) => {
  try {
    const userId = req.user._id;
    const contracts = await SkillContract.find({
      $or: [{ userA: userId }, { userB: userId }],
    })
      .populate("userA", "name email avatar")
      .populate("userB", "name email avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: contracts });
  } catch (err) {
    console.error("getUserContracts error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Get Single Contract ──────────────────────────────────────────────────────
exports.getContractById = async (req, res) => {
  try {
    const userId = req.user._id;
    const contract = await SkillContract.findById(req.params.id)
      .populate("userA", "name email avatar")
      .populate("userB", "name email avatar");

    if (!contract) return res.status(404).json({ success: false, message: "Contract not found" });

    const isParticipant =
      contract.userA._id.toString() === userId.toString() ||
      contract.userB._id.toString() === userId.toString();

    if (!isParticipant)
      return res.status(403).json({ success: false, message: "Not authorized" });

    res.status(200).json({ success: true, data: contract });
  } catch (err) {
    console.error("getContractById error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Accept Contract ──────────────────────────────────────────────────────────
exports.acceptContract = async (req, res) => {
  try {
    const userId = req.user._id;
    const contract = await SkillContract.findById(req.params.id)
      .populate("userA", "name email avatar")
      .populate("userB", "name email avatar");

    if (!contract) return res.status(404).json({ success: false, message: "Contract not found" });
    if (contract.status !== "pending")
      return res.status(400).json({ success: false, message: "Contract is not pending" });

    const isA = contract.userA._id.toString() === userId.toString();
    const isB = contract.userB._id.toString() === userId.toString();
    if (!isA && !isB)
      return res.status(403).json({ success: false, message: "Not a participant" });

    if (isA) contract.approvedByA = true;
    if (isB) contract.approvedByB = true;

    // Activate if both approved
    if (contract.approvedByA && contract.approvedByB) {
      contract.status = "active";
    }

    await contract.save();

    // Notify the other party
    const otherUserId = isA ? contract.userB._id : contract.userA._id;
    const notif = await Notification.create({
      recipient: otherUserId,
      type: "system",
      content: `${req.user.name} approved the Skill Exchange Contract: ${contract.skillTeach} ↔ ${contract.skillLearn}.${contract.status === "active" ? " The contract is now ACTIVE!" : ""}`,
      relatedId: contract._id,
      relatedModel: "Match",
    });
    const io = req.app.get("io");
    if (io && io.sendNotificationToUser) {
      io.sendNotificationToUser(otherUserId.toString(), notif);
    }

    res.status(200).json({ success: true, data: contract });
  } catch (err) {
    console.error("acceptContract error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Cancel Contract ──────────────────────────────────────────────────────────
exports.cancelContract = async (req, res) => {
  try {
    const userId = req.user._id;
    const contract = await SkillContract.findById(req.params.id)
      .populate("userA", "name email avatar")
      .populate("userB", "name email avatar");

    if (!contract) return res.status(404).json({ success: false, message: "Contract not found" });

    const isA = contract.userA._id.toString() === userId.toString();
    const isB = contract.userB._id.toString() === userId.toString();
    if (!isA && !isB)
      return res.status(403).json({ success: false, message: "Not a participant" });

    if (contract.status === "completed" || contract.status === "cancelled")
      return res.status(400).json({ success: false, message: `Contract already ${contract.status}` });

    contract.status = "cancelled";
    await contract.save();

    const otherUserId = isA ? contract.userB._id : contract.userA._id;
    const notif = await Notification.create({
      recipient: otherUserId,
      type: "system",
      content: `${req.user.name} cancelled the Skill Exchange Contract: ${contract.skillTeach} ↔ ${contract.skillLearn}.`,
      relatedId: contract._id,
      relatedModel: "Match",
    });
    const io = req.app.get("io");
    if (io && io.sendNotificationToUser) {
      io.sendNotificationToUser(otherUserId.toString(), notif);
    }

    res.status(200).json({ success: true, data: contract });
  } catch (err) {
    console.error("cancelContract error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Schedule a Session ───────────────────────────────────────────────────────
exports.scheduleSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionNumber, date, startTime, endTime, meetingLink, notes } = req.body;

    const contract = await SkillContract.findById(req.params.id)
      .populate("userA", "name email avatar")
      .populate("userB", "name email avatar");

    if (!contract) return res.status(404).json({ success: false, message: "Contract not found" });
    if (contract.status !== "active")
      return res.status(400).json({ success: false, message: "Contract must be active to schedule sessions" });

    const isA = contract.userA._id.toString() === userId.toString();
    const isB = contract.userB._id.toString() === userId.toString();
    if (!isA && !isB)
      return res.status(403).json({ success: false, message: "Not a participant" });

    const sessionIdx = contract.sessions.findIndex(
      (s) => s.sessionNumber === Number(sessionNumber)
    );
    if (sessionIdx === -1)
      return res.status(404).json({ success: false, message: "Session slot not found" });

    const session = contract.sessions[sessionIdx];
    if (session.status === "completed")
      return res.status(400).json({ success: false, message: "Session already completed" });

    session.date = date;
    session.startTime = startTime;
    session.endTime = endTime;
    if (meetingLink !== undefined) session.meetingLink = meetingLink;
    if (notes !== undefined) session.notes = notes;
    session.status = "scheduled";
    session.reminderSent1h = false;
    session.reminderSent10m = false;

    await contract.save();

    // Notify the other user
    const otherUserId = isA ? contract.userB._id : contract.userA._id;
    const notif = await Notification.create({
      recipient: otherUserId,
      type: "reminder",
      content: `${req.user.name} scheduled Session #${sessionNumber} of your ${contract.skillTeach} ↔ ${contract.skillLearn} contract on ${new Date(date).toLocaleDateString()} at ${startTime}.`,
      relatedId: contract._id,
      relatedModel: "Match",
    });
    const io = req.app.get("io");
    if (io && io.sendNotificationToUser) {
      io.sendNotificationToUser(otherUserId.toString(), notif);
    }

    res.status(200).json({ success: true, data: contract });
  } catch (err) {
    console.error("scheduleSession error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Complete a Session ───────────────────────────────────────────────────────
exports.completeContractSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionNumber } = req.body;

    const contract = await SkillContract.findById(req.params.id)
      .populate("userA", "name email avatar")
      .populate("userB", "name email avatar");

    if (!contract) return res.status(404).json({ success: false, message: "Contract not found" });
    if (contract.status !== "active")
      return res.status(400).json({ success: false, message: "Contract must be active" });

    const isA = contract.userA._id.toString() === userId.toString();
    const isB = contract.userB._id.toString() === userId.toString();
    if (!isA && !isB)
      return res.status(403).json({ success: false, message: "Not a participant" });

    const sessionIdx = contract.sessions.findIndex(
      (s) => s.sessionNumber === Number(sessionNumber)
    );
    if (sessionIdx === -1)
      return res.status(404).json({ success: false, message: "Session not found" });

    contract.sessions[sessionIdx].status = "completed";
    contract.syncCompletedSessions();
    await contract.save();

    // Notify other party
    const otherUserId = isA ? contract.userB._id : contract.userA._id;
    const progressPct = Math.round((contract.completedSessions / contract.totalSessions) * 100);
    const notif = await Notification.create({
      recipient: otherUserId,
      type: "system",
      content: `${req.user.name} marked Session #${sessionNumber} as completed (${contract.completedSessions}/${contract.totalSessions} sessions — ${progressPct}%).${contract.status === "completed" ? " 🎉 The contract is now COMPLETE!" : ""}`,
      relatedId: contract._id,
      relatedModel: "Match",
    });
    const io = req.app.get("io");
    if (io && io.sendNotificationToUser) {
      io.sendNotificationToUser(otherUserId.toString(), notif);
    }

    res.status(200).json({ success: true, data: contract });
  } catch (err) {
    console.error("completeContractSession error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Create a Review for a Contract ───────────────────────────────────────────
exports.createContractReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment, reviewee, skillDelivered, wouldRecommend, teachingQuality, communication, reliability, skillOffered, skillRequested } = req.body;

    const Review = require("../models/Review");

    // Validation
    if (!rating || !comment || !reviewee) {
      return res.status(400).json({ success: false, message: "Please provide rating, comment, and reviewee" });
    }

    const contract = await SkillContract.findById(id);
    if (!contract) return res.status(404).json({ success: false, message: "Contract not found" });

    if (contract.status !== "completed") {
      return res.status(400).json({ success: false, message: "Can only review completed contracts" });
    }

    const isA = contract.userA.toString() === req.user._id.toString();
    const isB = contract.userB.toString() === req.user._id.toString();

    if (!isA && !isB) {
      return res.status(403).json({ success: false, message: "Not authorized to review this contract" });
    }

    const expectedReviewee = isA ? contract.userB.toString() : contract.userA.toString();
    if (expectedReviewee !== reviewee) {
      return res.status(400).json({ success: false, message: "Invalid reviewee for this contract" });
    }

    const existingReview = await Review.findOne({
      reviewer: req.user._id,
      reviewee,
      matchId: contract._id, // tie it to the contract
    });

    if (existingReview) {
      return res.status(400).json({ success: false, message: "You have already reviewed this contract" });
    }

    // Create review
    const reviewData = {
      reviewer: req.user._id,
      reviewee,
      rating: parseInt(rating),
      comment: comment.trim(),
      matchId: contract._id,
      skillDelivered,
      wouldRecommend,
      teachingQuality: parseInt(teachingQuality),
      communication: parseInt(communication),
      reliability: parseInt(reliability),
      skillOffered,
      skillRequested,
    };

    const review = await Review.create(reviewData);

    // If both have reviewed, or similar logic, update contract?
    // Optionally: contract.reviewLeft = false; or similar logic;
    // but the component checks `!contract.reviewLeft` as an example state.

    // Populate standard review details
    await review.populate([
      { path: "reviewer", select: "name avatar email" },
      { path: "reviewee", select: "name avatar email" },
    ]);

    res.status(201).json({
      success: true,
      data: review,
      message: "Review submitted successfully",
    });
  } catch (error) {
    console.error("createContractReview error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
