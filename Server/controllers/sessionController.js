const Session = require("../models/Session");
const User = require("../models/User");
const { processSessionCredits } = require("./walletController");
const { awardXP } = require("../utils/awardXP");

// Create a new session
exports.createSession = async (req, res) => {
  try {
    const {
      participantUser,
      skillTeach,
      skillLearn,
      date,
      startTime,
      endTime,
      meetingLink,
      notes,
    } = req.body;

    const hostUser = req.user.id; // From auth middleware

    const session = await Session.create({
      hostUser,
      participantUser,
      skillTeach,
      skillLearn,
      date,
      startTime,
      endTime,
      meetingLink,
      notes,
    });

    // Auto-sync schedule to active contract if one exists
    try {
      const SkillContract = require("../models/SkillContract");
      let activeContract;
      
      if (req.body.contractId) {
        activeContract = await SkillContract.findById(req.body.contractId);
      } else {
        activeContract = await SkillContract.findOne({
          status: "active",
          $or: [
            { userA: hostUser, userB: participantUser },
            { userA: participantUser, userB: hostUser },
          ],
        });
      }

      if (activeContract) {
        let slot;
        if (req.body.contractSessionNumber) {
          slot = activeContract.sessions.find(s => s.sessionNumber === Number(req.body.contractSessionNumber));
        } else {
          slot = activeContract.sessions.find((s) => s.status === "pending");
        }

        if (slot) {
          slot.status = "scheduled";
          slot.date = date;
          slot.startTime = startTime;
          slot.endTime = endTime;
          if (meetingLink) slot.meetingLink = meetingLink;
          if (notes) slot.notes = notes;
          await activeContract.save();
        }
      }
    } catch (err) {
      console.error("Failed to sync session with contract:", err);
    }

    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get user sessions (both as host and participant)
exports.getUserSessions = async (req, res) => {
  try {
    const userId = req.user.id;

    const sessions = await Session.find({
      $or: [{ hostUser: userId }, { participantUser: userId }],
    })
      .populate("hostUser", "name email")
      .populate("participantUser", "name email")
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Accept session
exports.acceptSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    // Only participant can accept if it's pending
    if (session.participantUser.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    session.status = "accepted";
    await session.save();

    // Sync acceptance back to contract if applicable
    if (session.contractId && session.contractSessionNumber) {
      try {
        const SkillContract = require("../models/SkillContract");
        const contract = await SkillContract.findById(session.contractId);
        if (contract) {
          const slot = contract.sessions.find(s => s.sessionNumber === session.contractSessionNumber);
          if (slot) {
            slot.status = "scheduled"; // Mark as confirmed scheduled
            await contract.save();
          }
        }
      } catch (err) {
        console.error("Sync accept error:", err);
      }
    }

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Reject session
exports.rejectSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    if (
      session.participantUser.toString() !== req.user.id &&
      session.hostUser.toString() !== req.user.id
    ) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    session.status = "rejected";
    await session.save();

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Complete session
exports.completeSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    if (
      session.participantUser.toString() !== req.user.id &&
      session.hostUser.toString() !== req.user.id
    ) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    session.status = "completed";
    await session.save();

    // ── Auto-process Time Banking credits ──
    try {
      await processSessionCredits(session._id);
    } catch (creditErr) {
      console.error("Credit processing failed:", creditErr);
    }

    // ── Award Gamification XP ──
    // Host taught → session_teach XP; Participant learned → session_complete XP
    try {
      await awardXP(session.hostUser, "session_teach");
      await awardXP(session.participantUser, "session_complete");
    } catch (xpErr) {
      console.error("XP award failed:", xpErr);
    }

    // Auto-sync complete to active contract if one exists
    try {
      const SkillContract = require("../models/SkillContract");
      let activeContract;

      if (session.contractId) {
        activeContract = await SkillContract.findById(session.contractId);
      } else {
        activeContract = await SkillContract.findOne({
          status: "active",
          $or: [
            { userA: session.hostUser, userB: session.participantUser },
            { userA: session.participantUser, userB: session.hostUser },
          ],
        });
      }

      if (activeContract) {
        let slot;
        if (session.contractSessionNumber) {
          slot = activeContract.sessions.find(s => s.sessionNumber === session.contractSessionNumber);
        } else {
          slot = activeContract.sessions.find((s) => s.status !== "completed" && s.status !== "cancelled");
        }

        if (slot) {
          slot.status = "completed";
          activeContract.syncCompletedSessions();
          await activeContract.save();
        }
      }
    } catch (err) {
      console.error("Failed to sync session completion with contract:", err);
    }

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete session
exports.deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    if (
      session.participantUser.toString() !== req.user.id &&
      session.hostUser.toString() !== req.user.id
    ) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    await session.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
