// components/gamification/ProgressCard.jsx
import { useTheme } from "../../hooks/useTheme";

const XP_THRESHOLDS = [0, 100, 300, 600, 1000, 1600, 2400, 3400, 4600, 6000, 8000];

function getLevel(xp) {
  let level = 1;
  for (let i = 0; i < XP_THRESHOLDS.length; i++) {
    if (xp >= XP_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return level;
}

function getNextLevelXp(level) {
  return XP_THRESHOLDS[level] || XP_THRESHOLDS[XP_THRESHOLDS.length - 1] + 1000;
}

export default function ProgressCard({ data }) {
  const { isDarkMode } = useTheme();

  const xp = data?.xp || 0;
  const level = data?.level || getLevel(xp);
  const streak = data?.learningStreak || 0;
  const teachStreak = data?.teachingStreak || 0;
  const sessions = data?.sessionsCompleted || 0;
  const badges = data?.badges?.length || 0;

  const currentLevelXp = XP_THRESHOLDS[level - 1] || 0;
  const nextLevelXp = getNextLevelXp(level);
  const progress = Math.min(
    ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100,
    100
  );

  const stats = [
    { label: "Total XP", value: xp.toLocaleString(), icon: "⚡", color: "from-yellow-400 to-amber-500", bg: isDarkMode ? "bg-yellow-500/10" : "bg-yellow-50" },
    { label: "Current Level", value: level, icon: "🎮", color: "from-violet-400 to-purple-500", bg: isDarkMode ? "bg-violet-500/10" : "bg-violet-50" },
    { label: "Learn Streak", value: `${streak}d 🔥`, icon: "🔥", color: "from-orange-400 to-red-500", bg: isDarkMode ? "bg-orange-500/10" : "bg-orange-50" },
    { label: "Sessions", value: sessions, icon: "📅", color: "from-emerald-400 to-teal-500", bg: isDarkMode ? "bg-emerald-500/10" : "bg-emerald-50" },
    { label: "Teach Streak", value: `${teachStreak}d`, icon: "📖", color: "from-sky-400 to-blue-500", bg: isDarkMode ? "bg-sky-500/10" : "bg-sky-50" },
    { label: "Badges", value: badges, icon: "🏅", color: "from-pink-400 to-rose-500", bg: isDarkMode ? "bg-pink-500/10" : "bg-pink-50" },
  ];

  return (
    <div className={`rounded-2xl border p-6 ${isDarkMode ? "bg-gray-900/80 border-white/10" : "bg-white border-gray-200"} shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Your Progress
          </h2>
          <p className={`text-sm mt-0.5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            Keep going to level up!
          </p>
        </div>
      </div>

      {/* Level progress bar */}
      <div className={`mb-6 p-4 rounded-xl ${isDarkMode ? "bg-white/5" : "bg-gray-50"}`}>
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-700"}`}>
            Level {level}
          </span>
          <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            {xp - currentLevelXp} / {nextLevelXp - currentLevelXp} XP to Level {level + 1}
          </span>
        </div>
        <div className={`h-3 rounded-full overflow-hidden ${isDarkMode ? "bg-white/10" : "bg-gray-200"}`}>
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>Lv {level}</span>
          <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>Lv {level + 1}</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl p-3 ${stat.bg} border ${isDarkMode ? "border-white/5" : "border-gray-100"}`}
          >
            <div className="text-xl mb-1">{stat.icon}</div>
            <div className={`text-lg font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
              {stat.value}
            </div>
            <div className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
