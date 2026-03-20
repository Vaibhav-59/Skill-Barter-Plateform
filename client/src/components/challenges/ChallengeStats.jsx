// components/challenges/ChallengeStats.jsx
import { Trophy, Zap, Target, TrendingUp } from "lucide-react";

export default function ChallengeStats({ stats, isDarkMode }) {
  const items = [
    {
      label: "Completed",
      value: stats?.totalCompleted ?? 0,
      icon: Trophy,
      gradient: "from-amber-500 to-yellow-600",
      bg: isDarkMode ? "bg-amber-500/10 border-amber-500/20" : "bg-amber-50 border-amber-200",
      text: isDarkMode ? "text-amber-400" : "text-amber-600",
    },
    {
      label: "Active",
      value: stats?.activeSubmissions ?? 0,
      icon: Target,
      gradient: "from-blue-500 to-cyan-600",
      bg: isDarkMode ? "bg-blue-500/10 border-blue-500/20" : "bg-blue-50 border-blue-200",
      text: isDarkMode ? "text-blue-400" : "text-blue-600",
    },
    {
      label: "XP Earned",
      value: `${stats?.xpEarned ?? 0}`,
      icon: Zap,
      gradient: "from-fuchsia-500 to-purple-600",
      bg: isDarkMode ? "bg-fuchsia-500/10 border-fuchsia-500/20" : "bg-fuchsia-50 border-fuchsia-200",
      text: isDarkMode ? "text-fuchsia-400" : "text-fuchsia-600",
    },
    {
      label: "Challenges Won",
      value: stats?.challengesCompleted ?? 0,
      icon: TrendingUp,
      gradient: "from-emerald-500 to-teal-600",
      bg: isDarkMode ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-200",
      text: isDarkMode ? "text-emerald-400" : "text-emerald-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {items.map(({ label, value, icon: Icon, bg, text, gradient }) => (
        <div
          key={label}
          className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:scale-105 hover:shadow-lg ${bg}`}
        >
          {/* Gradient orb */}
          <div
            className={`absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-xl`}
          />
          <div className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${gradient} mb-3 shadow-md`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className={`text-3xl font-extrabold ${text} mb-1`}>{value}</div>
          <div
            className={`text-sm font-medium ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}
          >
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
