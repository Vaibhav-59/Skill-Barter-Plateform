// components/gamification/AchievementProgress.jsx
import { useTheme } from "../../hooks/useTheme";

const CAT_COLORS = {
  session:      { bar: "from-violet-500 to-purple-500", badge: "bg-violet-500/20 text-violet-400", icon: "📅" },
  teaching:     { bar: "from-blue-500 to-cyan-500",     badge: "bg-blue-500/20 text-blue-400",     icon: "🎓" },
  learning:     { bar: "from-emerald-500 to-teal-500",  badge: "bg-emerald-500/20 text-emerald-400",icon: "🌱" },
  streak:       { bar: "from-orange-500 to-red-500",    badge: "bg-orange-500/20 text-orange-400",  icon: "🔥" },
  verification: { bar: "from-amber-500 to-yellow-500",  badge: "bg-amber-500/20 text-amber-400",    icon: "✅" },
  challenge:    { bar: "from-pink-500 to-rose-500",     badge: "bg-pink-500/20 text-pink-400",      icon: "🏅" },
};

const LIGHT_CAT_COLORS = {
  session:      { bar: "from-violet-500 to-purple-500", badge: "bg-violet-100 text-violet-600", icon: "📅" },
  teaching:     { bar: "from-blue-500 to-cyan-500",     badge: "bg-blue-100 text-blue-600",     icon: "🎓" },
  learning:     { bar: "from-emerald-500 to-teal-500",  badge: "bg-emerald-100 text-emerald-600",icon: "🌱" },
  streak:       { bar: "from-orange-500 to-red-500",    badge: "bg-orange-100 text-orange-600",  icon: "🔥" },
  verification: { bar: "from-amber-500 to-yellow-500",  badge: "bg-amber-100 text-amber-600",    icon: "✅" },
  challenge:    { bar: "from-pink-500 to-rose-500",     badge: "bg-pink-100 text-pink-600",      icon: "🏅" },
};

export default function AchievementProgress({ achievements = [] }) {
  const { isDarkMode } = useTheme();

  const completed = achievements.filter((a) => a.completed).length;

  return (
    <div
      className={`rounded-2xl border p-6 ${
        isDarkMode ? "bg-gray-900/80 border-white/10" : "bg-white border-gray-200"
      } shadow-lg`}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Achievement Progress
          </h2>
          <p className={`text-sm mt-0.5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            {completed} / {achievements.length} completed
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${isDarkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-600"}`}>
          🎯 {completed} Done
        </div>
      </div>

      <div className="space-y-4">
        {achievements.map((ach, i) => {
          const pct = Math.min((ach.current / ach.target) * 100, 100);
          const colors = isDarkMode
            ? CAT_COLORS[ach.category] || CAT_COLORS.session
            : LIGHT_CAT_COLORS[ach.category] || LIGHT_CAT_COLORS.session;

          return (
            <div
              key={i}
              className={`p-4 rounded-xl ${
                ach.completed
                  ? isDarkMode
                    ? "bg-green-500/10 border border-green-500/20"
                    : "bg-green-50 border border-green-200"
                  : isDarkMode
                  ? "bg-white/5 border border-white/5"
                  : "bg-gray-50 border border-gray-100"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors.badge}`}>
                    {colors.icon} {ach.category}
                  </span>
                  <span className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {ach.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {ach.completed ? (
                    <span className="text-green-400 text-sm">✅ Done!</span>
                  ) : (
                    <span className={`text-xs font-bold ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                      {ach.current} / {ach.target}
                    </span>
                  )}
                  <span className={`text-xs ${isDarkMode ? "text-amber-400" : "text-amber-600"}`}>
                    +{ach.xpReward} XP
                  </span>
                </div>
              </div>

              <p className={`text-xs mb-3 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                {ach.description}
              </p>

              <div className={`h-2.5 rounded-full overflow-hidden ${isDarkMode ? "bg-white/10" : "bg-gray-200"}`}>
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${colors.bar} transition-all duration-1000`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {ach.completed && ach.completedAt && (
                <p className={`text-xs mt-1 ${isDarkMode ? "text-green-400/70" : "text-green-600"}`}>
                  Completed {new Date(ach.completedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
