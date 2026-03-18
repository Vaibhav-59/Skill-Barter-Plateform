import { useTheme } from "../../hooks/useTheme";

const StatCard = ({ label, value, icon, color, isDarkMode }) => (
  <div
    className={`relative flex flex-col gap-2 rounded-2xl p-5 overflow-hidden border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
      isDarkMode
        ? "bg-white/5 border-white/10 hover:border-white/20"
        : "bg-white border-gray-100 hover:border-gray-200 shadow-sm"
    }`}
  >
    {/* gradient glow */}
    <div className={`absolute -top-6 -right-6 w-24 h-24 ${color} rounded-full blur-2xl opacity-20`} />
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} bg-opacity-20`}>
      <span className="text-xl">{icon}</span>
    </div>
    <p className={`text-sm font-medium ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>{label}</p>
    <p className={`text-3xl font-extrabold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{value}</p>
  </div>
);

export default function WalletSummary({ wallet, loading }) {
  const { isDarkMode } = useTheme();

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`h-36 rounded-2xl animate-pulse ${isDarkMode ? "bg-white/5" : "bg-gray-100"}`}
          />
        ))}
      </div>
    );
  }

  const { balance = 0, earnedCredits = 0, spentCredits = 0, totalCredits = 0 } = wallet || {};

  const stats = [
    {
      label: "Current Balance",
      value: balance >= 0 ? `+${balance}` : balance,
      icon: "⚡",
      color: balance >= 0 ? "bg-emerald-500" : "bg-red-500",
    },
    {
      label: "Credits Earned",
      value: `+${earnedCredits}`,
      icon: "💰",
      color: "bg-violet-500",
    },
    {
      label: "Credits Spent",
      value: `-${spentCredits}`,
      icon: "📚",
      color: "bg-amber-500",
    },
    {
      label: "Total Activity",
      value: totalCredits,
      icon: "🏆",
      color: "bg-cyan-500",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Hero balance card */}
      <div
        className="relative rounded-3xl p-8 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 40%, #0ea5e9 100%)",
        }}
      >
        {/* decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <p className="text-violet-200 text-sm font-semibold uppercase tracking-widest mb-1">
              Time Banking Wallet
            </p>
            <div className="flex items-end gap-3">
              <span className="text-6xl sm:text-7xl font-black text-white leading-none">
                {balance}
              </span>
              <span className="text-violet-300 text-xl font-semibold mb-2">Credits</span>
            </div>
            <p className="text-violet-200 text-sm mt-2">
              {balance >= 0 ? `You have ${balance} credits available to spend.` : `You owe ${Math.abs(balance)} credits.`}
            </p>
          </div>

          {/* Mini ring chart */}
          <div className="flex-shrink-0">
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                {earnedCredits + spentCredits > 0 && (
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="rgba(255,255,255,0.9)"
                    strokeWidth="3"
                    strokeDasharray={`${(earnedCredits / (earnedCredits + spentCredits)) * 100} 100`}
                    strokeLinecap="round"
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <span className="text-xs font-semibold opacity-70">Earn</span>
                <span className="text-sm font-bold">
                  {earnedCredits + spentCredits > 0
                    ? `${Math.round((earnedCredits / (earnedCredits + spentCredits)) * 100)}%`
                    : "0%"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} isDarkMode={isDarkMode} />
        ))}
      </div>
    </div>
  );
}
