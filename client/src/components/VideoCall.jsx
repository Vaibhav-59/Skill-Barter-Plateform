import { useState, useEffect, useRef, useCallback } from "react";
import socketService from "../utils/socket";
import api from "../utils/api";

// ─── WebRTC configuration ────────────────────────────────────────────────────
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun.stunprotocol.org:3478" },
  ],
};

/**
 * CALL STATES
 *  idle        – no call activity
 *  calling     – outgoing call ringing
 *  incoming    – remote user is calling
 *  connected   – live two-way video
 *  ended       – brief summary before closing
 */
export default function VideoCall({ currentUser, remoteUser, conversationId, onCallMessage }) {
  const [callState, setCallState]       = useState("idle");
  const [isMuted, setIsMuted]           = useState(false);
  const [isCameraOff, setIsCameraOff]   = useState(false);
  const [remoteCameraOff, setRemoteCameraOff] = useState(false);
  const [remoteMicOff, setRemoteMicOff]       = useState(false);
  const [incomingOffer, setIncomingOffer] = useState(null);
  const [callerId, setCallerId]         = useState(null);
  const [callerInfo, setCallerInfo]     = useState(null);
  const [error, setError]               = useState("");
  const [callDuration, setCallDuration] = useState(0);
  // Track arrival of remote stream so we can re-trigger attachment
  const [remoteStreamReady, setRemoteStreamReady] = useState(false);

  // ── Refs ────────────────────────────────────────────────────────────────────
  const localVideoRef   = useRef(null);
  const remoteVideoRef  = useRef(null);
  const peerConnRef     = useRef(null);
  const localStreamRef  = useRef(null);
  const remoteStreamRef = useRef(null);   // buffer remote stream until <video> mounts
  const callTimerRef    = useRef(null);
  const callDurationRef = useRef(0);
  const endCallRef      = useRef(null);   // always-fresh endCall for PC state-change cb

  // Keep callerId in a ref so socket callbacks always see the latest value
  const callerIdRef = useRef(null);
  useEffect(() => { callerIdRef.current = callerId; }, [callerId]);

  // ── Timer ───────────────────────────────────────────────────────────────────
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
    const m   = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  // ── attachStream ─ safely attach a stream to a <video> element ──────────────
  // Handles the case where the element may be null and retries after a short delay
  const attachStreamToVideo = useCallback((videoEl, stream) => {
    if (!videoEl || !stream) return;
    if (videoEl.srcObject === stream) return;          // already attached
    videoEl.srcObject = stream;
    
    const playPromise = videoEl.play();
    if (playPromise !== undefined) {
      playPromise.catch((e) => {
        // AbortError is common in React when the component unmounts quickly or rerenders 
        // before play() completes.
        if (e.name !== 'AbortError') {
          console.warn("video.play() blocked:", e.name);
        }
      });
    }
  }, []);

  // ── getLocalStream ──────────────────────────────────────────────────────────
  const getLocalStream = useCallback(async () => {
    // Reuse existing active stream — prevents "Device in use" on second call
    if (localStreamRef.current?.active) {
      return localStreamRef.current;
    }

    // Try video + audio
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 },
      });
      localStreamRef.current = stream;
      return stream;
    } catch (videoErr) {
      console.warn("Video+audio failed, trying audio-only:", videoErr.name);

      if (
        videoErr.name === "NotReadableError" ||
        videoErr.name === "NotFoundError" ||
        videoErr.name === "NotAllowedError"
      ) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: { echoCancellation: true, noiseSuppression: true },
          });

          // Add a silent dummy video track so SDP video section is preserved
          const canvas = document.createElement("canvas");
          canvas.width = 2; canvas.height = 2;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#000"; ctx.fillRect(0, 0, 2, 2);
          const dummyTrack = canvas.captureStream(1).getVideoTracks()[0];
          dummyTrack.enabled  = false;
          dummyTrack._isDummy = true;
          audioStream.addTrack(dummyTrack);

          localStreamRef.current = audioStream;
          setIsCameraOff(true);
          return audioStream;
        } catch (audioErr) {
          console.error("Audio fallback also failed:", audioErr);
          setError("Cannot access microphone. Please check browser permissions.");
          throw audioErr;
        }
      }

      setError("Camera/microphone access denied. Allow permissions and try again.");
      throw videoErr;
    }
  }, []);

  // ── createPeerConnection ─────────────────────────────────────────────────────
  const createPeerConnection = useCallback((targetUserId) => {
    // Close any existing connection first
    if (peerConnRef.current) {
      peerConnRef.current.onconnectionstatechange = null;
      peerConnRef.current.close();
      peerConnRef.current = null;
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pc._iceQueue = [];      // queued candidates arriving before remoteDescription
    pc._targetId = targetUserId;

    // ── ICE candidates ──
    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socketService.socket?.emit("iceCandidate", { targetUserId, candidate });
      }
    };

    pc.onicegatheringstatechange = () => {
      console.log("ICE gathering:", pc.iceGatheringState);
    };

    // ── Remote track ──
    // ontrack fires when the remote peer's media arrives.
    // We buffer to remoteStreamRef and then apply it to the video element.
    // The video element may not have mounted yet if we're still transitioning state.
    pc.ontrack = (event) => {
      console.log("🎥 ontrack fired — streams:", event.streams.length);
      const stream = event.streams[0];
      if (!stream) return;

      remoteStreamRef.current = stream;

      // Try to attach directly — works if video element is already mounted
      if (remoteVideoRef.current) {
        attachStreamToVideo(remoteVideoRef.current, stream);
      }

      // Trigger a React state update so the polling re-attachment effect re-fires.
      // This handles the race: stream arrives AFTER callState is already "connected".
      setRemoteStreamReady(true);
    };

    // ── Connection state ──
    // NOTE: "disconnected" is transient — ICE may recover automatically.
    // Only end the call on "failed" or "closed" which are terminal states.
    pc.onconnectionstatechange = () => {
      console.log("🔗 PC state:", pc.connectionState);
      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        endCallRef.current?.({ remote: true });
      }
    };

    peerConnRef.current = pc;
    return pc;
  }, [attachStreamToVideo]);

  // ── Helper: drain queued ICE candidates after remoteDescription is set ───────
  const drainIceQueue = useCallback(async (pc) => {
    if (!pc._iceQueue?.length) return;
    console.log(`Draining ${pc._iceQueue.length} queued ICE candidates…`);
    for (const c of pc._iceQueue) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(c));
      } catch (e) {
        console.warn("Queued ICE error:", e);
      }
    }
    pc._iceQueue = [];
  }, []);

  // ── saveCallMessage ──────────────────────────────────────────────────────────
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
      onCallMessage?.(response.data);
    } catch (err) {
      console.error("Failed to save call message:", err);
    }
  }, [conversationId, onCallMessage]);

  // ── cleanup ──────────────────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    stopTimer();

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    if (peerConnRef.current) {
      peerConnRef.current.onconnectionstatechange = null;
      peerConnRef.current.ontrack = null;
      peerConnRef.current.onicecandidate = null;
      peerConnRef.current.close();
      peerConnRef.current = null;
    }

    remoteStreamRef.current = null;

    if (localVideoRef.current)  { localVideoRef.current.srcObject  = null; }
    if (remoteVideoRef.current) { remoteVideoRef.current.srcObject = null; }

    setIncomingOffer(null);
    setCallerId(null);
    setCallerInfo(null);
    setIsMuted(false);
    setIsCameraOff(false);
    setRemoteCameraOff(false);
    setRemoteMicOff(false);
    setError("");
    setRemoteStreamReady(false);
  }, [stopTimer]);

  // ── endCall ──────────────────────────────────────────────────────────────────
  const endCall = useCallback(async (opts = {}) => {
    const targetId = callerIdRef.current || remoteUser?._id;
    if (targetId && !opts.remote) {
      socketService.socket?.emit("endCall", { targetUserId: targetId });
    }
    const duration = callDurationRef.current;
    cleanup();
    setCallState("ended");

    if (!opts.remote) {
      await saveCallMessage(duration);
    }

    setTimeout(() => {
      setCallState("idle");
      setCallDuration(0);
      callDurationRef.current = 0;
    }, 2500);
  }, [remoteUser, cleanup, saveCallMessage]);

  useEffect(() => { endCallRef.current = endCall; }, [endCall]);

  // ── startCall (Caller side) ──────────────────────────────────────────────────
  const startCall = useCallback(async () => {
    if (callState === "connected" || callState === "calling") {
      endCall();
      return;
    }
    if (!remoteUser) return;

    setError("");
    setCallState("calling");

    try {
      const stream = await getLocalStream();
      const pc     = createPeerConnection(remoteUser._id);

      // Add ALL local tracks to the peer connection BEFORE creating the offer
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pc.setLocalDescription(offer);

      console.log("📤 Sending offer to", remoteUser._id);
      socketService.socket?.emit("callUser", {
        targetUserId:  remoteUser._id,
        offer:         pc.localDescription,
        callerName:    currentUser?.name   || "User",
        callerAvatar:  currentUser?.avatar || null,
      });

      // Attach local preview
      if (localVideoRef.current) {
        attachStreamToVideo(localVideoRef.current, stream);
      }
    } catch (err) {
      console.error("startCall error:", err);
      cleanup();
      setCallState("idle");
    }
  }, [callState, remoteUser, currentUser, getLocalStream, createPeerConnection,
      attachStreamToVideo, cleanup, endCall]);

  // ── acceptCall (Callee side) ─────────────────────────────────────────────────
  // IMPORTANT: Do NOT set callState to "connected" until AFTER setRemoteDescription.
  // ontrack fires during setRemoteDescription, so the video element may not be mounted.
  // We set state to "connected" last to guarantee the video elements are in the DOM
  // when the callback ref fires and attaches the stream.
  const acceptCall = useCallback(async () => {
    if (!incomingOffer || !callerId) return;
    setError("");

    try {
      const stream = await getLocalStream();
      const pc     = createPeerConnection(callerId);

      // Add all local tracks BEFORE setting remote description
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Set remote description — this triggers renegotiation and ontrack on the caller
      await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));

      // Drain any ICE candidates that arrived before we set the remote description
      await drainIceQueue(pc);

      // Create and set the answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Send answer back to caller
      socketService.socket?.emit("acceptCall", {
        callerId,
        answer: pc.localDescription,
      });

      // Now transition to connected state.
      // The <video> refs (callback refs below) will immediately attach streams on mount.
      startTimer();
      setCallState("connected");
    } catch (err) {
      console.error("acceptCall error:", err);
      cleanup();
      setCallState("idle");
    }
  }, [incomingOffer, callerId, getLocalStream, createPeerConnection,
      drainIceQueue, cleanup, startTimer]);

  // ── rejectCall ───────────────────────────────────────────────────────────────
  const rejectCall = useCallback(() => {
    if (callerId) socketService.socket?.emit("rejectCall", { callerId });
    cleanup();
    setCallState("idle");
  }, [callerId, cleanup]);

  // ── toggleMute ───────────────────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;
    const audioTracks = localStreamRef.current.getAudioTracks();
    if (!audioTracks.length) return;

    const newEnabled = !audioTracks[0].enabled;   // derive from actual track state
    audioTracks.forEach((t) => { t.enabled = newEnabled; });
    setIsMuted(!newEnabled);                       // muted = track disabled
    
    // Notify remote user
    const targetUserId = callerIdRef.current || remoteUser?._id;
    if (targetUserId) {
      socketService.socket?.emit("toggleMedia", {
        targetUserId,
        type: "audio",
        isOff: !newEnabled,
      });
    }
  }, [remoteUser]);

  // ── toggleCamera ─────────────────────────────────────────────────────────────
  const toggleCamera = useCallback(async () => {
    if (!localStreamRef.current) return;

    const vidTracks = localStreamRef.current.getVideoTracks();
    const vidTrack  = vidTracks[0];

    // If the current track is a dummy placeholder, request a real camera stream
    if (vidTrack?._isDummy && isCameraOff) {
      try {
        const realStream   = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        });
        const realVidTrack = realStream.getVideoTracks()[0];

        // Swap track in the local stream
        localStreamRef.current.removeTrack(vidTrack);
        localStreamRef.current.addTrack(realVidTrack);
        vidTrack.stop();

        // Replace the sender on the RTCPeerConnection (no renegotiation needed)
        if (peerConnRef.current) {
          const sender = peerConnRef.current.getSenders().find(
            (s) => s.track && s.track.kind === "video"
          );
          if (sender) await sender.replaceTrack(realVidTrack);
        }

        setIsCameraOff(false);
        const targetUserId = callerIdRef.current || remoteUser?._id;
        if (targetUserId) {
          socketService.socket?.emit("toggleMedia", {
            targetUserId,
            type: "video",
            isOff: false,
          });
        }
        return;
      } catch (err) {
        console.error("Failed to get real video stream:", err);
        return;
      }
    }

    // Standard toggle — enable/disable the existing track
    const newEnabled = !vidTrack?.enabled;
    if (vidTracks) vidTracks.forEach((t) => { t.enabled = newEnabled; });
    setIsCameraOff(!newEnabled);

    // Notify remote user
    const targetUserId = callerIdRef.current || remoteUser?._id;
    if (targetUserId) {
      socketService.socket?.emit("toggleMedia", {
        targetUserId,
        type: "video",
        isOff: !newEnabled,
      });
    }
  }, [isCameraOff, remoteUser]);

  // ── Socket event listeners ───────────────────────────────────────────────────
  useEffect(() => {
    const socket = socketService.socket;
    if (!socket) return;

    // ── Incoming call ──
    const onIncomingCall = ({ callerId: cId, callerName, callerAvatar, offer }) => {
      console.log("📹 Incoming call from", callerName, "caller id:", cId);
      setIncomingOffer(offer);
      setCallerId(cId);
      setCallerInfo({ name: callerName, avatar: callerAvatar });
      setCallState("incoming");
    };

    // ── Call accepted (Caller receives the answer from Callee) ──
    const onCallAccepted = async ({ answer }) => {
      console.log("✅ Call accepted — setting remote description (answer)");
      const pc = peerConnRef.current;
      if (!pc) {
        console.warn("onCallAccepted: no peerConn");
        return;
      }

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log("Remote description set ✓");

        // Drain any ICE candidates queued before the answer arrived
        await drainIceQueue(pc);

        // Transition to connected state — the video elements will be
        // mounted by React immediately after this state change, and the
        // callback refs will attach the streams.
        startTimer();
        setCallState("connected");
      } catch (err) {
        console.error("setRemoteDescription (answer) error:", err);
      }
    };

    const onCallRejected = () => {
      cleanup();
      setError(`${remoteUser?.name || "User"} declined the call.`);
      setCallState("ended");
      setTimeout(() => {
        setCallState("idle");
        setError("");
        callDurationRef.current = 0;
      }, 3000);
    };

    const onCallEnded = async () => {
      const duration = callDurationRef.current;
      cleanup();
      setCallState("ended");
      await saveCallMessage(duration);
      setTimeout(() => {
        setCallState("idle");
        callDurationRef.current = 0;
      }, 2500);
    };

    // ── ICE candidate relay ──
    const onIceCandidate = async ({ candidate }) => {
      const pc = peerConnRef.current;
      if (!pc || !candidate) return;
      try {
        if (pc.remoteDescription && pc.remoteDescription.type) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          // Queue until setRemoteDescription has completed
          pc._iceQueue = pc._iceQueue || [];
          pc._iceQueue.push(candidate);
          console.log("Queued ICE candidate (remoteDescription not set yet)");
        }
      } catch (err) {
        console.warn("addIceCandidate error:", err);
      }
    };

    socket.on("incomingCall", onIncomingCall);
    socket.on("callAccepted", onCallAccepted);
    socket.on("callRejected", onCallRejected);
    socket.on("callEnded",    onCallEnded);
    socket.on("iceCandidate", onIceCandidate);
    socket.on("mediaToggled", ({ type, isOff }) => {
      console.log(`📡 Remote user toggled ${type} to ${isOff ? 'off' : 'on'}`);
      if (type === "video") setRemoteCameraOff(isOff);
      if (type === "audio") setRemoteMicOff(isOff);
    });

    return () => {
      socket.off("incomingCall", onIncomingCall);
      socket.off("callAccepted", onCallAccepted);
      socket.off("callRejected", onCallRejected);
      socket.off("callEnded",    onCallEnded);
      socket.off("iceCandidate", onIceCandidate);
      socket.off("mediaToggled");
    };
  }, [remoteUser, cleanup, startTimer, saveCallMessage, drainIceQueue]);

  // ── Restore pending call forwarded from GlobalCallNotification ───────────────
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

  // ── Re-attach streams whenever callState or remoteStreamReady changes ──────────
  // Uses a polling loop because the <video> element may not be in the DOM yet
  // at the exact moment callState becomes "connected" (React hasn't painted yet).
  // Also re-runs when remoteStreamReady flips true (stream arrived after connected).
  // We retry every 80ms for up to 4 seconds to guarantee both streams attach.
  useEffect(() => {
    if (callState !== "connected") return;

    let attempts = 0;
    const MAX_ATTEMPTS = 50; // 50 × 80ms = 4 seconds
    let intervalId;

    const tryAttach = () => {
      attempts++;
      let localDone  = false;
      let remoteDone = false;

      if (localStreamRef.current && localVideoRef.current) {
        attachStreamToVideo(localVideoRef.current, localStreamRef.current);
        localDone = true;
      }
      if (remoteStreamRef.current && remoteVideoRef.current) {
        attachStreamToVideo(remoteVideoRef.current, remoteStreamRef.current);
        remoteDone = true;
      }

      // Stop once both are done or we've hit the limit
      if ((localDone && remoteDone) || attempts >= MAX_ATTEMPTS) {
        if (!remoteDone) {
          console.warn("Remote stream never arrived after 4s — possible signaling issue");
        }
        return;
      }
      intervalId = setTimeout(tryAttach, 80);
    };

    intervalId = setTimeout(tryAttach, 50); // first attempt after 50ms
    return () => clearTimeout(intervalId);
  }, [callState, remoteStreamReady, attachStreamToVideo]);

  // Cleanup on unmount
  useEffect(() => () => cleanup(), [cleanup]);

  // ── Callback refs — fire every time React (re)attaches a DOM node ────────────
  // These are the most reliable way to attach a stream — the callback fires
  // immediately when the element is added to the DOM.

  const setLocalVideoRef = useCallback((node) => {
    localVideoRef.current = node;
    if (node && localStreamRef.current) {
      attachStreamToVideo(node, localStreamRef.current);
    }
  }, [attachStreamToVideo]);

    const setRemoteVideoRef = useCallback((node) => {
    remoteVideoRef.current = node;
    if (node && remoteStreamRef.current) {
      attachStreamToVideo(node, remoteStreamRef.current);
    }
  }, [attachStreamToVideo]);

  // ── Sync initial state when connected ─────────────────────────────
  useEffect(() => {
    if (callState === "connected") {
      const targetUserId = callerIdRef.current || remoteUser?._id;
      if (targetUserId) {
        socketService.socket?.emit("toggleMedia", {
          targetUserId,
          type: "video",
          isOff: isCameraOff,
        });
        socketService.socket?.emit("toggleMedia", {
          targetUserId,
          type: "audio",
          isOff: isMuted,
        });
      }
    }
  }, [callState, isCameraOff, isMuted, remoteUser]);

  // ═══════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════

  // ── IDLE ─────────────────────────────────────────────────────────────────────
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

  // ── CALLING (outgoing) ────────────────────────────────────────────────────────
  if (callState === "calling") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md">
        <div className="flex flex-col items-center gap-6">
          {/* Local preview */}
          <div className="relative w-36 h-48 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-gray-800">
            <video
              ref={setLocalVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-opacity ${isCameraOff ? "opacity-0" : "opacity-100"}`}
            />
            {isCameraOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <CameraOffIcon className="w-8 h-8 text-slate-500" />
              </div>
            )}
          </div>

          {/* Status */}
          <div className="text-center">
            <h3 className="text-white text-2xl font-bold mb-2">{remoteUser?.name}</h3>
            <div className="flex items-center justify-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
              <p className="text-slate-400 text-sm">Calling...</p>
            </div>
          </div>

          {/* Cancel */}
          <button
            onClick={() => endCall()}
            className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 hover:scale-110 transition-all duration-200 mt-4"
          >
            <PhoneOffIcon className="w-7 h-7 text-white" />
          </button>
        </div>
      </div>
    );
  }

  // ── INCOMING CALL ─────────────────────────────────────────────────────────────
  if (callState === "incoming") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
        <div className="bg-gray-900 border border-gray-700/50 rounded-3xl p-10 flex flex-col items-center gap-6 shadow-2xl w-80">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl ring-4 ring-emerald-500/30">
              <span className="text-3xl font-bold text-white">
                {callerInfo?.name?.[0]?.toUpperCase() || "?"}
              </span>
            </div>
            {/* Ripple rings */}
            <div className="absolute inset-0 rounded-full border-2 border-emerald-400/40 animate-ping" />
            <div className="absolute -inset-2 rounded-full border-2 border-emerald-400/20 animate-ping [animation-delay:300ms]" />
          </div>

          <div className="text-center">
            <p className="text-slate-400 text-sm mb-1">Incoming video call</p>
            <h3 className="text-white text-2xl font-bold">{callerInfo?.name || "Unknown"}</h3>
          </div>

          {/* Accept / Decline */}
          <div className="flex gap-10 mt-2">
            <button onClick={rejectCall} className="flex flex-col items-center gap-2 group">
              <div className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg shadow-red-500/30 group-hover:scale-110">
                <PhoneOffIcon className="w-7 h-7 text-white" />
              </div>
              <span className="text-xs text-red-400">Decline</span>
            </button>

            <button onClick={acceptCall} className="flex flex-col items-center gap-2 group">
              <div className="w-16 h-16 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg shadow-emerald-500/30 group-hover:scale-110">
                <VideoIcon className="w-7 h-7 text-white" />
              </div>
              <span className="text-xs text-emerald-400">Accept</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── CALL ENDED ────────────────────────────────────────────────────────────────
  if (callState === "ended") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center">
            <PhoneOffIcon className="w-10 h-10 text-slate-400" />
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

  // ── CONNECTED — full-screen video call UI ──────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Remote video — full screen */}
      <div className="relative flex-1 overflow-hidden bg-gray-900">
        <video
          ref={setRemoteVideoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover transition-opacity duration-300 ${remoteCameraOff ? "opacity-0" : "opacity-100"}`}
        />

        {/* Remote Camera Off Placeholder */}
        {remoteCameraOff && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl mb-4">
              <span className="text-3xl font-bold text-white">
                {(remoteUser?.name || callerInfo?.name || "?")[0].toUpperCase()}
              </span>
            </div>
            <p className="text-white text-sm font-medium bg-black/50 px-4 py-1.5 rounded-full">
              Camera Off
            </p>
          </div>
        )}

        {/* Remote Mic Off Indicator */}
        {remoteMicOff && (
          <div className="absolute top-20 right-6 bg-red-500/80 p-2 rounded-full z-20 shadow-lg backdrop-blur-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          </div>
        )}

        {/* Fallback placeholder shown while stream is connecting */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div
            id="remote-placeholder"
            className="flex flex-col items-center gap-3 transition-opacity duration-500"
            style={{ opacity: remoteStreamRef.current && !remoteCameraOff ? 0 : (remoteCameraOff ? 0 : 1) }}
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl">
              <span className="text-3xl font-bold text-white">
                {(remoteUser?.name || callerInfo?.name || "?")[0].toUpperCase()}
              </span>
            </div>
            <p className="text-white text-sm font-medium bg-black/50 px-4 py-1.5 rounded-full">
              Connecting video...
            </p>
          </div>
        </div>

        {/* Name + timer overlay */}
        <div className="absolute top-6 left-0 right-0 flex flex-col items-center pointer-events-none z-20">
          <div className="bg-black/40 backdrop-blur-sm rounded-full px-5 py-2 flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${remoteStreamRef.current ? "bg-emerald-400 animate-none" : "bg-yellow-400 animate-pulse"}`} />
            <h3 className="text-white text-base font-semibold">
              {remoteUser?.name || callerInfo?.name}
            </h3>
            <span className={`text-sm font-mono tracking-wider ${remoteStreamRef.current ? "text-emerald-400" : "text-yellow-400"}`}>
              {remoteStreamRef.current ? formatDuration(callDuration) : "Connecting..."}
            </span>
          </div>
        </div>

        {/* Local video PiP */}
        <div
          className="absolute bottom-28 right-6 w-32 h-44 sm:w-36 sm:h-48 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-gray-800 cursor-pointer hover:scale-105 transition-transform duration-200 z-30"
          title="Your camera"
        >
          <video
            ref={setLocalVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-opacity duration-300 ${isCameraOff ? "opacity-0" : "opacity-100"}`}
          />
          {isCameraOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <CameraOffIcon className="w-8 h-8 text-slate-500" />
            </div>
          )}
          <div className="absolute bottom-1.5 left-0 right-0 flex justify-center">
            <span className="text-white text-[10px] font-medium bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
              You
            </span>
          </div>
        </div>
      </div>

      {/* Control bar (Floating pill like WhatsApp) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-gray-900/70 backdrop-blur-xl px-8 py-4 flex items-center justify-center gap-8 rounded-full border border-white/10 shadow-2xl z-40">
        {/* Mute toggle */}
        <ControlBtn
          active={isMuted}
          onClick={toggleMute}
          label={isMuted ? "Unmute" : "Mute"}
          icon={
            isMuted ? (
              // Crossed-out speaker = muted
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            ) : (
              // Waved speaker = unmuted
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072M12 6a7 7 0 010 12M8.464 8.464a5 5 0 000 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            )
          }
        />

        {/* End call */}
        <button onClick={() => endCall()} className="flex flex-col items-center gap-1.5 group">
          <div className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/40 group-hover:scale-110 transition-all duration-300">
            <PhoneOffIcon className="w-8 h-8 text-white" />
          </div>
          <span className="text-xs text-red-400 font-medium tracking-wide">End</span>
        </button>

        {/* Camera toggle */}
        <ControlBtn
          active={isCameraOff}
          onClick={toggleCamera}
          label={isCameraOff ? "Cam off" : "Camera"}
          icon={
            isCameraOff ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8M3 8v8a2 2 0 002 2h8M3 8l18 8" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            )
          }
        />
      </div>
    </div>
  );
}

// ── Reusable icon components ──────────────────────────────────────────────────
function PhoneOffIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
    </svg>
  );
}

function VideoIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function CameraOffIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8M3 8v8a2 2 0 002 2h8M3 8l18 8" />
    </svg>
  );
}

// ── Reusable control button ───────────────────────────────────────────────────
function ControlBtn({ active, onClick, label, icon }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 group">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-110 ${
        active
          ? "bg-red-500/20 border border-red-500/40"
          : "bg-gray-700/80 border border-gray-600/40 hover:bg-gray-600/80"
      }`}>
        <svg className={`w-6 h-6 ${active ? "text-red-400" : "text-white"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icon}
        </svg>
      </div>
      <span className={`text-xs ${active ? "text-red-400" : "text-slate-400"}`}>{label}</span>
    </button>
  );
}
