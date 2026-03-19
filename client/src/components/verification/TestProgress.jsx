import { useTheme } from "../../hooks/useTheme";

export default function TestProgress({ answered, total, current }) {
  const { isDarkMode } = useTheme();
  const pct = Math.round((answered / total) * 100);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-bold uppercase tracking-widest ${
          isDarkMode ? "text-slate-500" : "text-gray-400"
        }`}>
          Answered {answered}/{total}
        </span>
        <span className={`text-xs font-bold ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}>
          {pct}% complete
        </span>
      </div>
      <div className={`w-full h-2.5 rounded-full overflow-hidden ${
        isDarkMode ? "bg-white/10" : "bg-gray-100"
      }`}>
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
