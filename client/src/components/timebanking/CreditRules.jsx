import { useTheme } from "../../hooks/useTheme";

const rules = [
  {
    icon: "⏱️",
    title: "1 Hour = 1 Credit",
    desc: "Every hour you spend teaching earns you exactly one time credit. Sessions are logged by start and end time.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: "🎓",
    title: "Earn by Teaching",
    desc: "When you teach a skill and the session is marked completed, credits are automatically added to your wallet.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: "📖",
    title: "Spend to Learn",
    desc: "Learning from others costs credits equal to the session duration. You need sufficient balance to book sessions.",
    color: "from-cyan-500 to-blue-600",
  },
  {
    icon: "🤝",
    title: "Credit Exchange",
    desc: "Low on credits? You can request a session with a credit debt — the platform tracks what you owe.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: "⚡",
    title: "Welcome Bonus",
    desc: "Every new user starts with 5 free credits to get started learning right away without needing to teach first.",
    color: "from-rose-500 to-pink-600",
  },
  {
    icon: "🔄",
    title: "Credits Never Expire",
    desc: "Your time credits are permanent and cumulative. Build your balance over time by teaching more sessions.",
    color: "from-indigo-500 to-violet-600",
  },
];

export default function CreditRules() {
  const { isDarkMode } = useTheme();
  return (
    <div
      className={`rounded-3xl border p-6 ${
        isDarkMode ? "bg-white/[0.03] border-white/[0.07]" : "bg-white border-gray-100 shadow-sm"
      }`}
    >
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xl">
            📜
          </div>
          <div>
            <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              How Time Banking Works
            </h2>
            <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
              Rules & guidelines for the credit system
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rules.map((rule) => (
          <div
            key={rule.title}
            className={`group relative rounded-2xl p-4 border transition-all duration-200 hover:scale-[1.02] overflow-hidden ${
              isDarkMode
                ? "bg-white/[0.03] border-white/[0.07] hover:border-white/15"
                : "bg-gray-50 border-gray-100 hover:border-gray-200 hover:shadow"
            }`}
          >
            {/* gradient accent */}
            <div className={`absolute top-0 left-0 w-full h-1 rounded-t-2xl bg-gradient-to-r ${rule.color}`} />

            <div className="text-2xl mb-3 mt-1">{rule.icon}</div>
            <h3 className={`font-bold text-sm mb-1.5 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              {rule.title}
            </h3>
            <p className={`text-xs leading-relaxed ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
              {rule.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Quick reference table */}
      <div
        className={`mt-6 rounded-2xl border overflow-hidden ${
          isDarkMode ? "border-white/10" : "border-gray-100"
        }`}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className={isDarkMode ? "bg-white/5" : "bg-gray-50"}>
              <th className={`px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                Action
              </th>
              <th className={`px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                Role
              </th>
              <th className={`px-4 py-3 text-right font-semibold text-xs uppercase tracking-wider ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                Credits
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? "divide-white/5" : "divide-gray-50"}`}>
            {[
              { action: "Complete 1-hour session", role: "Teacher", credits: "+1", color: "text-emerald-400" },
              { action: "Complete 1-hour session", role: "Learner", credits: "-1", color: "text-rose-400" },
              { action: "Complete 2-hour session", role: "Teacher", credits: "+2", color: "text-emerald-400" },
              { action: "New account signup", role: "Any", credits: "+5", color: "text-violet-400" },
            ].map((row, i) => (
              <tr key={i} className={`transition-colors ${isDarkMode ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
                <td className={`px-4 py-3 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>{row.action}</td>
                <td className={`px-4 py-3 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>{row.role}</td>
                <td className={`px-4 py-3 text-right font-bold ${row.color}`}>{row.credits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
