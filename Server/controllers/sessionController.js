const Session = require("../models/Session");
const User = require("../models/User");

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
