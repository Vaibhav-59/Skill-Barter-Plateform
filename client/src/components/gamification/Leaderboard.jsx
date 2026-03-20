// components/gamification/Leaderboard.jsx
import { useTheme } from "../../hooks/useTheme";

const RANK_STYLES = [
  { badge: "🥇", ring: "ring-yellow-400", glow: "shadow-yellow-500/30", text: "text-yellow-400" },
  { badge: "🥈", ring: "ring-gray-400",   glow: "shadow-gray-400/30",   text: "text-gray-400"   },
  { badge: "🥉", ring: "ring-amber-600",  glow: "shadow-amber-600/30",  text: "text-amber-500"  },
];

function Avatar({ name, profileImage }) {
  const initials = name?.charAt(0)?.toUpperCase() || "?";
  if (profileImage) {
    return (
      <img
        src={profileImage}
        alt={name}
        className="w-10 h-10 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
      {initials}
    </div>
  );
}

export default function Leaderboard({ entries = [], currentUserId }) {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`rounded-2xl border p-6 ${
        isDarkMode ? "bg-gray-900/80 border-white/10" : "bg-white border-gray-200"
      } shadow-lg`}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            🏆 Leaderboard
          </h2>
          <p className={`text-sm mt-0.5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            Top skill barterers this season
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isDarkMode ? "bg-yellow-500/20 text-yellow-400" : "bg-yellow-100 text-yellow-600"}`}>
          Top {entries.length}
        </span>
      </div>

      {entries.length === 0 ? (
        <div className={`text-center py-12 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
          <div className="text-5xl mb-3">🏆</div>
          <p>No rankings yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, idx) => {
            const isTop3 = idx < 3;
            const rank = RANK_STYLES[idx];
            const isMe = entry.userId === currentUserId;

            return (
              <div
                key={entry.userId || idx}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isMe
                    ? isDarkMode
                      ? "bg-violet-500/20 border border-violet-500/30"
                      : "bg-violet-50 border border-violet-200"
                    : isDarkMode
                    ? "bg-white/5 hover:bg-white/10"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                {/* Rank */}
                <div className="w-8 text-center flex-shrink-0">
                  {isTop3 ? (
                    <span className="text-2xl">{rank.badge}</span>
                  ) : (
                    <span className={`text-sm font-bold ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      #{entry.rank}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <div className={`flex-shrink-0 ${isTop3 ? `ring-2 ${rank.ring} rounded-full shadow-lg ${rank.glow}` : ""}`}>
                  <Avatar name={entry.name} profileImage={entry.profileImage} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold truncate ${isDarkMode ? "text-white" : "text-gray-900"} ${isMe ? "text-violet-400" : ""}`}>
                    {entry.name} {isMe && <span className="text-xs font-normal">(You)</span>}
                  </div>
                  <div className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                    Lv {entry.level} · {entry.sessionsCompleted} sessions · {entry.badges} badges
                  </div>
                </div>

                {/* XP */}
                <div className="text-right flex-shrink-0">
                  <div className={`font-bold text-sm ${isTop3 ? rank.text : isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {entry.xp?.toLocaleString()} XP
                  </div>
                  {entry.learningStreak > 0 && (
                    <div className="text-xs text-orange-400">
                      🔥 {entry.learningStreak}d
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
