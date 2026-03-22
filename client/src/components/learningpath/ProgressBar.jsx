export default function ProgressBar({ completed, total, xp, streakDays }) {
  const pct  = total > 0 ? Math.round((completed / total) * 100) : 0;
  const segs  = Math.min(total, 24); // max segments to render

  const milestone =
    pct === 100 ? { msg: "🎉 Path complete! You're a champion!", color: "from-emerald-400 to-teal-400", bg: "bg-emerald-400/8 border-emerald-400/20" }
    : pct >= 75  ? { msg: "🚀 Almost there! Final stretch!",      color: "from-orange-400 to-amber-400",  bg: "bg-orange-400/8  border-orange-400/20" }
    : pct >= 50  ? { msg: "⚡ Halfway! Momentum is building!",    color: "from-blue-400   to-cyan-400",   bg: "bg-blue-400/8    border-blue-400/20"   }
    : pct >= 25  ? { msg: "💪 Great start! Keep going!",          color: "from-violet-400 to-purple-400", bg: "bg-violet-400/8  border-violet-400/20" }
    : pct > 0    ? { msg: "✨ First step taken — nice!",           color: "from-rose-400   to-pink-400",   bg: "bg-rose-400/8    border-rose-400/20"   }
    :              null;

  return (
    <div className="space-y-3">
      {/* ── Main progress bar ── */}
      <div className="relative h-3 bg-slate-800/80 rounded-full overflow-hidden">
        {/* Background shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-slate-700/30 to-slate-800 animate-pulse" />
        {/* Fill */}
        <div
          className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 transition-all duration-1000 ease-out"
          style={{ width: `${pct}%` }}
        >
          {/* Shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer rounded-full" />
        </div>
        {/* % text overlay */}
        {pct > 8 && (
          <div
            className="absolute top-0 h-full flex items-center pointer-events-none"
            style={{ left: `${Math.max(pct - 9, 0)}%` }}
          >
            <span className="text-[9px] font-extrabold text-white/90 tabular-nums">{pct}%</span>
          </div>
        )}
      </div>

      {/* ── Segment dots ── */}
      {segs > 0 && (
        <div className="flex gap-1">
          {Array.from({ length: segs }).map((_, i) => {
            const filled = i < completed;
            return (
              <div
                key={i}
                title={`Step ${i + 1}`}
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  filled
                    ? "bg-gradient-to-r from-rose-500 to-pink-500 shadow-sm shadow-rose-500/30"
                    : "bg-slate-800"
                }`}
                style={{ transitionDelay: `${i * 25}ms` }}
              />
            );
          })}
        </div>
      )}

      {/* ── Milestone message ── */}
      {milestone && (
        <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border ${milestone.bg} transition-all`}>
          <div className={`flex-shrink-0 w-1 h-8 rounded-full bg-gradient-to-b ${milestone.color}`} />
          <p className={`text-sm font-semibold bg-gradient-to-r ${milestone.color} bg-clip-text text-transparent`}>
            {milestone.msg}
          </p>
        </div>
      )}

      <style>{`
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(300%)} }
        .animate-shimmer  { animation:shimmer 2.5s ease infinite; }
      `}</style>
    </div>
  );
}
