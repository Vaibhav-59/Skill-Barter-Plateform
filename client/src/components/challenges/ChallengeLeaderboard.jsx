// components/challenges/ChallengeLeaderboard.jsx
import { Crown, Medal, Trophy } from "lucide-react";

function RankIcon({ rank }) {
  if (rank === 1)
    return <Crown className="w-5 h-5 text-yellow-400" />;
  if (rank === 2)
    return <Medal className="w-5 h-5 text-slate-300" />;
  if (rank === 3)
    return <Trophy className="w-5 h-5 text-amber-600" />;
  return (
    <span className="w-7 h-7 flex items-center justify-center text-sm font-bold text-slate-500">
      {rank}
    </span>
  );
}

export default function ChallengeLeaderboard({ data, isDarkMode }) {
  if (!data || data.length === 0) {
    return (
      <div
        className={`text-center py-10 rounded-2xl border ${
          isDarkMode
            ? "bg-gray-900/60 border-gray-800 text-slate-500"
            : "bg-white border-gray-200 text-gray-400"
        }`}
      >
        No leaderboard data yet. Complete challenges to appear here!
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border overflow-hidden ${
        isDarkMode ? "bg-gray-900/60 border-gray-800" : "bg-white border-gray-200"
      }`}
    >
      {/* Header */}
      <div
        className={`px-5 py-3 border-b text-xs font-semibold uppercase tracking-widest grid grid-cols-12 gap-2 ${
          isDarkMode
            ? "border-gray-800 text-slate-500 bg-gray-950/50"
            : "border-gray-100 text-gray-400 bg-gray-50"
        }`}
      >
        <span className="col-span-1">Rank</span>
        <span className="col-span-5">User</span>
        <span className="col-span-2 text-right">Level</span>
        <span className="col-span-2 text-right">XP</span>
        <span className="col-span-2 text-right">Won</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-800/30">
        {data.map((entry, idx) => (
          <div
            key={entry.userId}
            className={`px-5 py-3.5 grid grid-cols-12 gap-2 items-center transition-colors ${
              idx < 3
                ? isDarkMode
                  ? "bg-fuchsia-500/5 hover:bg-fuchsia-500/10"
                  : "bg-fuchsia-50/50 hover:bg-fuchsia-50"
                : isDarkMode
                ? "hover:bg-gray-800/40"
                : "hover:bg-gray-50"
            }`}
          >
            {/* Rank */}
            <div className="col-span-1 flex justify-center">
              <RankIcon rank={entry.rank} />
            </div>

            {/* User */}
            <div className="col-span-5 flex items-center gap-3 min-w-0">
              {entry.profileImage ? (
                <img
                  src={entry.profileImage}
                  alt={entry.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-fuchsia-500/30 flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-white">
                    {entry.name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
              <span
                className={`font-medium text-sm truncate ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {entry.name}
              </span>
            </div>

            {/* Level */}
            <div className="col-span-2 text-right">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  isDarkMode
                    ? "bg-fuchsia-500/10 text-fuchsia-400"
                    : "bg-fuchsia-100 text-fuchsia-600"
                }`}
              >
                Lv.{entry.level}
              </span>
            </div>

            {/* XP */}
            <div
              className={`col-span-2 text-right text-sm font-bold ${
                isDarkMode ? "text-amber-400" : "text-amber-600"
              }`}
            >
              {entry.xp?.toLocaleString()}
            </div>

            {/* Challenges Won */}
            <div
              className={`col-span-2 text-right text-sm font-semibold ${
                isDarkMode ? "text-slate-300" : "text-gray-700"
              }`}
            >
              {entry.challengesCompleted}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
