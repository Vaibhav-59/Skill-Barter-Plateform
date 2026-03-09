/**
 * MeetingControls.jsx
 * Zoom-style bottom toolbar for the meeting room.
 */

export default function MeetingControls({
  isMuted,
  isCamOff,
  isScreenSharing,
  isChatOpen,
  participantCount,
  meetingId,
  onToggleMute,
  onToggleCam,
  onToggleScreen,
  onToggleChat,
  onLeave,
}) {
  const copyLink = () => {
    const url = `${window.location.origin}/meeting/${meetingId}`;
    navigator.clipboard.writeText(url).then(() => {
      // Brief visual confirmation handled by parent or tooltip
    });
  };

  return (
    <div className="relative flex items-center justify-between px-6 py-4 bg-gray-950/95 backdrop-blur-xl border-t border-white/10">
      {/* Left: meeting info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="hidden sm:flex flex-col">
          <span className="text-slate-400 text-xs font-medium">Meeting ID</span>
          <span className="text-white text-sm font-mono tracking-widest">{meetingId}</span>
        </div>
        <button
          onClick={copyLink}
          title="Copy meeting link"
          className="group flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/50 hover:bg-emerald-500/20 border border-gray-700/40 hover:border-emerald-500/40 rounded-xl text-slate-400 hover:text-emerald-400 transition-all duration-200 text-xs font-medium"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span className="hidden sm:inline">Copy Link</span>
        </button>
      </div>

      {/* Center: main controls */}
      <div className="flex items-center gap-3">
        {/* Mute */}
        <ControlButton
          onClick={onToggleMute}
          active={isMuted}
          activeClass="bg-red-500/20 border-red-500/40 text-red-400"
          inactiveClass="bg-gray-800/60 border-gray-700/40 text-slate-300 hover:bg-gray-700/60 hover:text-white"
          label={isMuted ? "Unmute" : "Mute"}
          icon={
            isMuted ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            )
          }
        />

        {/* Camera */}
        <ControlButton
          onClick={onToggleCam}
          active={isCamOff}
          activeClass="bg-red-500/20 border-red-500/40 text-red-400"
          inactiveClass="bg-gray-800/60 border-gray-700/40 text-slate-300 hover:bg-gray-700/60 hover:text-white"
          label={isCamOff ? "Start Cam" : "Stop Cam"}
          icon={
            isCamOff ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8M3 8v8a2 2 0 002 2h8M3 8l18 8" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            )
          }
        />

        {/* Screen Share */}
        <ControlButton
          onClick={onToggleScreen}
          active={isScreenSharing}
          activeClass="bg-blue-500/20 border-blue-500/40 text-blue-400"
          inactiveClass="bg-gray-800/60 border-gray-700/40 text-slate-300 hover:bg-gray-700/60 hover:text-white"
          label={isScreenSharing ? "Stop Share" : "Share Screen"}
          icon={
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          }
        />

        {/* Chat */}
        <ControlButton
          onClick={onToggleChat}
          active={isChatOpen}
          activeClass="bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
          inactiveClass="bg-gray-800/60 border-gray-700/40 text-slate-300 hover:bg-gray-700/60 hover:text-white"
          label="Chat"
          icon={
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          }
        />

        {/* Leave — prominent red button */}
        <button
          onClick={onLeave}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 group-hover:scale-110 transition-all duration-200 border border-red-400/30">
            <svg className="w-5 h-5 text-white rotate-[135deg]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <span className="text-xs text-red-400">Leave</span>
        </button>
      </div>

      {/* Right: participant count */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/50 border border-gray-700/40 rounded-xl">
          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-white text-sm font-semibold">{participantCount}</span>
        </div>
      </div>
    </div>
  );
}

// ── Reusable control button ────────────────────────────────────────────────────
function ControlButton({ onClick, active, activeClass, inactiveClass, label, icon }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 group">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-200 group-hover:scale-110 ${active ? activeClass : inactiveClass}`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icon}
        </svg>
      </div>
      <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">{label}</span>
    </button>
  );
}
