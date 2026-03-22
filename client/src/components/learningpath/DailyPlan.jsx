import { useState } from "react";
import { markDailyTask } from "../../services/learningPathApi";
import { toast } from "react-toastify";

export default function DailyPlan({ plan, pathId, onTaskDone }) {
  const [loading, setLoading] = useState(null);

  if (!plan || plan.length === 0) return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-10 text-center">
      <div className="text-4xl mb-3">📅</div>
      <p className="text-slate-400 text-sm">Your daily plan will appear here after generating a path.</p>
    </div>
  );

  const upcoming = plan.slice(0, 10);
  const done  = upcoming.filter((t) => t.done).length;
  const total = upcoming.length;
  const pct   = Math.round((done / total) * 100);

  const handleToggle = async (idx, current) => {
    setLoading(idx);
    try {
      const res = await markDailyTask(pathId, idx, !current);
      if (res.success) onTaskDone(res.data);
    } catch { toast.error("Failed to update task"); }
    finally  { setLoading(null); }
  };

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-white/[0.06] bg-gradient-to-r from-violet-500/8 to-purple-500/5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-white">Daily Learning Plan</h3>
              <p className="text-xs text-slate-400">Your next 10 scheduled tasks</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">{done}/{total} done</span>
            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-bold text-violet-400">{pct}%</span>
          </div>
        </div>
      </div>

      {/* Task list */}
      <div className="divide-y divide-white/[0.04]">
        {upcoming.map((task, i) => {
          const isToday = task.date === new Date().toISOString().split("T")[0];
          const isPast  = task.date < new Date().toISOString().split("T")[0];

          return (
            <div
              key={i}
              className={`flex items-center gap-4 px-5 py-4 transition-all ${
                task.done
                  ? "opacity-50"
                  : isToday
                    ? "bg-violet-500/5"
                    : ""
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => handleToggle(i, task.done)}
                disabled={loading === i}
                className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                  task.done
                    ? "bg-violet-500 border-violet-500 text-white"
                    : "border-slate-600 hover:border-violet-400 hover:bg-violet-500/10"
                }`}
              >
                {loading === i ? (
                  <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : task.done ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : null}
              </button>

              {/* Step badge */}
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                <span className="text-xs font-bold text-slate-400">{task.stepNumber}</span>
              </div>

              {/* Task info */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium transition-all ${task.done ? "line-through text-slate-500" : "text-white"}`}>
                  {task.task}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className={`text-xs ${isToday ? "text-violet-400 font-semibold" : isPast ? "text-red-400" : "text-slate-500"}`}>
                    {isToday ? "📍 Today" : task.date}
                  </span>
                  <span className="text-xs text-slate-600">·</span>
                  <span className="text-xs text-slate-500">⏱ {task.duration}</span>
                </div>
              </div>

              {/* Today badge */}
              {isToday && !task.done && (
                <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-300 font-medium">
                  Today
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
