import { useState, useEffect, useRef, useCallback } from "react";
import socketService from "../utils/socket";
import api from "../utils/api";

// ─── WebRTC STUN servers ──────────────────────────────────────────────────────
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

/**
 * CALL STATES
 *  idle        – no call activity (renders as a small button in the chat header)
 *  calling     – outgoing call ringing
 *  incoming    – remote user is calling
 *  connected   – live two-way video
 *  ended       – brief summary screen before close
 */
export default function VideoCall({ currentUser, remoteUser, conversationId, onCallMessage }) {
  const [callState, setCallState]   = useState("idle");
  const [isMuted, setIsMuted]       = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [incomingOffer, setIncomingOffer] = useState(null);
  const [callerId, setCallerId]     = useState(null);
  const [callerInfo, setCallerInfo] = useState(null);
  const [error, setError]           = useState("");
  const [callDuration, setCallDuration] = useState(0);

  const localVideoRef    = useRef(null);
  const remoteVideoRef   = useRef(null);
  const peerConnRef      = useRef(null);
  const localStreamRef   = useRef(null);
  // Buffer the remote MediaStream so we can apply it after the <video> renders
  const remoteStreamRef  = useRef(null);
  const callTimerRef     = useRef(null);
  // Store duration in a ref so callbacks always see latest value without stale closure
  const callDurationRef  = useRef(0);

  // ── Timer helpers ────────────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    callDurationRef.current = 0;
    setCallDuration(0);
    callTimerRef.current = setInterval(() => {
      callDurationRef.current += 1;
      setCallDuration(callDurationRef.current);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
  }, []);

  const formatDuration = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  // ── getLocalStream ───────────────────────────────────────────────────────────
  // FIXES NotReadableError: if the stream is already active, reuse it.
  // If video fails (device busy), fall back to audio-only.
  const getLocalStream = useCallback(async () => {
    // ① Reuse existing active stream — prevents "Device in use" on second call
    if (localStreamRef.current?.active) {
      if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
      return localStreamRef.current;
    }

    // ② Try video + audio
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 },
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      return stream;
    } catch (videoErr) {
      console.warn("Video+audio failed, trying audio-only:", videoErr.name);

      // ③ Graceful fallback: audio only (camera might genuinely be in use elsewhere)
      if (videoErr.name === "NotReadableError" || videoErr.name === "NotFoundError") {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: { echoCancellation: true, noiseSuppression: true },
          });
          localStreamRef.current = audioStream;
          setIsCameraOff(true); // show camera-off UI automatically
          return audioStream;
        } catch (audioErr) {
          console.error("Audio fallback also failed:", audioErr);
          setError("Cannot access microphone. Please check browser permissions.");
          throw audioErr;
        }
      }

      // ④ Permission denied — surface clear message
      setError("Camera/microphone access denied. Allow permissions and try again.");
      throw videoErr;
    }
  }, []);

  // ── createPeerConnection ─────────────────────────────────────────────────────
  const createPeerConnection = useCallback((targetUserId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socketService.socket?.emit("iceCandidate", { targetUserId, candidate });
      }
    };

    pc.ontrack = ({ streams }) => {
      const stream = streams[0];
      if (!stream) return;
      // Always save to ref — the <video> element may not exist yet
      // (the connected state hasn't rendered it yet when ontrack fires)
      remoteStreamRef.current = stream;
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("🔗 PeerConnection state:", pc.connectionState);
      if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
        // Use endCallCleanup ref to avoid stale closure issue
        endCallRef.current?.();
      }
    };

    peerConnRef.current = pc;
    return pc;
  }, []);

  // ── saveCallMessage ──────────────────────────────────────────────────────────
  // Posts a "call" type message to the chat so both users see it in the timeline
  const saveCallMessage = useCallback(async (durationSeconds) => {
    if (!conversationId) return;
    try {
      const text = durationSeconds > 0
        ? `📹 Video call · ${formatDuration(durationSeconds)}`
        : "📹 Missed video call";

      const response = await api.post("/chats/messages", {
        conversationId,
        text,
        messageType: "call",
      });
      // Notify ChatPage to add the new message immediately
      onCallMessage?.(response.data);
    } catch (err) {
      console.error("Failed to save call message:", err);
    }
  }, [conversationId, onCallMessage]);

  // ── cleanup (stop tracks, close PC) ─────────────────────────────────────────
  const cleanup = useCallback(() => {
    stopTimer();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (peerConnRef.current) {
      peerConnRef.current.onconnectionstatechange = null; // prevent re-entrant endCall
      peerConnRef.current.close();
      peerConnRef.current = null;
    }
    remoteStreamRef.current = null;
    if (localVideoRef.current)  localVideoRef.current.srcObject  = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setIncomingOffer(null);
    setCallerId(null);
    setCallerInfo(null);
    setIsMuted(false);
    setIsCameraOff(false);
    setError("");
  }, [stopTimer]);

  // ── endCall (exposed + used by onconnectionstatechange) ──────────────────────
  // Keep in a ref so the PC callback always sees the current version
  const endCallRef = useRef(null);

  const endCall = useCallback(async (opts = {}) => {
    const targetId = callerId || remoteUser?._id;
    if (targetId && !opts.remote) {
      socketService.socket?.emit("endCall", { targetUserId: targetId });
    }
    const duration = callDurationRef.current;
    cleanup();
    setCallState("ended");

    // Only the user who initiated endCall saves the message (avoids duplicate)
    if (!opts.remote) {
      await saveCallMessage(duration);
    }

    setTimeout(() => {
      setCallState("idle");
      setCallDuration(0);
      callDurationRef.current = 0;
    }, 2500);
  }, [callerId, remoteUser, cleanup, saveCallMessage]);

  // Sync endCallRef whenever endCall changes
  useEffect(() => { endCallRef.current = endCall; }, [endCall]);

  // ── startCall ────────────────────────────────────────────────────────────────
  const startCall = useCallback(async () => {
    // If already in a call, end it
    if (callState === "connected" || callState === "calling") {
      endCall();
      return;
    }
    
    if (!remoteUser) return;
    setError("");
    setCallState("calling");
    try {
      const stream = await getLocalStream();
      const pc = createPeerConnection(remoteUser._id);
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
      await pc.setLocalDescription(offer);

      socketService.socket?.emit("callUser", {
        targetUserId: remoteUser._id,
        offer: pc.localDescription,
        callerName: currentUser?.name || "User",
        callerAvatar: currentUser?.avatar || null,
      });
    } catch (err) {
      console.error("startCall error:", err);
      cleanup();
      setCallState("idle");
    }
  }, [remoteUser, currentUser, getLocalStream, createPeerConnection, cleanup]);

  // ── acceptCall ───────────────────────────────────────────────────────────────
  const acceptCall = useCallback(async () => {
    if (!incomingOffer || !callerId) return;
    setCallState("connected");
    setError("");
    startTimer();
    try {
      const stream = await getLocalStream();
      const pc = createPeerConnection(callerId);
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socketService.socket?.emit("acceptCall", { callerId, answer: pc.localDescription });
    } catch (err) {
      console.error("acceptCall error:", err);
      cleanup();
      setCallState("idle");
    }
  }, [incomingOffer, callerId, getLocalStream, createPeerConnection, cleanup, startTimer]);

  // ── rejectCall ───────────────────────────────────────────────────────────────
  const rejectCall = useCallback(() => {
    if (callerId) socketService.socket?.emit("rejectCall", { callerId });
    cleanup();
    setCallState("idle");
  }, [callerId, cleanup]);

  // ── toggles ──────────────────────────────────────────────────────────────────
  const toggleMute = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach((t) => { t.enabled = !t.enabled; });
    setIsMuted((p) => !p);
  };
  const toggleCamera = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getVideoTracks().forEach((t) => { t.enabled = !t.enabled; });
    setIsCameraOff((p) => !p);
  };

  // ── Socket listeners ─────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = socketService.socket;
    if (!socket) return;

    const onIncomingCall = ({ callerId: cId, callerName, callerAvatar, offer }) => {
      console.log("📹 Incoming call from", callerName);
      setIncomingOffer(offer);
      setCallerId(cId);
      setCallerInfo({ name: callerName, avatar: callerAvatar });
      setCallState("incoming");
    };

    const onCallAccepted = async ({ answer }) => {
      setCallState("connected");
      startTimer();
      try {
        if (peerConnRef.current) {
          await peerConnRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        }
      } catch (err) { console.error("setRemoteDescription error:", err); }
    };

    const onCallRejected = () => {
      cleanup();
      setError(`${remoteUser?.name || "User"} declined the call.`);
      setCallState("ended");
      setTimeout(() => { setCallState("idle"); setError(""); callDurationRef.current = 0; }, 3000);
    };

    const onCallEnded = async () => {
      const duration = callDurationRef.current;
      cleanup();
      setCallState("ended");
      // The remote user ended — we also save the message (they both need it in chat)
      await saveCallMessage(duration);
      setTimeout(() => { setCallState("idle"); callDurationRef.current = 0; }, 2500);
    };

    const onIceCandidate = async ({ candidate }) => {
      try {
        if (peerConnRef.current && candidate) {
          await peerConnRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) { console.error("addIceCandidate error:", err); }
    };

    socket.on("incomingCall",  onIncomingCall);
    socket.on("callAccepted",  onCallAccepted);
    socket.on("callRejected",  onCallRejected);
    socket.on("callEnded",     onCallEnded);
    socket.on("iceCandidate",  onIceCandidate);

    return () => {
      socket.off("incomingCall",  onIncomingCall);
      socket.off("callAccepted",  onCallAccepted);
      socket.off("callRejected",  onCallRejected);
      socket.off("callEnded",     onCallEnded);
      socket.off("iceCandidate",  onIceCandidate);
    };
  }, [remoteUser, cleanup, startTimer, saveCallMessage]);

  // Cleanup on unmount
  useEffect(() => () => cleanup(), [cleanup]);

  // ── Restore pending call from GlobalCallNotification (cross-page navigation) ─
  useEffect(() => {
    const raw = sessionStorage.getItem("pendingIncomingCall");
    if (!raw) return;
    try {
      const { callerId: cId, callerName, callerAvatar, offer } = JSON.parse(raw);
      sessionStorage.removeItem("pendingIncomingCall");
      if (cId && offer) {
        setIncomingOffer(offer);
        setCallerId(cId);
        setCallerInfo({ name: callerName, avatar: callerAvatar });
        setCallState("incoming");
        console.log("📲 Restored pending incoming call from", callerName);
      }
    } catch {
      sessionStorage.removeItem("pendingIncomingCall");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Re-attach streams whenever state changes (video elements re-mount) ───────
  useEffect(() => {
    // Local preview — applies to both "calling" and "connected" states
    if (
      (callState === "connected" || callState === "calling") &&
      localStreamRef.current &&
      localVideoRef.current
    ) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }

    // Remote stream — apply the buffered stream when the connected video renders
    if (callState === "connected" && remoteStreamRef.current && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  }, [callState]);

  // Callback refs — fire every time React (re)attaches a DOM node
  const setLocalVideoRef = (node) => {
    localVideoRef.current = node;
    if (node && localStreamRef.current) {
      node.srcObject = localStreamRef.current;
    }
  };

  const setRemoteVideoRef = (node) => {
    remoteVideoRef.current = node;
    if (node && remoteStreamRef.current) {
      node.srcObject = remoteStreamRef.current;
    }
  };

  // ═══════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════

  // ── IDLE ── small green button in chat header ─────────────────────────────
  if (callState === "idle") {
    return (
      <button
        onClick={startCall}
        title={`Video call ${remoteUser?.name}`}
        className="group flex items-center justify-center w-10 h-10 bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/30 rounded-xl transition-all duration-300 hover:scale-105"
      >
        <svg className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>
    );
  }

  // ── CALLING (outgoing, waiting) ────────────────────────────────────────────
  // First calling block — shows local preview + cancel button
  if (callState === "calling") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
        <div className="flex flex-col items-center gap-6">
          {/* Local video preview — use callback ref so stream is applied on mount */}
          <div className="relative w-32 h-44 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-gray-800">
            <video
              ref={setLocalVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${isCameraOff ? "opacity-0" : "opacity-100"}`}
            />
            {isCameraOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8M3 8v8a2 2 0 002 2h8M3 8l18 8" />
                </svg>
              </div>
            )}
          </div>
          <div className="text-center">
            <h3 className="text-white text-2xl font-bold mb-2">{remoteUser?.name}</h3>
            <p className="text-slate-400 animate-pulse">Calling...</p>
          </div>
          <button onClick={() => endCall()} className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 hover:scale-110 transition-all duration-200 mt-4">
            <svg className="w-7 h-7 text-white rotate-[135deg]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // ── INCOMING CALL ─────────────────────────────────────────────────────────
  if (callState === "incoming") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
        <div className="bg-gray-900 border border-gray-700/50 rounded-3xl p-10 flex flex-col items-center gap-6 shadow-2xl w-80">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-500/30 ring-4 ring-emerald-500/30 animate-pulse">
            <span className="text-3xl font-bold text-white">
              {callerInfo?.name?.[0]?.toUpperCase() || "?"}
            </span>
          </div>
          <div className="text-center">
            <p className="text-slate-400 text-sm mb-1">Incoming video call</p>
            <h3 className="text-white text-2xl font-bold">{callerInfo?.name || "Unknown"}</h3>
          </div>
          {/* Animated rings */}
          <div className="relative w-14 h-14 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500/40 animate-ping" />
            <div className="absolute inset-1 rounded-full border-2 border-emerald-500/60 animate-ping [animation-delay:300ms]" />
            <svg className="w-6 h-6 text-emerald-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          {/* Accept / Decline */}
          <div className="flex gap-8 mt-2">
            <button onClick={rejectCall} className="flex flex-col items-center gap-2 group">
              <div className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg shadow-red-500/30 group-hover:scale-110">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                </svg>
              </div>
              <span className="text-xs text-red-400">Decline</span>
            </button>
            <button onClick={acceptCall} className="flex flex-col items-center gap-2 group">
              <div className="w-16 h-16 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg shadow-emerald-500/30 group-hover:scale-110">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs text-emerald-400">Accept</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // (duplicate calling block removed — handled above)

  // ── CALL ENDED summary ─────────────────────────────────────────────────────
  if (callState === "ended") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center">
            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
            </svg>
          </div>
          <p className="text-white text-xl font-semibold">{error || "Call ended"}</p>
          {callDuration > 0 && (
            <p className="text-slate-400 text-sm">Duration: {formatDuration(callDuration)}</p>
          )}
          <p className="text-slate-500 text-sm animate-pulse mt-1">Closing...</p>
        </div>
      </div>
    );
  }

  // ── CONNECTED — full call UI ───────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Remote video — full screen (callback ref applies buffered stream immediately) */}
      <div className="relative flex-1 overflow-hidden bg-gray-900">
        <video ref={setRemoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />

        {/* Name + timer overlay */}
        <div className="absolute top-6 left-0 right-0 flex flex-col items-center pointer-events-none">
          <h3 className="text-white text-xl font-semibold drop-shadow-lg">
            {remoteUser?.name || callerInfo?.name}
          </h3>
          <p className="text-emerald-400 text-sm font-mono mt-1 drop-shadow-lg tracking-wider">
            {formatDuration(callDuration)}
          </p>
        </div>

        {/* Local video PiP (callback ref applies buffered stream immediately) */}
        <div className="absolute bottom-4 right-4 w-32 h-44 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-gray-800">
          <video
            ref={setLocalVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-opacity ${isCameraOff ? "opacity-0" : "opacity-100"}`}
          />
          {isCameraOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8M3 8v8a2 2 0 002 2h8M3 8l18 8" />
              </svg>
            </div>
          )}
          <div className="absolute bottom-1.5 left-0 right-0 flex justify-center">
            <span className="text-white text-[10px] font-medium bg-black/60 px-2 py-0.5 rounded-full">You</span>
          </div>
        </div>
      </div>

      {/* Control bar */}
      <div className="bg-gray-900/95 backdrop-blur-xl px-8 py-5 flex items-center justify-center gap-6 border-t border-white/10">
        {/* Mute */}
        <ControlBtn
          active={isMuted}
          onClick={toggleMute}
          label={isMuted ? "Unmute" : "Mute"}
          icon={isMuted
            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6a7 7 0 010 12M8.464 8.464a5 5 0 000 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          }
        />

        {/* End call — larger, red */}
        <button onClick={() => endCall()} className="flex flex-col items-center gap-1.5 group">
          <div className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 group-hover:scale-110 transition-all duration-200">
            <svg className="w-7 h-7 text-white rotate-[135deg]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <span className="text-xs text-red-400">End</span>
        </button>

        {/* Camera */}
        <ControlBtn
          active={isCameraOff}
          onClick={toggleCamera}
          label={isCameraOff ? "Cam off" : "Camera"}
          icon={isCameraOff
            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8M3 8v8a2 2 0 002 2h8M3 8l18 8" />
            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          }
        />
      </div>
    </div>
  );
}

// ── Reusable control button ───────────────────────────────────────────────────
function ControlBtn({ active, onClick, label, icon }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 group">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-110 ${
        active ? "bg-red-500/20 border border-red-500/40" : "bg-gray-700/80 border border-gray-600/40 hover:bg-gray-600/80"
      }`}>
        <svg className={`w-6 h-6 ${active ? "text-red-400" : "text-white"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icon}
        </svg>
      </div>
      <span className={`text-xs ${active ? "text-red-400" : "text-slate-400"}`}>{label}</span>
    </button>
  );
}
