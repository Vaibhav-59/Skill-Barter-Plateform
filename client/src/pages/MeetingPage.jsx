import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socketService from "../utils/socket";
import VideoGrid from "../components/meeting/VideoGrid";
import MeetingControls from "../components/meeting/MeetingControls";
import MeetingChat from "../components/meeting/MeetingChat";

// ── Tiny meeting ID generator (no extra dependency) ───────────────────────────
const generateMeetingId = () =>
  Math.random().toString(36).slice(2, 7) + "-" +
  Math.random().toString(36).slice(2, 7);

// ── ICE configuration ──────────────────────────────────────────────────────────
const ICE_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
//  MeetingPage
// ─────────────────────────────────────────────────────────────────────────────
export default function MeetingPage() {
  const { meetingId: urlMeetingId } = useParams(); // set when opened from a shared link
  const navigate = useNavigate();

  // ── UI state ──────────────────────────────────────────────────────────────
  const [phase, setPhase]         = useState(urlMeetingId ? "lobby" : "home"); // home | lobby | meeting
  const [meetingIdInput, setMeetingIdInput] = useState(urlMeetingId || "");
  const [nameInput, setNameInput] = useState(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.name || "";
  });
  const [error, setError]         = useState("");
  const [copied, setCopied]       = useState(false);

  // ── Meeting state ──────────────────────────────────────────────────────────
  const [isMuted, setIsMuted]           = useState(false);
  const [isCamOff, setIsCamOff]         = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen]     = useState(false);
  const [activeMeetingId, setActiveMeetingId] = useState("");

  // peers: Map<socketId, { socketId, userId, userName, stream, pc }>
  const [peers, setPeers]               = useState(new Map());

  // ── Media refs ────────────────────────────────────────────────────────────
  const localStreamRef  = useRef(null);
  const screenStreamRef = useRef(null);
  const [localStream, setLocalStream]   = useState(null);
  const [screenStream, setScreenStream] = useState(null);

  // peerConns: Map<socketId, RTCPeerConnection>
  const peerConnsRef = useRef(new Map());
  const activeMeetingIdRef = useRef("");

  const socket = socketService.socket;
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  // ── Utility: get or create a PeerConnection for a remote socket ────────────
  const getOrCreatePC = useCallback((remoteSocketId) => {
    if (peerConnsRef.current.has(remoteSocketId)) {
      return peerConnsRef.current.get(remoteSocketId);
    }

    const pc = new RTCPeerConnection(ICE_CONFIG);

    // Forward ICE candidates
    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socket?.emit("meetingIceCandidate", { targetSocketId: remoteSocketId, candidate });
      }
    };

    // Receive remote stream tracks
    pc.ontrack = ({ streams }) => {
      const stream = streams[0];
      if (!stream) return;
      setPeers((prev) => {
        const next = new Map(prev);
        const entry = next.get(remoteSocketId);
        if (entry) next.set(remoteSocketId, { ...entry, stream });
        return next;
      });
    };

    pc.onconnectionstatechange = () => {
      if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
        removePeer(remoteSocketId);
      }
    };

    // Add all local tracks to this new connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => pc.addTrack(t, localStreamRef.current));
    }

    peerConnsRef.current.set(remoteSocketId, pc);
    return pc;
  }, [socket]);

  // ── Utility: cleanly remove a peer ────────────────────────────────────────
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
      // Fallback: audio only
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        localStreamRef.current = audioStream;
        setLocalStream(audioStream);
        setIsCamOff(true);
        return audioStream;
      } catch (err) {
        setError("Cannot access camera/microphone. Check browser permissions.");
        throw err;
      }
    }
  }, []);

  // ── Join meeting ───────────────────────────────────────────────────────────
  const joinMeeting = useCallback(async (mid) => {
    setError("");
    const finalId = mid || meetingIdInput.trim();
    if (!finalId) { setError("Please enter a Meeting ID."); return; }
    if (!nameInput.trim()) { setError("Please enter your name."); return; }

    try {
      await getLocalStream();
    } catch { return; }

    activeMeetingIdRef.current = finalId;
    setActiveMeetingId(finalId);
    setPhase("meeting");

    socket?.emit("joinMeeting", { meetingId: finalId });
  }, [meetingIdInput, nameInput, getLocalStream, socket]);

  // ── Create new meeting ─────────────────────────────────────────────────────
  const createMeeting = useCallback(() => {
    const newId = generateMeetingId();
    setMeetingIdInput(newId);
    navigate(`/meeting/${newId}`, { replace: true });
    joinMeeting(newId);
  }, [navigate, joinMeeting]);

  // ── Leave meeting ──────────────────────────────────────────────────────────
  const leaveMeeting = useCallback(() => {
    socket?.emit("leaveMeeting", { meetingId: activeMeetingIdRef.current });

    // Stop all local tracks
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    screenStreamRef.current = null;
    setLocalStream(null);
    setScreenStream(null);

    // Close all peer connections
    peerConnsRef.current.forEach((pc) => pc.close());
    peerConnsRef.current.clear();
    setPeers(new Map());

    setPhase("home");
    setActiveMeetingId("");
    setMeetingIdInput("");
    navigate("/meeting", { replace: true });
  }, [socket, navigate]);

  // ── Toggle mute ────────────────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    localStreamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !t.enabled; });
    setIsMuted((p) => !p);
  }, []);

  // ── Toggle camera ──────────────────────────────────────────────────────────
  const toggleCam = useCallback(() => {
    localStreamRef.current?.getVideoTracks().forEach((t) => { t.enabled = !t.enabled; });
    setIsCamOff((p) => !p);
  }, []);

  // ── Toggle screen share ────────────────────────────────────────────────────
  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      // Stop screen share and switch back to camera
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      setScreenStream(null);
      setIsScreenSharing(false);

      // Replace screen track with camera track in all PCs
      const camTrack = localStreamRef.current?.getVideoTracks()[0];
      if (camTrack) {
        peerConnsRef.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === "video");
          sender?.replaceTrack(camTrack);
        });
      }
      return;
    }
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      screenStreamRef.current = screenStream;
      setScreenStream(screenStream);
      setIsScreenSharing(true);

      // Replace video track in all peer connections with screen track
      const screenTrack = screenStream.getVideoTracks()[0];
      peerConnsRef.current.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        sender?.replaceTrack(screenTrack);
      });

      // Auto-stop when user clicks browser's "Stop sharing"
      screenTrack.onended = () => toggleScreenShare();
    } catch (err) {
      if (err.name !== "NotAllowedError") setError("Screen share failed.");
    }
  }, [isScreenSharing]);

  // ── Copy link ──────────────────────────────────────────────────────────────
  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(`${window.location.origin}/meeting/${activeMeetingId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [activeMeetingId]);

  // ── Socket event listeners for signaling ───────────────────────────────────
  useEffect(() => {
    if (!socket || phase !== "meeting") return;

    // Existing participants when we join — we create offers to each
    const onExistingParticipants = async ({ existingParticipants }) => {
      for (const p of existingParticipants) {
        setPeers((prev) => {
          const next = new Map(prev);
          if (!next.has(p.socketId)) {
            next.set(p.socketId, { ...p, stream: null });
          }
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

    // New user joined — they will send us an offer; add them to UI immediately
    const onUserJoined = ({ socketId, userId, userName }) => {
      setPeers((prev) => {
        const next = new Map(prev);
        if (!next.has(socketId)) {
          next.set(socketId, { socketId, userId, userName, stream: null });
        }
        return next;
      });
    };

    // Incoming offer from a new peer — create answer
    const onOffer = async ({ fromSocketId, fromUserId, fromUserName, offer }) => {
      setPeers((prev) => {
        const next = new Map(prev);
        if (!next.has(fromSocketId)) {
          next.set(fromSocketId, { socketId: fromSocketId, userId: fromUserId, userName: fromUserName, stream: null });
        }
        return next;
      });

      const pc = getOrCreatePC(fromSocketId);
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("meetingAnswer", { targetSocketId: fromSocketId, answer });
      } catch (err) { console.error("Answer error:", err); }
    };

    // Incoming answer to our offer
    const onAnswer = async ({ fromSocketId, answer }) => {
      const pc = peerConnsRef.current.get(fromSocketId);
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) { console.error("setRemoteDesc answer error:", err); }
      }
    };

    // ICE candidate from any peer
    const onIce = async ({ fromSocketId, candidate }) => {
      const pc = peerConnsRef.current.get(fromSocketId);
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) { console.error("ICE error:", err); }
      }
    };

    // A peer left
    const onUserLeft = ({ socketId }) => removePeer(socketId);

    socket.on("existingParticipants", onExistingParticipants);
    socket.on("userJoined",           onUserJoined);
    socket.on("meetingOffer",         onOffer);
    socket.on("meetingAnswer",        onAnswer);
    socket.on("meetingIceCandidate",  onIce);
    socket.on("userLeft",             onUserLeft);

    return () => {
      socket.off("existingParticipants", onExistingParticipants);
      socket.off("userJoined",           onUserJoined);
      socket.off("meetingOffer",         onOffer);
      socket.off("meetingAnswer",        onAnswer);
      socket.off("meetingIceCandidate",  onIce);
      socket.off("userLeft",             onUserLeft);
    };
  }, [socket, phase, getOrCreatePC, removePeer]);

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      peerConnsRef.current.forEach((pc) => pc.close());
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  //  RENDER: HOME / LOBBY
  // ─────────────────────────────────────────────────────────────────────────
  if (phase !== "meeting") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-slate-950 relative overflow-hidden flex items-center justify-center p-6">
        {/* Ambient orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/8 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-500/3 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 rounded-3xl shadow-2xl shadow-emerald-500/30 mb-5 relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 blur-xl opacity-40 animate-pulse" />
              <svg className="w-10 h-10 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-slate-200 bg-clip-text text-transparent mb-2">
              SkillBarter Meet
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              HD video meetings for your skill exchange sessions
            </p>
          </div>

          {/* Card */}
          <div className="bg-gray-900/40 backdrop-blur-2xl border border-gray-700/40 rounded-3xl p-8 shadow-2xl">
            {/* Name input */}
            <div className="mb-5">
              <label className="block text-slate-300 text-sm font-medium mb-2">Your Name</label>
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter your name..."
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700/40 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all duration-300 text-sm"
              />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gray-700/50" />
              <span className="text-slate-500 text-xs">create or join</span>
              <div className="flex-1 h-px bg-gray-700/50" />
            </div>

            {/* Create Meeting */}
            <button
              onClick={createMeeting}
              className="w-full mb-4 py-3.5 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 hover:from-emerald-400 hover:via-green-400 hover:to-teal-500 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/25 flex items-center justify-center gap-2 text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Meeting
            </button>

            {/* Join with ID */}
            <div className="space-y-3">
              <label className="block text-slate-300 text-sm font-medium">Join with Meeting ID</label>
              <input
                value={meetingIdInput}
                onChange={(e) => setMeetingIdInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && joinMeeting()}
                placeholder="Enter meeting ID..."
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700/40 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all duration-300 text-sm font-mono tracking-wide"
              />
              <button
                onClick={() => joinMeeting()}
                disabled={!meetingIdInput.trim()}
                className="w-full py-3.5 bg-gray-800/60 hover:bg-gray-700/70 border border-gray-700/40 hover:border-emerald-500/40 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm hover:shadow-lg"
              >
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Join Meeting
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {["HD Video", "Screen Share", "Live Chat", "Multi-Party"].map((f) => (
              <span key={f} className="px-3 py-1 bg-gray-800/40 border border-gray-700/30 rounded-full text-xs text-slate-400 font-medium">
                ✓ {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  RENDER: MEETING ROOM
  // ─────────────────────────────────────────────────────────────────────────
  const remotePeersArray = Array.from(peers.values());

  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col overflow-hidden" style={{ fontFamily: "Inter, sans-serif" }}>

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-5 py-3 bg-gray-950/90 backdrop-blur-xl border-b border-white/8 z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-white font-semibold text-sm leading-tight">SkillBarter Meet</h2>
            <p className="text-slate-500 text-xs font-mono">{activeMeetingId}</p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/15 border border-red-500/30 rounded-full">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 text-xs font-semibold">LIVE</span>
          </div>

          {/* Copy link */}
          <button
            onClick={copyLink}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/60 hover:bg-emerald-500/20 border border-gray-700/40 hover:border-emerald-500/40 rounded-xl text-slate-300 hover:text-emerald-400 transition-all duration-200 text-xs font-medium"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      </div>

      {/* ── Main content area ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video grid */}
        <div className="flex-1 overflow-hidden">
          <VideoGrid
            localStream={localStream}
            localName={nameInput || currentUser.name || "You"}
            isMuted={isMuted}
            isCamOff={isCamOff}
            screenStream={screenStream}
            remoteParticipants={remotePeersArray}
          />
        </div>

        {/* Chat panel — slides in from right */}
        {isChatOpen && (
          <MeetingChat
            socket={socket}
            meetingId={activeMeetingId}
            userName={nameInput || currentUser.name || "You"}
            onClose={() => setIsChatOpen(false)}
          />
        )}
      </div>

      {/* ── Bottom controls ── */}
      <MeetingControls
        isMuted={isMuted}
        isCamOff={isCamOff}
        isScreenSharing={isScreenSharing}
        isChatOpen={isChatOpen}
        participantCount={1 + remotePeersArray.length}
        meetingId={activeMeetingId}
        onToggleMute={toggleMute}
        onToggleCam={toggleCam}
        onToggleScreen={toggleScreenShare}
        onToggleChat={() => setIsChatOpen((p) => !p)}
        onLeave={leaveMeeting}
      />
    </div>
  );
}
