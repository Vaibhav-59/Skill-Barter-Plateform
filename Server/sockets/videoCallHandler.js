/**
 * videoCallHandler.js
 * WebRTC signaling via Socket.io — forwards offers, answers, and ICE candidates
 * between callers. The server never touches the media (pure peer-to-peer).
 */
module.exports = (io, socket, onlineUsers) => {
  const userId = socket.userId;

  // ── callUser ──────────────────────────────────────────────────────────────
  // Caller sends {targetUserId, offer, callerName, callerAvatar}
  socket.on("callUser", ({ targetUserId, offer, callerName, callerAvatar }) => {
    console.log(`📹 ${callerName} is calling user ${targetUserId}`);

    // Deliver to the target user's personal room
    io.to(`user_${targetUserId}`).emit("incomingCall", {
      callerId: userId,
      callerName,
      callerAvatar: callerAvatar || null,
      offer,
    });
  });

  // ── acceptCall ────────────────────────────────────────────────────────────
  // Callee answers: {callerId, answer}
  socket.on("acceptCall", ({ callerId, answer }) => {
    console.log(`✅ User ${userId} accepted call from ${callerId}`);
    io.to(`user_${callerId}`).emit("callAccepted", {
      answer,
      calleeId: userId,
    });
  });

  // ── rejectCall ────────────────────────────────────────────────────────────
  // Callee declined: {callerId}
  socket.on("rejectCall", ({ callerId }) => {
    console.log(`❌ User ${userId} rejected call from ${callerId}`);
    io.to(`user_${callerId}`).emit("callRejected", {
      calleeId: userId,
    });
  });

  // ── endCall ───────────────────────────────────────────────────────────────
  // Either party ends the call: {targetUserId}
  socket.on("endCall", ({ targetUserId }) => {
    console.log(`📵 User ${userId} ended call with ${targetUserId}`);
    io.to(`user_${targetUserId}`).emit("callEnded", {
      endedBy: userId,
    });
  });

  // ── iceCandidate ──────────────────────────────────────────────────────────
  // Forward ICE candidate to the remote peer: {targetUserId, candidate}
  socket.on("iceCandidate", ({ targetUserId, candidate }) => {
    io.to(`user_${targetUserId}`).emit("iceCandidate", {
      candidate,
      from: userId,
    });
  });

  // ── toggleMedia ───────────────────────────────────────────────────────────
  // Relay media toggle state (camera or mic) to the other peer: {targetUserId, type, isOff}
  socket.on("toggleMedia", ({ targetUserId, type, isOff }) => {
    io.to(`user_${targetUserId}`).emit("mediaToggled", {
      from: userId,
      type,
      isOff,
    });
  });
};
