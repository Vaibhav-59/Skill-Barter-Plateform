// components/gamification/PointsSystem.jsx
import { useTheme } from "../../hooks/useTheme";

const XP_ACTIONS = [
  { action: "Complete a session",      xp: 40,  icon: "📅", color: "text-violet-400", bg: "bg-violet-500/10",  border: "border-violet-500/20" },
  { action: "Teach a session",         xp: 50,  icon: "🎓", color: "text-blue-400",   bg: "bg-blue-500/10",    border: "border-blue-500/20"   },
  { action: "Learn a new skill",       xp: 30,  icon: "🌱", color: "text-emerald-400",bg: "bg-emerald-500/10", border: "border-emerald-500/20"},
  { action: "Pass skill verification", xp: 60,  icon: "✅", color: "text-amber-400",  bg: "bg-amber-500/10",   border: "border-amber-500/20"  },
  { action: "Complete a challenge",    xp: 30,  icon: "🏅", color: "text-pink-400",   bg: "bg-pink-500/10",    border: "border-pink-500/20"   },
  { action: "Daily activity bonus",    xp: 15,  icon: "☀️", color: "text-yellow-400", bg: "bg-yellow-500/10",  border: "border-yellow-500/20" },
  { action: "7-day streak bonus",      xp: 50,  icon: "🔥", color: "text-orange-400", bg: "bg-orange-500/10",  border: "border-orange-500/20" },
  { action: "Achievement unlocked",    xp: "50-150", icon: "🏆", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20"  },
];

export default function PointsSystem({ xpHistory = [] }) {
  const { isDarkMode } = useTheme();

  const recent = xpHistory.slice(-10).reverse();

  return (
    <div
      className={`rounded-2xl border p-6 ${
        isDarkMode ? "bg-gray-900/80 border-white/10" : "bg-white border-gray-200"
      } shadow-lg`}
    >
      <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
        ⚡ Points System (XP)
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {XP_ACTIONS.map((item) => (
          <div
            key={item.action}
            className={`flex items-center gap-3 p-3 rounded-xl border ${item.bg} ${item.border}`}
          >
            <span className="text-2xl">{item.icon}</span>
            <div className="flex-1">
              <div className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {item.action}
              </div>
            </div>
            <div className={`text-sm font-bold ${item.color}`}>
              +{item.xp} XP
            </div>
          </div>
        ))}
      </div>

      {/* Recent XP history */}
      {recent.length > 0 && (
        <>
          <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
            Recent XP Activity
          </h3>
          <div className="space-y-2">
            {recent.map((h, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-2 rounded-lg ${
                  isDarkMode ? "bg-white/5" : "bg-gray-50"
                }`}
              >
                <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {h.reason}
                </span>
                <span className="text-sm font-bold text-amber-400">+{h.amount} XP</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
