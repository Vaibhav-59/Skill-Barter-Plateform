// components/gamification/StreakTracker.jsx
import { useTheme } from "../../hooks/useTheme";

function FlameAnimation({ count }) {
  return (
    <div className="relative flex items-center justify-center">
      <div
        className={`text-6xl select-none ${
          count > 0 ? "animate-bounce" : "opacity-30 grayscale"
        }`}
        style={{
          filter: count > 0 ? "drop-shadow(0 0 16px #f97316)" : "none",
          animationDuration: "1s",
        }}
      >
        🔥
      </div>
      {count > 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-orange-500/20 animate-ping" style={{ animationDuration: "2s" }} />
        </div>
      )}
    </div>
  );
}

export default function StreakTracker({ data }) {
  const { isDarkMode } = useTheme();

  const learningStreak = data?.learningStreak || 0;
  const teachingStreak = data?.teachingStreak || 0;
  const longestStreak  = data?.longestStreak  || 0;

  // Weekly calendar — last 7 days
  const today = new Date();
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return { label: d.toLocaleDateString("en", { weekday: "short" }), active: i >= 7 - learningStreak };
  });

  const milestones = [3, 7, 14, 30, 60, 100];
  const nextMilestone = milestones.find((m) => m > learningStreak) || 100;
  const prevMilestone = milestones.filter((m) => m <= learningStreak).at(-1) || 0;
  const milestoneProgress = nextMilestone
    ? Math.min(((learningStreak - prevMilestone) / (nextMilestone - prevMilestone)) * 100, 100)
    : 100;

  return (
    <div
      className={`rounded-2xl border p-6 ${
        isDarkMode ? "bg-gray-900/80 border-white/10" : "bg-white border-gray-200"
      } shadow-lg`}
    >
      <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
        Streak Tracker
      </h2>

      {/* Streaks row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Learning streak */}
        <div
          className={`rounded-xl p-4 text-center ${
            isDarkMode ? "bg-orange-500/10 border border-orange-500/20" : "bg-orange-50 border border-orange-100"
          }`}
        >
          <FlameAnimation count={learningStreak} />
          <div className={`text-2xl font-bold mt-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            {learningStreak}
          </div>
          <div className={`text-sm ${isDarkMode ? "text-orange-400" : "text-orange-600"}`}>
            Learning Streak
          </div>
          <div className={`text-xs mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
            {learningStreak === 0 ? "Start learning today!" : `${learningStreak} day${learningStreak > 1 ? "s" : ""} strong`}
          </div>
        </div>

        {/* Teaching streak */}
        <div
          className={`rounded-xl p-4 text-center ${
            isDarkMode ? "bg-blue-500/10 border border-blue-500/20" : "bg-blue-50 border border-blue-100"
          }`}
        >
          <div className={`text-6xl mb-2 ${teachingStreak > 0 ? "" : "opacity-30 grayscale"}`}>📖</div>
          <div className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            {teachingStreak}
          </div>
          <div className={`text-sm ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>
            Teaching Streak
          </div>
          <div className={`text-xs mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
            {teachingStreak === 0 ? "Teach your first session!" : `${teachingStreak} day${teachingStreak > 1 ? "s" : ""} teaching`}
          </div>
        </div>

        {/* Best streak */}
        <div
          className={`rounded-xl p-4 text-center ${
            isDarkMode ? "bg-yellow-500/10 border border-yellow-500/20" : "bg-yellow-50 border border-yellow-100"
          }`}
        >
          <div className="text-6xl mb-2">🏆</div>
          <div className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            {longestStreak}
          </div>
          <div className={`text-sm ${isDarkMode ? "text-yellow-400" : "text-yellow-600"}`}>
            Best Streak
          </div>
          <div className={`text-xs mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
            Your personal best!
          </div>
        </div>
      </div>

      {/* Weekly calendar */}
      <div className={`p-4 rounded-xl mb-4 ${isDarkMode ? "bg-white/5" : "bg-gray-50"}`}>
        <div className={`text-sm font-semibold mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
          Last 7 Days
        </div>
        <div className="flex gap-2 justify-between">
          {week.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  day.active
                    ? "bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-md shadow-orange-500/30"
                    : isDarkMode
                    ? "bg-white/10 text-gray-500"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {day.active ? "🔥" : "·"}
              </div>
              <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>{day.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Milestone progress */}
      <div>
        <div className="flex justify-between mb-1">
          <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            Next milestone: {nextMilestone} days
          </span>
          <span className={`text-sm font-semibold ${isDarkMode ? "text-orange-400" : "text-orange-600"}`}>
            {learningStreak} / {nextMilestone}
          </span>
        </div>
        <div className={`h-2.5 rounded-full overflow-hidden ${isDarkMode ? "bg-white/10" : "bg-gray-200"}`}>
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-1000"
            style={{ width: `${milestoneProgress}%` }}
          />
        </div>
        {learningStreak >= 7 && (
          <p className={`text-xs mt-2 ${isDarkMode ? "text-orange-400" : "text-orange-600"}`}>
            🎉 Bonus XP unlocked for 7-day streak!
          </p>
        )}
      </div>
    </div>
  );
}
