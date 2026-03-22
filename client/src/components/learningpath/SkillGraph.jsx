export default function SkillGraph({ steps, completedSteps }) {
  if (!steps || steps.length === 0) return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-10 text-center">
      <div className="text-4xl mb-3">🔗</div>
      <p className="text-slate-500 text-sm">Generate a learning path to see the skill graph.</p>
    </div>
  );

  const W = 700, H = 380, NODE_R = 30;
  const cols = Math.ceil(Math.sqrt(steps.length));

  const positions = steps.map((step, i) => {
    const row = Math.floor(i / cols);
    const col = row % 2 === 0 ? i % cols : cols - 1 - (i % cols);
    const x   = 60 + col * ((W - 120) / Math.max(cols - 1, 1));
    const y   = 60 + row * ((H - 100) / Math.max(Math.ceil(steps.length / cols) - 1, 1));
    return { x, y, step };
  });

  const posMap = {};
  positions.forEach((p) => { posMap[p.step.stepNumber] = p; });

  const COLORS = [
    "#f43f5e","#a855f7","#3b82f6","#10b981","#f59e0b",
    "#6366f1","#ec4899","#14b8a6","#f97316","#06b6d4",
    "#8b5cf6","#eab308",
  ];

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-white/[0.06] bg-gradient-to-r from-indigo-500/8 to-violet-500/5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-white">Skill Dependency Graph</h3>
          <p className="text-xs text-slate-400">Visual roadmap of your learning journey</p>
        </div>
        <div className="ml-auto flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded bg-rose-500" /> Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded bg-slate-700 border border-dashed border-slate-600" /> Pending
          </span>
        </div>
      </div>

      {/* SVG graph */}
      <div className="p-4 overflow-x-auto bg-[#070b12]">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 300 }}>
          {/* Defs */}
          <defs>
            {COLORS.map((c, i) => (
              <radialGradient key={i} id={`ng${i}`} cx="50%" cy="35%" r="65%">
                <stop offset="0%" stopColor={c} stopOpacity="0.9" />
                <stop offset="100%" stopColor={c} stopOpacity="0.4" />
              </radialGradient>
            ))}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Sequential edges */}
          {positions.slice(0, -1).map((p, i) => {
            const next  = positions[i + 1];
            const done  = completedSteps.includes(p.step.stepNumber);
            const color = COLORS[i % COLORS.length];
            return (
              <line key={`e-${i}`}
                x1={p.x} y1={p.y} x2={next.x} y2={next.y}
                stroke={done ? color : "#1e293b"}
                strokeWidth={done ? 2.5 : 1.5}
                strokeDasharray={done ? "" : "6 4"}
                strokeOpacity={done ? 0.7 : 0.4}
              />
            );
          })}

          {/* Dependency edges */}
          {steps.map((step) =>
            (step.dependsOn || []).map((depN) => {
              const from = posMap[depN];
              const to   = posMap[step.stepNumber];
              if (!from || !to) return null;
              const bothDone = completedSteps.includes(depN) && completedSteps.includes(step.stepNumber);
              return (
                <line key={`dep-${depN}-${step.stepNumber}`}
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={bothDone ? "#f43f5e" : "#334155"}
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  strokeOpacity={0.6}
                />
              );
            })
          )}

          {/* Nodes */}
          {positions.map(({ x, y, step }, i) => {
            const done  = completedSteps.includes(step.stepNumber);
            const color = COLORS[i % COLORS.length];
            return (
              <g key={step.stepNumber}>
                {/* Glow backdrop for completed */}
                {done && (
                  <circle cx={x} cy={y} r={NODE_R + 10}
                    fill={color} fillOpacity="0.08"
                    filter="url(#glow)"
                  />
                )}
                {/* Outer ring */}
                <circle cx={x} cy={y} r={NODE_R + 3}
                  fill="none"
                  stroke={done ? color : "#1e293b"}
                  strokeWidth={done ? 1.5 : 1}
                  strokeOpacity={done ? 0.5 : 0.3}
                />
                {/* Main circle */}
                <circle cx={x} cy={y} r={NODE_R}
                  fill={done ? `url(#ng${i % COLORS.length})` : "#0f172a"}
                  stroke={done ? color : "#334155"}
                  strokeWidth={done ? 2 : 1}
                />
                {/* Step number */}
                <text x={x} y={y - 7} textAnchor="middle" dominantBaseline="middle"
                  fill={done ? "#fff" : "#64748b"} fontSize="11" fontWeight="800"
                  filter={done ? "url(#glow)" : ""}
                >
                  {step.stepNumber}
                </text>
                {/* Skill label */}
                <text x={x} y={y + 8} textAnchor="middle" dominantBaseline="middle"
                  fill={done ? "rgba(255,255,255,0.85)" : "#475569"} fontSize="7.5" fontWeight="600"
                >
                  {step.skill.length > 9 ? step.skill.slice(0, 8) + "…" : step.skill}
                </text>
                {/* Completed tick */}
                {done && (
                  <text x={x + NODE_R - 2} y={y - NODE_R + 4}
                    fill={color} fontSize="11" fontWeight="bold" filter="url(#glow)"
                  >✓</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Step legend */}
      <div className="p-4 border-t border-white/[0.05] flex gap-2 flex-wrap">
        {positions.map(({ step }, i) => {
          const done = completedSteps.includes(step.stepNumber);
          return (
            <div key={step.stepNumber}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${
                done
                  ? "bg-white/8 border-white/15 text-white"
                  : "bg-white/[0.02] border-white/[0.06] text-slate-500"
              }`}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[i % COLORS.length], opacity: done ? 1 : 0.35 }}
              />
              {step.skill}
            </div>
          );
        })}
      </div>
    </div>
  );
}
