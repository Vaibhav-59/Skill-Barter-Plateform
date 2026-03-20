// components/gamification/RewardsSection.jsx
import { useTheme } from "../../hooks/useTheme";

const REWARDS = [
  {
    id: "badge_pack",
    name: "Exclusive Badge Pack",
    description: "Unlock a set of limited-edition badges",
    icon: "🏅",
    cost: "500 XP",
    type: "badge",
    color: "from-amber-500 to-orange-500",
    bgDark: "bg-amber-500/10 border-amber-500/20",
    bgLight: "bg-amber-50 border-amber-200",
  },
  {
    id: "xp_boost",
    name: "2× XP Boost",
    description: "Double your XP earnings for 24 hours",
    icon: "⚡",
    cost: "300 XP",
    type: "boost",
    color: "from-yellow-400 to-amber-500",
    bgDark: "bg-yellow-500/10 border-yellow-500/20",
    bgLight: "bg-yellow-50 border-yellow-200",
  },
  {
    id: "bonus_credits",
    name: "Bonus Time Credits",
    description: "Earn 2 extra time credits for your wallet",
    icon: "💎",
    cost: "400 XP",
    type: "credits",
    color: "from-cyan-400 to-blue-500",
    bgDark: "bg-cyan-500/10 border-cyan-500/20",
    bgLight: "bg-cyan-50 border-cyan-200",
  },
  {
    id: "profile_frame",
    name: "Golden Profile Frame",
    description: "Show off a golden frame around your avatar",
    icon: "👑",
    cost: "800 XP",
    type: "cosmetic",
    color: "from-yellow-500 to-yellow-600",
    bgDark: "bg-yellow-600/10 border-yellow-600/20",
    bgLight: "bg-yellow-50 border-yellow-200",
  },
  {
    id: "streak_shield",
    name: "Streak Shield",
    description: "Protect your streak for 1 missed day",
    icon: "🛡️",
    cost: "250 XP",
    type: "shield",
    color: "from-violet-500 to-purple-600",
    bgDark: "bg-violet-500/10 border-violet-500/20",
    bgLight: "bg-violet-50 border-violet-200",
  },
  {
    id: "mentor_tag",
    name: "Mentor Tag",
    description: "Show a 'Mentor' tag on your public profile",
    icon: "🧑‍🏫",
    cost: "1000 XP",
    type: "cosmetic",
    color: "from-pink-500 to-rose-600",
    bgDark: "bg-pink-500/10 border-pink-500/20",
    bgLight: "bg-pink-50 border-pink-200",
  },
];

export default function RewardsSection({ xp = 0 }) {
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
            🎁 Rewards Store
          </h2>
          <p className={`text-sm mt-0.5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            Spend your XP on exclusive rewards
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-bold ${isDarkMode ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-600"}`}>
          ⚡ {xp.toLocaleString()} XP available
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {REWARDS.map((reward) => {
          const costNum = parseInt(reward.cost.replace(/\D/g, ""), 10);
          const canAfford = xp >= costNum;

          return (
            <div
              key={reward.id}
              className={`rounded-xl border p-4 transition-all duration-300 ${
                isDarkMode ? `${reward.bgDark}` : `${reward.bgLight}`
              } ${canAfford ? "hover:scale-105 hover:shadow-lg cursor-pointer" : "opacity-60"}`}
            >
              <div className="text-3xl mb-3">{reward.icon}</div>
              <div className={`font-bold mb-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {reward.name}
              </div>
              <div className={`text-xs mb-3 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                {reward.description}
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-bold bg-gradient-to-r ${reward.color} bg-clip-text text-transparent`}>
                  {reward.cost}
                </span>
                <button
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    canAfford
                      ? `bg-gradient-to-r ${reward.color} text-white hover:opacity-90 shadow-md`
                      : isDarkMode
                      ? "bg-white/10 text-gray-500 cursor-not-allowed"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                  disabled={!canAfford}
                  title={canAfford ? "Redeem reward" : "Not enough XP"}
                >
                  {canAfford ? "Redeem" : "🔒 Need more XP"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className={`text-xs mt-4 text-center ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}>
        Coming soon: Daily spin wheel, seasonal rewards, XP multipliers &amp; more 🚀
      </p>
    </div>
  );
}
