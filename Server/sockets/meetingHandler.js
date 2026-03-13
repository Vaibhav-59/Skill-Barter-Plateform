/**
 * meetingHandler.js
 * Handles Socket.io signaling for multi-party WebRTC meetings.
 * Rooms are stored in-memory as a Map:
 *   meetingRooms: Map<meetingId, Map<socketId, { userId, userName, socketId }>>
 *
 * All WebRTC media flows peer-to-peer; the server only relays signaling.
 */

// Global meeting room store (survives individual socket reconnects)
const meetingRooms = new Map();
const Meeting = require("../models/Meeting");

module.exports = (io, socket) => {
  // Expose active meetings for the admin dashboard
  if (!io.getActiveMeetings) {
    io.getActiveMeetings = () => {
      const active = [];
      for (const [meetingId, roomMap] of meetingRooms.entries()) {
        active.push({
          meetingId,
          participantCount: roomMap.participants.size,
          createdAt: roomMap.createdAt,
          participants: Array.from(roomMap.participants.values()).map((p) => ({
            userId: p.userId,
            userName: p.userName,
            isHost: p.isHost,
            isCamOff: p.isCamOff,
            isMuted: p.isMuted,
            isScreenSharing: p.isScreenSharing,
          })),
        });
      }
      return active;
    };
  }

  const userId = socket.userId;
  // Resolved once at connection time from JWT; used by offer relay and logs
  const serverName = socket.user?.name || "Participant";

  // ── joinMeeting ────────────────────────────────────────────────────────────
  socket.on("joinMeeting", async ({ meetingId, userName: clientName }) => {
    if (!meetingId) return;

    // Resolve display name: JWT is authoritative; fall back to client-supplied name
    const resolvedName = (serverName !== "Participant" ? serverName : null) || clientName || serverName;

    if (!meetingRooms.has(meetingId)) {
      meetingRooms.set(meetingId, {
        participants: new Map(),
        createdAt: new Date()
      });
    }

    const roomData = meetingRooms.get(meetingId);
    const room = roomData.participants;

    // ── Idempotent guard ───────────────────────────────────────────────────
    // If this socket already joined this room (e.g. React StrictMode double-invoke
    // or a stale re-render), skip the join logic to avoid duplicate entries.
    if (room.has(socket.id)) {
      console.log(`ℹ️  ${resolvedName} already in meeting ${meetingId} – ignoring duplicate join`);
      // Re-send existingParticipants so client can recover if needed
      const others = Array.from(room.values()).filter((p) => p.socketId !== socket.id);
      socket.emit("existingParticipants", { existingParticipants: others });
      return;
    }

    // Participants already in the room BEFORE this user joins
    const existingParticipants = Array.from(room.values());

    // The first user in the room becomes the host
    const isHost = existingParticipants.length === 0;

    // Register this participant
    const participant = {
      socketId: socket.id,
      userId,
      userName: resolvedName,
      isCamOff: false,
      isMuted: false,
      isScreenSharing: false,
      isHost,
    };
    room.set(socket.id, participant);

    // Write to MongoDB asynchronously for History/Admin analysis
    try {
      if (isHost) {
        await Meeting.findOneAndUpdate(
          { meetingId },
          { 
            meetingId,
            host: userId,
            status: "active",
            startedAt: new Date(),
            $addToSet: { participants: userId }
          },
          { upsert: true, new: true }
        );
      } else {
        await Meeting.updateOne(
          { meetingId },
          { $addToSet: { participants: userId } }
        );
      }
    } catch (err) {
      console.error("DB Meeting Sync Error [Join]:", err.message);
    }

    socket.join(`meeting_${meetingId}`);
    socket.data.meetingId = meetingId;

    console.log(`🏠 ${resolvedName} joined meeting ${meetingId} (${room.size} total)`);

    // Tell the joiner who's already here
    socket.emit("existingParticipants", { existingParticipants });

    // Tell everyone else a new participant arrived
    socket.to(`meeting_${meetingId}`).emit("userJoined", participant);
  });

  // ── sendOffer ──────────────────────────────────────────────────────────────
  // Caller → [target peer]: { targetSocketId, offer }
  socket.on("meetingOffer", ({ targetSocketId, offer }) => {
    io.to(targetSocketId).emit("meetingOffer", {
      fromSocketId: socket.id,
      fromUserId:   userId,
      fromUserName: serverName,
      offer,
    });
  });

  // ── sendAnswer ─────────────────────────────────────────────────────────────
  // Callee → [original caller]: { targetSocketId, answer }
  socket.on("meetingAnswer", ({ targetSocketId, answer }) => {
    io.to(targetSocketId).emit("meetingAnswer", {
      fromSocketId: socket.id,
      answer,
    });
  });

  // ── iceCandidate ───────────────────────────────────────────────────────────
  // Either peer → other peer: { targetSocketId, candidate }
  socket.on("meetingIceCandidate", ({ targetSocketId, candidate }) => {
    io.to(targetSocketId).emit("meetingIceCandidate", {
      fromSocketId: socket.id,
      candidate,
    });
  });

  // ── meetingChat ────────────────────────────────────────────────────────────
  // Relay text messages to everyone else in the room
  socket.on("meetingChat", ({ meetingId, from, text, timestamp }) => {
    socket.to(`meeting_${meetingId}`).emit("meetingChat", { from, text, timestamp });
  });

  // ── toggleMedia ────────────────────────────────────────────────────────────
  // Broadcast camera/mic/screen-share toggles.
  // type: "audio"  → isMuted
  // type: "video"  → isCamOff
  // type: "screen" → isScreenSharing (isOff=false means sharing started)
  socket.on("toggleMedia", ({ meetingId, type, isOff }) => {
    const roomObj = meetingRooms.get(meetingId);
    if (roomObj) {
      const p = roomObj.participants.get(socket.id);
      if (p) {
        if (type === "video")  p.isCamOff        = isOff;
        if (type === "audio")  p.isMuted          = isOff;
        if (type === "screen") p.isScreenSharing  = !isOff; // isOff=false → sharing ON
      }
    }
    // Forward to all OTHER participants in the room
    socket.to(`meeting_${meetingId}`).emit("peerMediaToggled", { socketId: socket.id, type, isOff });
  });

  // ── leaveMeeting ──────────────────────────────────────────────────────────
  // Client sends: { meetingId }
  socket.on("leaveMeeting", ({ meetingId }) => {
    handleLeave(meetingId);
  });

  // ── Auto-cleanup on disconnect (tab closed, network drop, etc.) ───────────
  socket.on("disconnect", () => {
    const mid = socket.data?.meetingId;
    if (mid) handleLeave(mid);
  });

  // ── Helper: remove from room + notify peers ────────────────────────────────
  function handleLeave(meetingId) {
    const roomObj = meetingRooms.get(meetingId);
    if (!roomObj) return;

    roomObj.participants.delete(socket.id);
    socket.leave(`meeting_${meetingId}`);

    console.log(`🚪 ${serverName} left meeting ${meetingId} (${roomObj.participants.size} remaining)`);

    // Notify remaining participants
    io.to(`meeting_${meetingId}`).emit("userLeft", { socketId: socket.id });

    // Clean up empty rooms
    if (roomObj.participants.size === 0) {
      meetingRooms.delete(meetingId);
      console.log(`🗑️  Meeting room ${meetingId} deleted (empty)`);

      // Update DB to ended
      Meeting.updateOne(
        { meetingId, status: "active" },
        { $set: { status: "ended", endedAt: new Date() } }
      ).catch(err => console.error("DB Meeting Sync Error [End]:", err.message));
    }

    delete socket.data.meetingId;
  }
};
