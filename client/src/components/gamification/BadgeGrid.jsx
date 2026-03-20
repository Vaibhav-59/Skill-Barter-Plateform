// components/gamification/BadgeGrid.jsx
import { useTheme } from "../../hooks/useTheme";

const CATEGORY_COLORS = {
  session:      { bg: "from-violet-500/20 to-purple-500/20",   border: "border-violet-500/30",  text: "text-violet-400" },
  teaching:     { bg: "from-blue-500/20 to-cyan-500/20",       border: "border-blue-500/30",    text: "text-blue-400"   },
  learning:     { bg: "from-emerald-500/20 to-teal-500/20",    border: "border-emerald-500/30", text: "text-emerald-400"},
  streak:       { bg: "from-orange-500/20 to-red-500/20",      border: "border-orange-500/30",  text: "text-orange-400" },
  verification: { bg: "from-amber-500/20 to-yellow-500/20",    border: "border-amber-500/30",   text: "text-amber-400"  },
  social:       { bg: "from-sky-500/20 to-indigo-500/20",      border: "border-sky-500/30",     text: "text-sky-400"    },
  challenge:    { bg: "from-pink-500/20 to-rose-500/20",       border: "border-pink-500/30",    text: "text-pink-400"   },
};

const LIGHT_CATEGORY_COLORS = {
  session:      { bg: "bg-violet-50",   border: "border-violet-200",  text: "text-violet-600" },
  teaching:     { bg: "bg-blue-50",     border: "border-blue-200",    text: "text-blue-600"   },
  learning:     { bg: "bg-emerald-50",  border: "border-emerald-200", text: "text-emerald-600"},
  streak:       { bg: "bg-orange-50",   border: "border-orange-200",  text: "text-orange-600" },
  verification: { bg: "bg-amber-50",    border: "border-amber-200",   text: "text-amber-600"  },
  social:       { bg: "bg-sky-50",      border: "border-sky-200",     text: "text-sky-600"    },
  challenge:    { bg: "bg-pink-50",     border: "border-pink-200",    text: "text-pink-600"   },
};

export default function BadgeGrid({ badges = [], badgeCatalogue = [] }) {
  const { isDarkMode } = useTheme();

  const earnedIds = new Set(badges.map((b) => b.id || b.badgeName));

  // Merge catalogue with earned status
  const allBadges = badgeCatalogue.map((cat) => {
    const earned = badges.find((b) => b.id === cat.id || b.badgeName === cat.badgeName);
    return {
      ...cat,
      earned: !!earned,
      earnedAt: earned?.earnedAt,
    };
  });

  // Sort: earned first
  const sorted = [...allBadges].sort((a, b) => b.earned - a.earned);

  return (
    <div className={`rounded-2xl border p-6 ${isDarkMode ? "bg-gray-900/80 border-white/10" : "bg-white border-gray-200"} shadow-lg`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Badges & Achievements
          </h2>
          <p className={`text-sm mt-0.5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            {badges.length} / {badgeCatalogue.length} earned
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${isDarkMode ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-600"}`}>
          🏅 {badges.length} Badges
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {sorted.map((badge) => {
          const colors = isDarkMode
            ? CATEGORY_COLORS[badge.category] || CATEGORY_COLORS.session
            : LIGHT_CATEGORY_COLORS[badge.category] || LIGHT_CATEGORY_COLORS.session;

          return (
            <div
              key={badge.id}
              className={`relative rounded-xl p-4 border text-center transition-all duration-300 ${
                badge.earned
                  ? `bg-gradient-to-br ${isDarkMode ? colors.bg : ""} ${isDarkMode ? "" : colors.bg} ${colors.border} shadow-md hover:scale-105`
                  : isDarkMode
                  ? "bg-white/3 border-white/10 opacity-40 grayscale"
                  : "bg-gray-50 border-gray-200 opacity-50 grayscale"
              }`}
            >
              {badge.earned && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-xs">
                  ✓
                </div>
              )}
              <div className="text-3xl mb-2">{badge.icon}</div>
              <div className={`text-sm font-bold mb-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {badge.badgeName}
              </div>
              <div className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                {badge.description}
              </div>
              {badge.earned && badge.earnedAt && (
                <div className={`text-xs mt-2 ${colors.text}`}>
                  {new Date(badge.earnedAt).toLocaleDateString()}
                </div>
              )}
              {!badge.earned && (
                <div className={`text-xs mt-2 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                  🔒 Locked
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
