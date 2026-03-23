const GroupSession = require("../models/GroupSession");
const Wallet = require("../models/Wallet");
const Notification = require("../models/Notification");

// ─── Helper ─────────────────────────────────────────────────────────────────
const sendNotification = async (io, userId, notification) => {
  try {
    const notif = await Notification.create({ user: userId, ...notification });
    if (io) io.to(userId.toString()).emit("notification", notif);
  } catch (_) {}
};

const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

// ─── CREATE ─────────────────────────────────────────────────────────────────
exports.createGroupSession = async (req, res) => {
  try {
    const hostUserId = req.user.id;
    const {
      title,
      skill,
      description,
      date,
      startTime,
      endTime,
      maxParticipants,
      sessionType,
    } = req.body;

    const session = await GroupSession.create({
      hostUserId,
      title,
      skill,
      description,
      date,
      startTime,
      endTime,
      maxParticipants: maxParticipants || 10,
      sessionType: sessionType || "scheduled",
    });

    await session.populate("hostUserId", "name avatar profileImage");

    res.status(201).json({ success: true, data: session });
  } catch (err) {
    console.error("createGroupSession:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── GET ALL ─────────────────────────────────────────────────────────────────
exports.getAllGroupSessions = async (req, res) => {
  try {
    const { status, skill, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (skill) filter.skill = new RegExp(escapeRegex(skill), "i");

    const sessions = await GroupSession.find(filter)
      .populate("hostUserId", "name avatar profileImage")
      .populate("participants.userId", "name avatar profileImage")
      .sort({ date: 1, startTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await GroupSession.countDocuments(filter);

    res.json({
      success: true,
      data: sessions,
      pagination: { total, page: +page, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET ONE ─────────────────────────────────────────────────────────────────
exports.getGroupSession = async (req, res) => {
  try {
    const session = await GroupSession.findById(req.params.id)
      .populate("hostUserId", "name avatar profileImage skills")
      .populate("participants.userId", "name avatar profileImage skills")
      .populate("chat.userId", "name avatar profileImage");

    if (!session)
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });

    res.json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── JOIN ─────────────────────────────────────────────────────────────────
exports.joinGroupSession = async (req, res) => {
  try {
    const session = await GroupSession.findById(req.params.id);
    if (!session)
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });

    if (session.status === "completed" || session.status === "cancelled")
      return res
        .status(400)
        .json({ success: false, message: "Session is no longer active" });

    if (
      session.participants.some(
        (p) => p.userId.toString() === req.user.id
      )
    )
      return res
        .status(400)
        .json({ success: false, message: "Already joined this session" });

    if (session.hostUserId.toString() === req.user.id)
      return res
        .status(400)
        .json({ success: false, message: "You are the host" });

    if (session.participants.length >= session.maxParticipants)
      return res
        .status(400)
        .json({ success: false, message: "Session is full" });

    session.participants.push({ userId: req.user.id, status: "joined" });
    await session.save();
    await session.populate("hostUserId", "name avatar profileImage");
    await session.populate("participants.userId", "name avatar profileImage");

    // Notify host
    const io = req.app.get("io");
    await sendNotification(io, session.hostUserId, {
      type: "group_session_join",
      message: `Someone joined your session: ${session.title}`,
      link: `/skill-hub/group-sessions`,
    });

    res.json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── LEAVE ─────────────────────────────────────────────────────────────────
exports.leaveGroupSession = async (req, res) => {
  try {
    const session = await GroupSession.findById(req.params.id);
    if (!session)
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });

    const idx = session.participants.findIndex(
      (p) => p.userId.toString() === req.user.id
    );
    if (idx === -1)
      return res
        .status(400)
        .json({ success: false, message: "Not a participant" });

    session.participants.splice(idx, 1);
    await session.save();

    res.json({ success: true, message: "Left session successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── UPDATE ─────────────────────────────────────────────────────────────────
exports.updateGroupSession = async (req, res) => {
  try {
    const session = await GroupSession.findById(req.params.id);
    if (!session)
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });

    if (session.hostUserId.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Unauthorized" });

    const allowed = [
      "title",
      "skill",
      "description",
      "date",
      "startTime",
      "endTime",
      "maxParticipants",
      "sessionType",
      "status",
      "recordingLink",
    ];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) session[field] = req.body[field];
    });

    // If host starts session → live
    if (req.body.status === "live") {
      session.status = "live";
    }

    // If session completed → award credits
    if (req.body.status === "completed" && !session.creditsAwarded) {
      const creditsPerParticipant = session.participants.length;
      try {
        await Wallet.findOneAndUpdate(
          { user: session.hostUserId },
          {
            $inc: {
              balance: creditsPerParticipant,
              earnedCredits: creditsPerParticipant,
            },
          },
          { upsert: true }
        );
        session.creditsAwarded = true;

        const io = req.app.get("io");
        await sendNotification(io, session.hostUserId, {
          type: "credits_earned",
          message: `You earned ${creditsPerParticipant} credits for hosting "${session.title}"`,
          link: `/skill-hub/time-banking`,
        });
      } catch (_) {}
    }

    await session.save();
    await session.populate("hostUserId", "name avatar profileImage");

    res.json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE ─────────────────────────────────────────────────────────────────
exports.deleteGroupSession = async (req, res) => {
  try {
    const session = await GroupSession.findById(req.params.id);
    if (!session)
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });

    if (session.hostUserId.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Unauthorized" });

    await session.deleteOne();
    res.json({ success: true, message: "Session deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── SEND CHAT MESSAGE ─────────────────────────────────────────────────────
exports.sendChatMessage = async (req, res) => {
  try {
    const session = await GroupSession.findById(req.params.id);
    if (!session)
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });

    const isParticipant = session.participants.some(
      (p) => p.userId.toString() === req.user.id
    );
    const isHost = session.hostUserId.toString() === req.user.id;

    if (!isParticipant && !isHost)
      return res
        .status(403)
        .json({ success: false, message: "Not a member of this session" });

    const { message } = req.body;
    if (!message || !message.trim())
      return res
        .status(400)
        .json({ success: false, message: "Message cannot be empty" });

    session.chat.push({ userId: req.user.id, message: message.trim() });
    await session.save();
    await session.populate("chat.userId", "name avatar profileImage");

    const newMsg = session.chat[session.chat.length - 1];

    // Broadcast via socket
    const io = req.app.get("io");
    if (io) io.to(`group-session-${req.params.id}`).emit("group-chat", newMsg);

    res.json({ success: true, data: newMsg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET MY STATS ─────────────────────────────────────────────────────────
exports.getMySessionStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [hosted, joined, upcoming, completed] = await Promise.all([
      GroupSession.countDocuments({ hostUserId: userId }),
      GroupSession.countDocuments({
        "participants.userId": userId,
      }),
      GroupSession.countDocuments({
        $or: [
          { hostUserId: userId, status: { $in: ["scheduled", "live"] } },
          {
            "participants.userId": userId,
            status: { $in: ["scheduled", "live"] },
          },
        ],
      }),
      GroupSession.countDocuments({
        $or: [
          { hostUserId: userId, status: "completed" },
          { "participants.userId": userId, status: "completed" },
        ],
      }),
    ]);

    res.json({
      success: true,
      data: { hosted, joined, upcoming, completed },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── MY SESSIONS (hosted) ─────────────────────────────────────────────────
exports.getMySessions = async (req, res) => {
  try {
    const sessions = await GroupSession.find({ hostUserId: req.user.id })
      .populate("participants.userId", "name avatar profileImage")
      .sort({ date: -1 });
    res.json({ success: true, data: sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── JOINED SESSIONS ─────────────────────────────────────────────────────
exports.getJoinedSessions = async (req, res) => {
  try {
    const sessions = await GroupSession.find({
      "participants.userId": req.user.id,
    })
      .populate("hostUserId", "name avatar profileImage")
      .sort({ date: -1 });
    res.json({ success: true, data: sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
