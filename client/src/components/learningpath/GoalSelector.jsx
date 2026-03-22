import { useState } from "react";

const GOAL_CARDS = [
  { label: "Full Stack Developer",      icon: "🌐", gradient: "from-blue-500  to-cyan-600",    desc: "Build end-to-end web apps" },
  { label: "Data Scientist",            icon: "📊", gradient: "from-violet-500 to-purple-600", desc: "Mine insights from data" },
  { label: "UI/UX Designer",            icon: "🎨", gradient: "from-pink-500   to-rose-600",   desc: "Craft beautiful interfaces" },
  { label: "AI Engineer",              icon: "🤖", gradient: "from-emerald-500 to-teal-600",  desc: "Build intelligent systems" },
  { label: "DevOps Engineer",           icon: "⚙️", gradient: "from-orange-500 to-amber-600", desc: "Automate deployments" },
  { label: "Mobile App Developer",      icon: "📱", gradient: "from-sky-500    to-blue-600",   desc: "iOS & Android mastery" },
  { label: "Blockchain Developer",      icon: "🔗", gradient: "from-yellow-500 to-orange-600","desc": "Decentralised apps & Web3" },
  { label: "Cybersecurity Expert",      icon: "🔒", gradient: "from-red-500    to-rose-600",   desc: "Hack ethically & protect" },
  { label: "Cloud Architect",           icon: "☁️", gradient: "from-indigo-500 to-violet-600", desc: "Design scalable cloud infra" },
  { label: "Machine Learning Engineer", icon: "🧠", gradient: "from-fuchsia-500 to-pink-600", desc: "Train & deploy ML models" },
];

export default function GoalSelector({ onGenerate, isLoading }) {
  const [selected, setSelected] = useState("");
  const [custom,   setCustom]   = useState("");
  const [mode,     setMode]     = useState("preset");   // "preset" | "custom"
  const [hovered,  setHovered]  = useState(null);

  const finalGoal = mode === "custom" ? custom.trim() : selected;
  const selectedCard = GOAL_CARDS.find((g) => g.label === selected);

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-6 shadow-2xl">

      {/* ── Header ── */}
      <div className="flex items-start gap-4 mb-6">
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 blur-lg opacity-50" />
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-white">Choose Your Career Goal</h2>
          <p className="text-slate-400 text-sm mt-0.5">AI will generate a personalised step-by-step roadmap</p>
        </div>
      </div>

      {/* ── Mode Toggle ── */}
      <div className="flex gap-2 mb-6 p-1 bg-white/[0.04] rounded-xl border border-white/[0.06] w-fit">
        {[
          { id: "preset", label: "🎯 Preset Goals" },
          { id: "custom", label: "✏️ Custom Goal" },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === m.id
                ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* ── Preset Goal Cards ── */}
      {mode === "preset" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {GOAL_CARDS.map((g) => {
            const isSelected = selected === g.label;
            const isHov = hovered === g.label;
            return (
              <button
                key={g.label}
                onClick={() => setSelected(g.label)}
                onMouseEnter={() => setHovered(g.label)}
                onMouseLeave={() => setHovered(null)}
                className={`relative group flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition-all duration-300 overflow-hidden ${
                  isSelected
                    ? "border-rose-500/60 bg-gradient-to-br from-rose-500/15 to-pink-500/10 shadow-lg shadow-rose-500/15"
                    : "border-white/[0.08] bg-white/[0.03] hover:border-white/[0.15] hover:bg-white/[0.06]"
                }`}
              >
                {/* BG gradient on hover/select */}
                {(isSelected || isHov) && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${g.gradient} opacity-5 pointer-events-none`} />
                )}
                {/* Icon bubble */}
                <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all duration-300 ${
                  isSelected
                    ? `bg-gradient-to-br ${g.gradient} shadow-lg`
                    : "bg-white/[0.06]"
                }`}>
                  {g.icon}
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </div>
                <div>
                  <p className={`text-xs font-semibold leading-tight ${isSelected ? "text-white" : "text-slate-300"}`}>
                    {g.label}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{g.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Custom Input ── */}
      {mode === "custom" && (
        <div className="mb-6">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && finalGoal && onGenerate(finalGoal)}
              placeholder="e.g., Ethical Hacker, Game Developer, AR/VR Engineer..."
              className="w-full bg-white/[0.04] border border-white/[0.10] rounded-2xl pl-12 pr-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/10 transition-all text-sm"
            />
          </div>
          <p className="text-xs text-slate-500 mt-2 ml-1">
            Press Enter or click the button below to generate your roadmap
          </p>
        </div>
      )}

      {/* ── Selected preview ── */}
      {mode === "preset" && selectedCard && (
        <div className={`flex items-center gap-3 mb-5 px-4 py-3 rounded-2xl bg-gradient-to-r ${selectedCard.gradient} bg-opacity-10 border border-white/10`}>
          <span className="text-2xl">{selectedCard.icon}</span>
          <div>
            <p className="text-white font-semibold text-sm">"{selectedCard.label}" selected</p>
            <p className="text-white/50 text-xs">{selectedCard.desc}</p>
          </div>
          <button onClick={() => setSelected("")} className="ml-auto text-white/40 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Generate Button ── */}
      <button
        onClick={() => onGenerate(finalGoal)}
        disabled={!finalGoal || isLoading}
        className={`relative w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-3 overflow-hidden ${
          finalGoal && !isLoading
            ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-2xl shadow-rose-500/40 hover:shadow-rose-500/60 hover:from-rose-400 hover:to-pink-500 active:scale-[0.98]"
            : "bg-white/[0.04] border border-white/[0.08] text-slate-500 cursor-not-allowed"
        }`}
      >
        {/* Shimmer on hover */}
        {finalGoal && !isLoading && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer pointer-events-none" />
        )}

        {isLoading ? (
          <>
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>AI is crafting your roadmap…</span>
            <span className="flex gap-1">
              {[0.2, 0.4, 0.6].map((d) => (
                <span key={d} className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: `${d}s` }} />
              ))}
            </span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>✨ Generate AI Learning Path</span>
          </>
        )}
      </button>

      <style>{`
        @keyframes shimmer { 0% { transform: translateX(-200%) skewX(-12deg); } 100% { transform: translateX(300%) skewX(-12deg); } }
        .animate-shimmer   { animation: shimmer 2.5s ease infinite; }
      `}</style>
    </div>
  );
}
