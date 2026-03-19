import { useTheme } from "../../hooks/useTheme";

export default function TestConfig({
  totalQuestions,
  setTotalQuestions,
  difficulty,
  setDifficulty,
}) {
  const { isDarkMode } = useTheme();

  const diffColors = {
    Easy: "text-emerald-500",
    Medium: "text-amber-500",
    Hard: "text-rose-500",
  };

  return (
    <div className="space-y-6">
      {/* Question Count */}
      <div>
        <label
          className={`block text-xs font-bold mb-3 uppercase tracking-wide flex items-center gap-2 ${
            isDarkMode ? "text-slate-400" : "text-gray-500"
          }`}
        >
          <span>🔢</span> Number of Questions
        </label>
        <div className="flex gap-3">
          {[5, 10, 15, 20].map((num) => (
            <button
              key={num}
              onClick={() => setTotalQuestions(num)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all hover:scale-[1.03] active:scale-95 ${
                totalQuestions === num
                  ? "bg-gradient-to-br from-blue-600 to-cyan-600 text-white border-transparent shadow-lg shadow-blue-500/30"
                  : isDarkMode
                  ? "bg-white/5 border-white/10 text-slate-300 hover:text-white"
                  : "bg-white border-gray-200 text-gray-700 hover:text-gray-900"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty Level */}
      <div>
        <label
          className={`block text-xs font-bold mb-3 uppercase tracking-wide flex items-center gap-2 ${
            isDarkMode ? "text-slate-400" : "text-gray-500"
          }`}
        >
          <span>⚙️</span> Difficulty Level
        </label>
        <div className="flex gap-3">
          {["Easy", "Medium", "Hard"].map((lvl) => {
            const isSelected = difficulty === lvl;
            const colorClass = diffColors[lvl];
            return (
              <button
                key={lvl}
                onClick={() => setDifficulty(lvl)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all hover:scale-[1.03] active:scale-95 ${
                  isSelected
                    ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-500/30"
                    : isDarkMode
                    ? "bg-white/5 border-white/10 text-slate-300 hover:text-white"
                    : "bg-white border-gray-200 text-gray-700 hover:text-gray-900"
                }`}
              >
                <span className={isSelected ? "text-white" : colorClass}>
                  {lvl}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
