import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socketService from "../utils/socket";
import VideoGrid from "../components/meeting/VideoGrid";
import MeetingControls from "../components/meeting/MeetingControls";
import MeetingChat from "../components/meeting/MeetingChat";
import ParticipantsPanel from "../components/meeting/ParticipantsPanel";

const ICE_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export default function MeetingRoom() {
  const { meetingId: urlMeetingId } = useParams();
  const navigate = useNavigate();

  // Read user info once — stable reference
  const currentUser = useRef(JSON.parse(localStorage.getItem("user") || "{}")).current;
  const displayName = currentUser?.name || "You";

  const [meetingId]           = useState(urlMeetingId || "");
  const [nameInput, setNameInput] = useState(displayName);
  const [error, setError]     = useState("");
  const [copied, setCopied]   = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen]             = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isHost, setIsHost]           = useState(false);
  const [peers, setPeers]     = useState(new Map());
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [hasJoined, setHasJoined] = useState(false);

  // ── Refs (stable, not re-rendered) ─────────────────────────────────────────
  const localStreamRef    = useRef(null);
  const screenStreamRef   = useRef(null);
  const peerConnsRef      = useRef(new Map());
  const mediaRecorderRef  = useRef(null);
  const recordedChunksRef = useRef([]);
  const removePeerRef     = useRef(null);
  const stopRecordingRef  = useRef(null);

  /**
   * Mutable ref mirrors — give stable callbacks access to latest state
   * WITHOUT adding those state values to useCallback / useEffect deps
   * (which would cause the signaling effect to re-run on every toggle).
   */
  const isMutedRef        = useRef(isMuted);
  const isCamOffRef       = useRef(isCamOff);
  const isScreenSharingRef = useRef(isScreenSharing);
  const isRecordingRef    = useRef(isRecording);
  const meetingIdRef      = useRef(meetingId);
  const nameInputRef      = useRef(nameInput);

  useEffect(() => { isMutedRef.current        = isMuted;        }, [isMuted]);
  useEffect(() => { isCamOffRef.current        = isCamOff;       }, [isCamOff]);
  useEffect(() => { isScreenSharingRef.current = isScreenSharing; }, [isScreenSharing]);
  useEffect(() => { isRecordingRef.current     = isRecording;    }, [isRecording]);
  useEffect(() => { nameInputRef.current       = nameInput;      }, [nameInput]);

  const socket = socketService.socket;

  // ── Get local media ────────────────────────────────────────────────────────
  const getLocalStream = useCallback(async () => {
    if (localStreamRef.current?.active) return localStreamRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch {
      try {
        const audioOnly = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        localStreamRef.current = audioOnly;
        setLocalStream(audioOnly);
        setIsCamOff(true);
        return audioOnly;
      } catch (err) {
        setError("Cannot access camera/microphone. Check browser permissions.");
        throw err;
      }
    }
  }, []);

  // ── Peer connection factory ─────────────────────────────────────────────────
  const getOrCreatePC = useCallback((remoteSocketId) => {
    if (peerConnsRef.current.has(remoteSocketId)) {
      return peerConnsRef.current.get(remoteSocketId);
    }

    const pc = new RTCPeerConnection(ICE_CONFIG);
    pc.iceQueue = [];

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socket?.emit("meetingIceCandidate", { targetSocketId: remoteSocketId, candidate });
      }
    };

    pc.ontrack = ({ streams }) => {
      const stream = streams[0];
      if (!stream) return;
      setPeers((prev) => {
        const next  = new Map(prev);
        const entry = next.get(remoteSocketId);
        if (entry) next.set(remoteSocketId, { ...entry, stream });
        return next;
      });
    };

    pc.onconnectionstatechange = () => {
      if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
        removePeerRef.current?.(remoteSocketId);
      }
    };

    pc.onnegotiationneeded = async () => {
      try {
        if (pc.signalingState !== "stable") return;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket?.emit("meetingOffer", { targetSocketId: remoteSocketId, offer });
      } catch (err) {
        console.error("Negotiation error:", err);
      }
    };

    // Attach all current local tracks to this new PC
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) =>
        pc.addTrack(t, localStreamRef.current)
      );
    }

    peerConnsRef.current.set(remoteSocketId, pc);
    return pc;
  }, [socket]);

  // ── Remove peer ─────────────────────────────────────────────────────────────
  const removePeer = useCallback((remoteSocketId) => {
    const pc = peerConnsRef.current.get(remoteSocketId);
    if (pc) {
      pc.onconnectionstatechange = null;
      pc.close();
      peerConnsRef.current.delete(remoteSocketId);
    }
    setPeers((prev) => {
      const next = new Map(prev);
      next.delete(remoteSocketId);
      return next;
    });
  }, []);

  removePeerRef.current = removePeer;

  // ── Join meeting ────────────────────────────────────────────────────────────
  const joinMeeting = useCallback(async () => {
    if (!meetingId)        { setError("No meeting ID"); return; }
    if (!nameInput.trim()) { setError("Please enter your name."); return; }
    try { await getLocalStream(); } catch { return; }
    setHasJoined(true);
  }, [meetingId, nameInput, getLocalStream]);

  // Auto-join when name is pre-filled from localStorage
  useEffect(() => {
    if (urlMeetingId && nameInput.trim() && !hasJoined) {
      joinMeeting();
    }
  }, [urlMeetingId, nameInput, hasJoined, joinMeeting]);

  // ── Leave ───────────────────────────────────────────────────────────────────
  const leaveMeeting = useCallback(() => {
    if (isRecordingRef.current) stopRecordingRef.current?.();
    socket?.emit("leaveMeeting", { meetingId: meetingIdRef.current });

    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current  = null;
    screenStreamRef.current = null;
    setLocalStream(null);
    setScreenStream(null);

    peerConnsRef.current.forEach((pc) => pc.close());
    peerConnsRef.current.clear();
    setPeers(new Map());
    navigate("/meeting");
  }, [socket, navigate]);

  // ── Toggle mute ─────────────────────────────────────────────────────────────
  /**
   * FIX: Read ground-truth from the actual track's enabled state,
   * not from the stale `isMuted` state variable.
   * This makes mic toggle reliable regardless of React render timing.
   */
  const toggleMute = useCallback(() => {
    const audioTracks = localStreamRef.current?.getAudioTracks() ?? [];
    if (audioTracks.length === 0) return;

    // Flip based on the TRACK's actual current state (source of truth)
    const currentlyEnabled = audioTracks[0].enabled;
    const newEnabled = !currentlyEnabled;
    audioTracks.forEach((t) => { t.enabled = newEnabled; });

    const newIsMuted = !newEnabled;
    setIsMuted(newIsMuted);
    socket?.emit("toggleMedia", {
      meetingId: meetingIdRef.current,
      type: "audio",
      isOff: newIsMuted,
    });
  }, [socket]);

  // ── Toggle camera ───────────────────────────────────────────────────────────
  /**
   * FIX: Use replaceTrack() instead of addTrack() when turning cam back on.
   *
   * addTrack() triggers onnegotiationneeded → new offer/answer cycle →
   * the remote side fires onOffer again → setPeers adds a duplicate entry
   * → participant count jumps to 2 (same user appears twice).
   *
   * replaceTrack() swaps the track inline with NO renegotiation.
   */
  const toggleCam = useCallback(async () => {
    const videoTracks = localStreamRef.current?.getVideoTracks() ?? [];

    if (videoTracks.length === 0) {
      // Camera was never granted — acquire a new track
      try {
        const vidStream   = await navigator.mediaDevices.getUserMedia({ video: true });
        const newVidTrack = vidStream.getVideoTracks()[0];
        localStreamRef.current.addTrack(newVidTrack);

        peerConnsRef.current.forEach((pc) => {
          // If a video sender already exists (track may be null), replace it
          const sender = pc.getSenders().find(
            (s) => s.track?.kind === "video" || s.track === null
          );
          if (sender) {
            sender.replaceTrack(newVidTrack); // no renegotiation
          } else {
            pc.addTrack(newVidTrack, localStreamRef.current); // first time only
          }
        });

        setIsCamOff(false);
        setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
        socket?.emit("toggleMedia", {
          meetingId: meetingIdRef.current,
          type: "video",
          isOff: false,
        });
      } catch (err) {
        console.error("Failed to enable camera:", err);
      }
      return;
    }

    // Track exists — just flip enabled (no signaling, no renegotiation)
    const currentlyEnabled = videoTracks[0].enabled;
    const newEnabled = !currentlyEnabled;
    videoTracks.forEach((t) => { t.enabled = newEnabled; });

    const newIsCamOff = !newEnabled;
    setIsCamOff(newIsCamOff);
    // Refresh state object so VideoCard re-renders
    setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
    socket?.emit("toggleMedia", {
      meetingId: meetingIdRef.current,
      type: "video",
      isOff: newIsCamOff,
    });
  }, [socket]);

  // ── Toggle screen share ─────────────────────────────────────────────────────
  const toggleScreenShare = useCallback(async () => {
    // ── STOP ──────────────────────────────────────────────────────────────────
    if (isScreenSharingRef.current) {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      setScreenStream(null);
      setIsScreenSharing(false);

      // Restore cam track (or null if cam was off)
      const camTrack = localStreamRef.current?.getVideoTracks()[0] ?? null;
      peerConnsRef.current.forEach((pc) => {
        const sender = pc.getSenders().find(
          (s) => s.track?.kind === "video" || s.track === null
        );
        if (sender) {
          sender.replaceTrack(
            camTrack && !isCamOffRef.current ? camTrack : null
          );
        }
      });
      socket?.emit("toggleMedia", {
        meetingId: meetingIdRef.current,
        type: "screen",
        isOff: true,
      });
      return;
    }

    // ── START ─────────────────────────────────────────────────────────────────
    try {
      const sStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      screenStreamRef.current = sStream;
      setScreenStream(sStream);
      setIsScreenSharing(true);

      const screenTrack = sStream.getVideoTracks()[0];

      peerConnsRef.current.forEach((pc) => {
        const sender = pc.getSenders().find(
          (s) => s.track?.kind === "video" || s.track === null
        );
        if (sender) {
          sender.replaceTrack(screenTrack); // no renegotiation
        } else {
          pc.addTrack(screenTrack, sStream); // no prior video sender
        }
      });

      socket?.emit("toggleMedia", {
        meetingId: meetingIdRef.current,
        type: "screen",
        isOff: false,
      });

      // Handle browser's "Stop sharing" button
      screenTrack.onended = () => {
        screenStreamRef.current = null;
        setScreenStream(null);
        setIsScreenSharing(false);
        const camTrack = localStreamRef.current?.getVideoTracks()[0] ?? null;
        peerConnsRef.current.forEach((pc) => {
          const s = pc.getSenders().find(
            (s) => s.track?.kind === "video" || s.track === null
          );
          if (s) s.replaceTrack(camTrack && !isCamOffRef.current ? camTrack : null);
        });
        socket?.emit("toggleMedia", {
          meetingId: meetingIdRef.current,
          type: "screen",
          isOff: true,
        });
      };
    } catch (err) {
      if (err.name !== "NotAllowedError") setError("Screen share failed.");
    }
  }, [socket]);

  // ── Recording ───────────────────────────────────────────────────────────────
  /**
   * FIX: Recording captures a canvas stream — it does NOT touch localStreamRef
   * or any media tracks at all. Camera and mic remain unaffected.
   * We use localStreamRef.current directly (not the stale `localStream` state)
   * to avoid closure issues.
   */
  const startRecording = useCallback(() => {
    const canvas = document.createElement("canvas");
    const ctx    = canvas.getContext("2d");
    canvas.width = 1280;
    canvas.height = 720;

    let rafId = null;
    const drawFrame = () => {
      ctx.fillStyle = "#111827";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Draw current local video frame
      const videoEls = document.querySelectorAll("video");
      videoEls.forEach((v, i) => {
        if (v && !v.paused && !v.ended) {
          const cols = Math.ceil(Math.sqrt(videoEls.length));
          const rows = Math.ceil(videoEls.length / cols);
          const w    = canvas.width / cols;
          const h    = canvas.height / rows;
          const col  = i % cols;
          const row  = Math.floor(i / cols);
          ctx.drawImage(v, col * w, row * h, w, h);
        }
      });
      rafId = requestAnimationFrame(drawFrame);
    };

    const canvasStream  = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(canvasStream, {
      mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm",
    });

    recordedChunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      cancelAnimationFrame(rafId);
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `meeting-${meetingIdRef.current}-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      recordedChunksRef.current = [];
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(1000);
    setIsRecording(true);
    rafId = requestAnimationFrame(drawFrame);
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecordingRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      setIsRecording(false);
    }
  }, []);

  stopRecordingRef.current = stopRecording;

  // ── Copy meeting link ───────────────────────────────────────────────────────
  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(
      `${window.location.origin}/meeting/${meetingIdRef.current}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, []);

  // ── Socket signaling ────────────────────────────────────────────────────────
  /**
   * CRITICAL FIX — dependency array:
   *
   * The old code had [socket, hasJoined, meetingId, getOrCreatePC, removePeer, isCamOff, isMuted].
   * Because `isCamOff` and `isMuted` were deps, the entire effect re-ran on every
   * toggle → re-emitted joinMeeting → server added the same socket again →
   * existingParticipants list contained YOURSELF → duplicate peer + count = 2.
   *
   * Fix: Remove isCamOff / isMuted from deps entirely. Use refs to read
   * their current values in the once-per-session setTimeout below.
   */
  useEffect(() => {
    if (!socket || !hasJoined || !meetingId) return;

    const flushIceQueue = async (pc) => {
      for (const c of (pc.iceQueue ?? [])) {
        try { await pc.addIceCandidate(new RTCIceCandidate(c)); }
        catch (e) { console.error("ICE queue error:", e); }
      }
      pc.iceQueue = [];
    };

    // ── Incoming: list of everyone already in the room ─────────────────────
    const onExistingParticipants = async ({ existingParticipants }) => {
      if (existingParticipants.length === 0) {
        setIsHost(true);
      }
      for (const p of existingParticipants) {
        setPeers((prev) => {
          const next = new Map(prev);
          if (!next.has(p.socketId)) next.set(p.socketId, { ...p, stream: null });
          return next;
        });
        const pc = getOrCreatePC(p.socketId);
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("meetingOffer", { targetSocketId: p.socketId, offer });
        } catch (err) { console.error("Offer error:", err); }
      }
    };

    // ── Incoming: someone new joined after me ──────────────────────────────
    const onUserJoined = (p) => {
      setPeers((prev) => {
        const next = new Map(prev);
        if (!next.has(p.socketId)) next.set(p.socketId, { ...p, stream: null });
        return next;
      });
    };

    // ── Incoming: offer from a peer ────────────────────────────────────────
    const onOffer = async ({ fromSocketId, fromUserId, fromUserName, offer }) => {
      setPeers((prev) => {
        const next = new Map(prev);
        if (!next.has(fromSocketId)) {
          next.set(fromSocketId, {
            socketId: fromSocketId,
            userId:   fromUserId,
            userName: fromUserName,
            stream:   null,
          });
        }
        return next;
      });

      const pc = getOrCreatePC(fromSocketId);
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        await flushIceQueue(pc);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("meetingAnswer", { targetSocketId: fromSocketId, answer });
      } catch (err) { console.error("Answer error:", err); }
    };

    // ── Incoming: answer from a peer ───────────────────────────────────────
    const onAnswer = async ({ fromSocketId, answer }) => {
      const pc = peerConnsRef.current.get(fromSocketId);
      if (!pc) return;
      try {
        if (pc.signalingState === "have-local-offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          await flushIceQueue(pc);
        }
      } catch (err) { console.error("setRemoteDesc error:", err); }
    };

    // ── Incoming: ICE candidate ────────────────────────────────────────────
    const onIce = async ({ fromSocketId, candidate }) => {
      const pc = peerConnsRef.current.get(fromSocketId);
      if (!pc || !candidate) return;
      try {
        if (pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          pc.iceQueue = pc.iceQueue || [];
          pc.iceQueue.push(candidate);
        }
      } catch (err) { console.error("ICE error:", err); }
    };

    // ── Incoming: someone left ─────────────────────────────────────────────
    const onUserLeft = ({ socketId }) => removePeer(socketId);

    // ── Incoming: remote peer toggled their media ──────────────────────────
    const onPeerMediaToggled = ({ socketId, type, isOff }) => {
      setPeers((prev) => {
        const next    = new Map(prev);
        const p       = next.get(socketId);
        if (!p) return next;
        const updated = { ...p };
        if (type === "video")  updated.isCamOff        = isOff;
        if (type === "audio")  updated.isMuted         = isOff;
        if (type === "screen") updated.isScreenSharing = !isOff;
        next.set(socketId, updated);
        return next;
      });
    };

    // Register all listeners
    socket.on("existingParticipants", onExistingParticipants);
    socket.on("userJoined",           onUserJoined);
    socket.on("meetingOffer",         onOffer);
    socket.on("meetingAnswer",        onAnswer);
    socket.on("meetingIceCandidate",  onIce);
    socket.on("userLeft",             onUserLeft);
    socket.on("peerMediaToggled",     onPeerMediaToggled);

    // ── Announce join — send name so server can broadcast it to others ─────
    socket.emit("joinMeeting", {
      meetingId,
      userName: nameInputRef.current || displayName,
    });

    // Broadcast initial media state ONCE using refs (not stale state values)
    const mediaTimer = setTimeout(() => {
      socket.emit("toggleMedia", {
        meetingId,
        type: "video",
        isOff: isCamOffRef.current,
      });
      socket.emit("toggleMedia", {
        meetingId,
        type: "audio",
        isOff: isMutedRef.current,
      });
    }, 600);

    return () => {
      clearTimeout(mediaTimer);
      socket.off("existingParticipants", onExistingParticipants);
      socket.off("userJoined",           onUserJoined);
      socket.off("meetingOffer",         onOffer);
      socket.off("meetingAnswer",        onAnswer);
      socket.off("meetingIceCandidate",  onIce);
      socket.off("userLeft",             onUserLeft);
      socket.off("peerMediaToggled",     onPeerMediaToggled);
    };
    // ⚠️  isCamOff and isMuted are intentionally NOT in this dep array.
    //     They are read via refs inside the setTimeout above.
    //     Adding them here would re-emit joinMeeting on every toggle.
  }, [socket, hasJoined, meetingId, getOrCreatePC, removePeer, displayName]); // eslint-disable-line

  // ── Cleanup on unmount ──────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopRecordingRef.current?.();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      peerConnsRef.current.forEach((pc) => pc.close());
    };
  }, []);

  // ══════════════════════════════════════════════════════════════════════════
  //  PRE-JOIN LOBBY
  // ══════════════════════════════════════════════════════════════════════════
  if (!hasJoined) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-950 to-slate-950 flex items-center justify-center p-6 overflow-auto">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/8 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none" />

        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 rounded-3xl shadow-2xl shadow-emerald-500/30 mb-5 relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 blur-xl opacity-40 animate-pulse" />
              <svg className="w-10 h-10 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-slate-200 bg-clip-text text-transparent mb-2">
              Join Meeting
            </h1>
            <p className="text-slate-400 text-sm">Ready to join your session?</p>
          </div>

          <div className="bg-gray-900/40 backdrop-blur-2xl border border-gray-700/40 rounded-3xl p-8 shadow-2xl">
            <div className="mb-5">
              <label className="block text-slate-300 text-sm font-medium mb-2">Meeting ID</label>
              <div className="px-4 py-3 bg-gray-800/60 border border-gray-700/40 rounded-xl text-white font-mono text-sm tracking-widest">
                {meetingId}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-slate-300 text-sm font-medium mb-2">Your Name</label>
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && joinMeeting()}
                placeholder="Enter your name..."
                autoFocus
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700/40 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all duration-300 text-sm"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              onClick={joinMeeting}
              disabled={!nameInput.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 hover:from-emerald-400 hover:via-green-400 hover:to-teal-500 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/25 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Join Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  MEETING ROOM
  // ══════════════════════════════════════════════════════════════════════════
  const remotePeersArray = Array.from(peers.values());
  const participantList  = [
    {
      id: "local",
      name: nameInputRef.current || displayName,
      isLocal: true,
      isMuted,
      isCamOff,
      isHost,
    },
    ...remotePeersArray.map((p) => ({
      ...p,
      name: p.userName, // Fix missing name property for remote peers!
      isLocal: false,
    })),
  ];

  return (
    <div
      className="fixed inset-0 bg-gray-950 overflow-hidden"
      style={{ display: "flex", flexDirection: "column", fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 bg-gray-950/90 backdrop-blur-xl border-b border-white/8 z-20 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h2 className="text-white font-semibold text-sm leading-tight">SkillBarter Meet</h2>
            <p className="text-slate-500 text-xs font-mono truncate">{meetingId}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {isRecording && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/15 border border-red-500/30 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-400 text-xs font-semibold">REC</span>
            </div>
          )}
          {isScreenSharing && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/15 border border-blue-500/30 rounded-full">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-blue-400 text-xs font-semibold">Sharing</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 rounded-full">
            <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="4" />
            </svg>
            <span className="text-emerald-400 text-xs font-semibold">
              {1 + remotePeersArray.length}
            </span>
          </div>
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/60 hover:bg-emerald-500/20 border border-gray-700/40 hover:border-emerald-500/40 rounded-xl text-slate-300 hover:text-emerald-400 transition-all duration-200 text-xs font-medium"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      </div>

      {/* ── Main area ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        <div className="flex-1 min-w-0 min-h-0 overflow-hidden">
          <VideoGrid
            localStream={localStream}
            localName={nameInput || displayName}
            isMuted={isMuted}
            isCamOff={isCamOff}
            isScreenSharing={isScreenSharing}
            screenStream={screenStream}
            remoteParticipants={remotePeersArray}
          />
        </div>

        {isChatOpen && (
          <MeetingChat
            socket={socket}
            meetingId={meetingId}
            userName={nameInput || displayName}
            onClose={() => setIsChatOpen(false)}
          />
        )}

        {isParticipantsOpen && (
          <ParticipantsPanel
            participants={participantList}
            onClose={() => setIsParticipantsOpen(false)}
          />
        )}
      </div>

      {/* ── Controls ──────────────────────────────────────────────────────── */}
      <MeetingControls
        isMuted={isMuted}
        isCamOff={isCamOff}
        isScreenSharing={isScreenSharing}
        isChatOpen={isChatOpen}
        isParticipantsOpen={isParticipantsOpen}
        isRecording={isRecording}
        participantCount={1 + remotePeersArray.length}
        meetingId={meetingId}
        onToggleMute={toggleMute}
        onToggleCam={toggleCam}
        onToggleScreen={toggleScreenShare}
        onToggleChat={() => { setIsChatOpen((p) => !p); setIsParticipantsOpen(false); }}
        onToggleParticipants={() => { setIsParticipantsOpen((p) => !p); setIsChatOpen(false); }}
        onToggleRecording={() => (isRecordingRef.current ? stopRecording() : startRecording())}
        onLeave={leaveMeeting}
      />
    </div>
  );
}
