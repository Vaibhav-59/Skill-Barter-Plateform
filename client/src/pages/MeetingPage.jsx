import { useState } from "react";

const generateMeetingId = () =>
  Math.random().toString(36).slice(2, 7) + "-" +
  Math.random().toString(36).slice(2, 7);

export default function MeetingPage() {
  const [meetingIdInput, setMeetingIdInput] = useState("");
  const [nameInput, setNameInput] = useState(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.name || "";
  });
  const [error, setError] = useState("");

  const createMeeting = () => {
    if (!nameInput.trim()) {
      setError("Please enter your name first.");
      return;
    }
    const newId = generateMeetingId();
    window.open(`/meeting/${newId}`, "_blank");
  };

  const joinMeeting = () => {
    if (!nameInput.trim()) {
      setError("Please enter your name first.");
      return;
    }
    if (!meetingIdInput.trim()) {
      setError("Please enter a Meeting ID.");
      return;
    }
    window.open(`/meeting/${meetingIdInput.trim()}`, "_blank");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      joinMeeting();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-slate-950 relative overflow-hidden flex items-center justify-center p-6">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/8 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-500/3 rounded-full blur-3xl pointer-events-none" />

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
            SkillBarter Meet
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            HD video meetings for your skill exchange sessions
          </p>
        </div>

        <div className="bg-gray-900/40 backdrop-blur-2xl border border-gray-700/40 rounded-3xl p-8 shadow-2xl">
          <div className="mb-5">
            <label className="block text-slate-300 text-sm font-medium mb-2">Your Name</label>
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Enter your name..."
              className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700/40 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all duration-300 text-sm"
            />
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-700/50" />
            <span className="text-slate-500 text-xs">create or join</span>
            <div className="flex-1 h-px bg-gray-700/50" />
          </div>

          <button
            onClick={createMeeting}
            className="w-full mb-4 py-3.5 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 hover:from-emerald-400 hover:via-green-400 hover:to-teal-500 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/25 flex items-center justify-center gap-2 text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Meeting
          </button>

          <div className="space-y-3">
            <label className="block text-slate-300 text-sm font-medium">Join with Meeting ID</label>
            <input
              value={meetingIdInput}
              onChange={(e) => setMeetingIdInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter meeting ID..."
              className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700/40 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all duration-300 text-sm font-mono tracking-wide"
            />
            <button
              onClick={joinMeeting}
              disabled={!meetingIdInput.trim() || !nameInput.trim()}
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

        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {["HD Video", "Screen Share", "Live Chat", "Multi-Party", "Recording"].map((f) => (
            <span key={f} className="px-3 py-1 bg-gray-800/40 border border-gray-700/30 rounded-full text-xs text-slate-400 font-medium">
              ✓ {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
