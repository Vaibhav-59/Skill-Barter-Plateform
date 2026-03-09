import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import socketService from "../utils/socket";

/**
 * GlobalCallNotification
 * Mounts once (inside SocketProvider + Router) and listens for incomingCall
 * events on any page. Shows a banner with Accept / Decline buttons.
 * Accept navigates to /chat so the ChatPage + VideoCall component receives
 * the call and the user can join.
 */
export default function GlobalCallNotification() {
  const [incomingCall, setIncomingCall] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const locationRef = useRef(location);
  const ringtoneRef = useRef(null);

  // Keep locationRef in sync with current location
  useEffect(() => { locationRef.current = location; }, [location]);

  useEffect(() => {
    const socket = socketService.socket;
    if (!socket) return;

    const onIncomingCall = (data) => {
      // If already on the chat page, VideoCall.jsx handles the incoming call itself
      if (locationRef.current.pathname.startsWith("/chat")) return;
      console.log("🔔 GlobalCallNotification: incoming call from", data.callerName);
      setIncomingCall(data);

      // Play a short ring sound if browser allows
      try {
        if (!ringtoneRef.current) {
          // Synthesise a simple beep via Web Audio API (no external file needed)
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = "sine";
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.5);
          ringtoneRef.current = ctx;
        }
      } catch {
        // Audio not available – silent fail
      }
    };

    // If the ChatPage's own VideoCall component is handling the call, it will
    // also emit "incomingCall" so we guard against double rendering: we hide
    // the banner once the user navigates to /chat.
    socket.on("incomingCall", onIncomingCall);

    return () => {
      socket.off("incomingCall", onIncomingCall);
    };
  }, []);

  // Auto-dismiss after 45 seconds (unanswered)
  useEffect(() => {
    if (!incomingCall) return;
    const timer = setTimeout(() => setIncomingCall(null), 45000);
    return () => clearTimeout(timer);
  }, [incomingCall]);

  const handleAccept = () => {
    if (!incomingCall) return;
    // Persist the call data so VideoCall.jsx can restore it after route change
    // (the socket event won't re-fire after navigation)
    sessionStorage.setItem("pendingIncomingCall", JSON.stringify(incomingCall));
    navigate("/chat", {
      state: {
        pendingCallFrom: incomingCall.callerId,
        callerName: incomingCall.callerName,
      },
    });
    setIncomingCall(null);
  };

  const handleDecline = () => {
    if (!incomingCall) return;
    socketService.socket?.emit("rejectCall", { callerId: incomingCall.callerId });
    setIncomingCall(null);
  };

  if (!incomingCall) return null;

  return (
    <div
      className="fixed top-5 right-5 z-[9999] w-80 rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/30"
      style={{
        background: "linear-gradient(135deg, #0f1117 0%, #111827 100%)",
        animation: "slideInRight 0.4s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes ringPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(52,211,153,0.5); }
          50%       { box-shadow: 0 0 0 12px rgba(52,211,153,0); }
        }
      `}</style>

      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-green-400 to-teal-500" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          {/* Pulsing avatar */}
          <div
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0"
            style={{ animation: "ringPulse 1.2s ease-in-out infinite" }}
          >
            {incomingCall.callerName?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-0.5">
              📹 Incoming Video Call
            </p>
            <p className="text-white font-bold text-base truncate">
              {incomingCall.callerName || "Someone"}
            </p>
            <p className="text-slate-400 text-xs animate-pulse">
              is calling you...
            </p>
          </div>
          {/* Dismiss X */}
          <button
            onClick={handleDecline}
            className="w-7 h-7 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors flex-shrink-0"
            title="Dismiss"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          {/* Decline */}
          <button
            onClick={handleDecline}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/15 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-400 font-semibold text-sm transition-all duration-200 hover:scale-105"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
            </svg>
            Decline
          </button>

          {/* Accept — go to chat */}
          <button
            onClick={handleAccept}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:scale-105 shadow-lg shadow-emerald-500/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
