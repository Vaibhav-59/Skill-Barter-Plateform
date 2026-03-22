import { useState } from "react";

const DIFF = {
  Beginner:     { label: "Beginner",     color: "text-emerald-300", bg: "bg-emerald-500/10 border-emerald-500/25", dot: "bg-emerald-400", ring: "ring-emerald-500/20", bar: "from-emerald-500 to-teal-500" },
  Easy:         { label: "Easy",         color: "text-teal-300",    bg: "bg-teal-500/10    border-teal-500/25",    dot: "bg-teal-400",    ring: "ring-teal-500/20",    bar: "from-teal-500    to-cyan-500"  },
  Medium:       { label: "Medium",       color: "text-yellow-300",  bg: "bg-yellow-500/10  border-yellow-500/25",  dot: "bg-yellow-400",  ring: "ring-yellow-500/20",  bar: "from-yellow-500  to-amber-500" },
  Intermediate: { label: "Intermediate", color: "text-orange-300",  bg: "bg-orange-500/10  border-orange-500/25",  dot: "bg-orange-400",  ring: "ring-orange-500/20",  bar: "from-orange-500  to-red-500"   },
  Advanced:     { label: "Advanced",     color: "text-red-300",     bg: "bg-red-500/10     border-red-500/25",     dot: "bg-red-400",     ring: "ring-red-500/20",     bar: "from-red-500     to-rose-600"  },
  Expert:       { label: "Expert",       color: "text-purple-300",  bg: "bg-purple-500/10  border-purple-500/25",  dot: "bg-purple-400",  ring: "ring-purple-500/20",  bar: "from-purple-500  to-fuchsia-600"},
};

const RESOURCE_ICONS = { video: "🎬", article: "📄", course: "🎓", other: "🔗" };

const STEP_COLORS = [
  "from-rose-500    to-pink-600",
  "from-violet-500  to-purple-600",
  "from-blue-500    to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500   to-orange-600",
  "from-indigo-500  to-blue-600",
  "from-pink-500    to-rose-600",
  "from-teal-500    to-emerald-600",
  "from-orange-500  to-red-600",
  "from-cyan-500    to-blue-600",
  "from-fuchsia-500 to-purple-600",
  "from-yellow-500  to-amber-600",
];

export default function PathStep({ step, isCompleted, onToggle, isLast, index }) {
  const [expanded, setExpanded] = useState(false);
  const [toggling, setToggling] = useState(false);

  const diff        = DIFF[step.difficulty] || DIFF.Medium;
  const stepGrad    = STEP_COLORS[index % STEP_COLORS.length];

  const handleToggle = async () => {
    if (toggling) return;
    setToggling(true);
    await onToggle(step.stepNumber, !isCompleted);
    setToggling(false);
  };

  return (
    <div className="flex gap-4 group/row">

      {/* ── Timeline spine ── */}
      <div className="flex flex-col items-center flex-shrink-0 pt-1">
        {/* Node */}
        <button
          onClick={handleToggle}
          disabled={toggling}
          className={`
            relative w-11 h-11 rounded-full flex items-center justify-center font-extrabold text-sm
            transition-all duration-500 z-10 flex-shrink-0 select-none
            ${isCompleted
              ? `bg-gradient-to-br ${stepGrad} text-white shadow-xl ring-4 ${diff.ring} scale-105`
              : "bg-slate-900 border-2 border-slate-700 text-slate-400 hover:border-rose-500/60 hover:text-rose-300 hover:scale-105"
            }
          `}
        >
          {toggling ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : isCompleted ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <span>{step.stepNumber}</span>
          )}

          {/* Glow pulse for completed */}
          {isCompleted && (
            <span className={`absolute inset-0 rounded-full bg-gradient-to-br ${stepGrad} opacity-30 animate-ping`} />
          )}
        </button>

        {/* Vertical connector */}
        {!isLast && (
          <div className={`w-0.5 flex-1 mt-2 mb-0 min-h-[2.5rem] rounded-full transition-all duration-700 ${
            isCompleted
              ? `bg-gradient-to-b ${stepGrad} opacity-60`
              : "bg-slate-800"
          }`} />
        )}
      </div>

      {/* ── Card ── */}
      <div className={`
        flex-1 mb-5 rounded-3xl border transition-all duration-400 overflow-hidden
        ${isCompleted
          ? `bg-gradient-to-br from-white/[0.04] to-white/[0.01] border-rose-500/20 shadow-lg shadow-rose-500/5`
          : "bg-white/[0.03] border-white/[0.07] hover:border-white/[0.12] hover:bg-white/[0.05]"
        }
      `}>
        {/* Coloured top accent */}
        <div className={`h-0.5 w-full bg-gradient-to-r ${isCompleted ? stepGrad : "from-transparent"} transition-all duration-500`} />

        <div className="p-5">
          {/* Row: skill + badges + expand */}
          <div className="flex items-start gap-3">
            {/* Step icon */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-base font-bold transition-all ${
              isCompleted
                ? `bg-gradient-to-br ${stepGrad} text-white shadow-md`
                : "bg-white/[0.06] text-slate-400 border border-white/[0.08]"
            }`}>
              {isCompleted ? "✓" : `${step.stepNumber}`}
            </div>

            <div className="flex-1 min-w-0">
              {/* Skill name */}
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={`text-base font-bold transition-all ${isCompleted ? "text-slate-400 line-through decoration-slate-600" : "text-white"}`}>
                  {step.skill}
                </h3>
                {isCompleted && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
                    ✓ Completed
                  </span>
                )}
              </div>

              {/* Badge row */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {/* Difficulty */}
                <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium ${diff.bg} ${diff.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
                  {step.difficulty}
                </span>
                {/* Time */}
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-slate-400">
                  ⏱ {step.estimatedTime}
                </span>
                {/* XP */}
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold">
                  ⚡ +{step.xpReward || 50} XP
                </span>
                {/* Dependencies */}
                {step.dependsOn?.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-700/40 border border-slate-600/30 text-slate-400">
                    🔒 Needs {step.dependsOn.map((d) => `Step ${d}`).join(", ")}
                  </span>
                )}
              </div>
            </div>

            {/* Expand button */}
            <button
              onClick={() => setExpanded(!expanded)}
              className={`p-2 rounded-xl transition-all ${expanded ? "bg-white/10 text-white" : "text-slate-600 hover:text-slate-300 hover:bg-white/5"}`}
            >
              <svg className={`w-4 h-4 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Description */}
          <p className="text-slate-400 text-sm mt-3 ml-13 leading-relaxed pl-1">{step.description}</p>

          {/* ── Expanded: resources ── */}
          {expanded && (
            <div className="mt-4 ml-0 space-y-3 animate-fadeIn">
              {step.resources?.length > 0 && (
                <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                    📚 Learning Resources
                  </p>
                  <div className="grid gap-2">
                    {step.resources.map((r, i) => (
                      <a
                        key={i}
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:border-rose-500/30 hover:bg-rose-500/5 transition-all"
                      >
                        <span className="text-lg flex-shrink-0">{RESOURCE_ICONS[r.type] || "🔗"}</span>
                        <span className="flex-1 text-sm text-slate-300 group-hover/link:text-white transition-colors truncate">{r.title}</span>
                        <svg className="w-3.5 h-3.5 text-slate-600 group-hover/link:text-rose-400 flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Difficulty progress bar */}
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Difficulty</p>
                  <span className={`text-xs ${diff.color} font-semibold`}>{step.difficulty}</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${diff.bar} transition-all duration-700`}
                    style={{ width: `${({ Beginner: 16, Easy: 32, Medium: 50, Intermediate: 66, Advanced: 82, Expert: 100 }[step.difficulty]) || 50}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Action row ── */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.05]">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
            >
              {expanded ? "Hide details" : `Show details & resources (${step.resources?.length || 0})`}
            </button>
            <button
              onClick={handleToggle}
              disabled={toggling}
              className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl font-semibold transition-all ${
                isCompleted
                  ? "bg-slate-700/50 border border-slate-600/30 text-slate-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400"
                  : `bg-gradient-to-r ${stepGrad} text-white shadow-md hover:shadow-lg active:scale-95`
              }`}
            >
              {isCompleted ? (
                <>↩ Unmark</>
              ) : (
                <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg> Complete</>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        .animate-fadeIn   { animation: fadeIn 0.25s ease both; }
      `}</style>
    </div>
  );
}
