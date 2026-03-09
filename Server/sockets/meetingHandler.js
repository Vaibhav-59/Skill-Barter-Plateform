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

module.exports = (io, socket) => {
  const userId   = socket.userId;
  const userName = socket.user?.name || "Unknown";

  // ── joinMeeting ────────────────────────────────────────────────────────────
  // Client sends: { meetingId }
  // Server emits back to caller: { existingParticipants: [{socketId, userId, userName}] }
  // Server broadcasts to room: userJoined { socketId, userId, userName }
  socket.on("joinMeeting", ({ meetingId }) => {
    if (!meetingId) return;

    // Create the room if it doesn't exist
    if (!meetingRooms.has(meetingId)) {
      meetingRooms.set(meetingId, new Map());
    }

    const room = meetingRooms.get(meetingId);

    // Build list of current participants BEFORE adding self
    const existingParticipants = Array.from(room.values());

    // Add self to room
    const participant = { socketId: socket.id, userId, userName };
    room.set(socket.id, participant);

    // Join the Socket.io room
    socket.join(`meeting_${meetingId}`);
    socket.data.meetingId = meetingId; // remember for disconnect cleanup

    console.log(
      `🏠 ${userName} joined meeting ${meetingId} (${room.size} participants total)`
    );

    // Send caller the list of already-present participants so they can create offers
    socket.emit("existingParticipants", { existingParticipants });

    // Notify everyone else that a new user arrived
    socket.to(`meeting_${meetingId}`).emit("userJoined", participant);
  });

  // ── sendOffer ──────────────────────────────────────────────────────────────
  // Caller → [target peer]: { targetSocketId, offer }
  socket.on("meetingOffer", ({ targetSocketId, offer }) => {
    io.to(targetSocketId).emit("meetingOffer", {
      fromSocketId: socket.id,
      fromUserId:   userId,
      fromUserName: userName,
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
    const room = meetingRooms.get(meetingId);
    if (!room) return;

    room.delete(socket.id);
    socket.leave(`meeting_${meetingId}`);

    console.log(`🚪 ${userName} left meeting ${meetingId} (${room.size} remaining)`);

    // Notify remaining participants
    io.to(`meeting_${meetingId}`).emit("userLeft", { socketId: socket.id });

    // Clean up empty rooms
    if (room.size === 0) {
      meetingRooms.delete(meetingId);
      console.log(`🗑️  Meeting room ${meetingId} deleted (empty)`);
    }

    delete socket.data.meetingId;
  }
};
