import { useEffect, useState, useRef } from "react";
import { useTheme } from "../../hooks/useTheme";

export default function TestTimer({ totalSeconds, onExpire }) {
  const { isDarkMode } = useTheme();
  const [remaining, setRemaining] = useState(totalSeconds);
  const intervalRef = useRef(null);

  useEffect(() => {
    setRemaining(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (remaining <= 0) {
      onExpire?.();
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []);

  const mins = String(Math.floor(remaining / 60)).padStart(2, "0");
  const secs = String(remaining % 60).padStart(2, "0");
  const pct = (remaining / totalSeconds) * 100;
  const isWarning = remaining < 60;
  const isCritical = remaining < 20;

  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all ${
      isCritical
        ? "border-rose-500/40 bg-rose-500/10 animate-pulse"
        : isWarning
        ? "border-amber-500/30 bg-amber-500/10"
        : isDarkMode
        ? "border-white/10 bg-white/5"
        : "border-gray-200 bg-white shadow-sm"
    }`}>
      {/* Clock icon */}
      <div className={`relative w-8 h-8 flex-shrink-0`}>
        <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="14" fill="none" strokeWidth="3"
            className={isDarkMode ? "stroke-white/10" : "stroke-gray-100"}
          />
          <circle
            cx="16" cy="16" r="14"
            fill="none" strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 14}`}
            strokeDashoffset={`${2 * Math.PI * 14 * (1 - pct / 100)}`}
            strokeLinecap="round"
            className={`transition-all duration-1000 ${
              isCritical ? "stroke-rose-500" : isWarning ? "stroke-amber-500" : "stroke-emerald-500"
            }`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className={`w-3.5 h-3.5 ${isCritical ? "text-rose-400" : isWarning ? "text-amber-400" : "text-emerald-400"}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <div>
        <div className={`text-xs font-bold uppercase tracking-widest ${
          isCritical ? "text-rose-400" : isWarning ? "text-amber-400" : isDarkMode ? "text-slate-400" : "text-gray-400"
        }`}>
          Time Left
        </div>
        <div className={`text-lg font-black tabular-nums ${
          isCritical ? "text-rose-400" : isWarning ? "text-amber-400" : isDarkMode ? "text-white" : "text-gray-900"
        }`}>
          {mins}:{secs}
        </div>
      </div>
    </div>
  );
}
