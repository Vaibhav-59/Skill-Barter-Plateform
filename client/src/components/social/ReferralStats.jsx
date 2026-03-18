import { useTheme } from "../../hooks/useTheme";

export default function ReferralStats({ stats }) {
  const { isDarkMode } = useTheme();

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-4">
      <div className={`p-6 rounded-2xl border transition-all duration-300 ${
        isDarkMode ? "bg-gray-800/60 border-slate-700/50" : "bg-white border-gray-200"
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${isDarkMode ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
        </div>
        <div>
          <h4 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{stats.totalInvited}</h4>
          <p className={`mt-1 font-medium ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>Total Invited Friends</p>
        </div>
      </div>

      <div className={`p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
        isDarkMode ? "bg-emerald-900/20 border-emerald-500/30" : "bg-emerald-50 border-emerald-200"
      }`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${isDarkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-600"}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>
        <div className="relative z-10">
          <h4 className={`text-3xl font-bold text-emerald-500`}>+{stats.creditsEarned}</h4>
          <p className={`mt-1 font-medium ${isDarkMode ? "text-emerald-200/80" : "text-emerald-800/80"}`}>Time Credits Earned</p>
        </div>
      </div>

      <div className={`p-6 rounded-2xl border transition-all duration-300 ${
        isDarkMode ? "bg-gray-800/60 border-slate-700/50" : "bg-white border-gray-200"
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${isDarkMode ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-600"}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>
        <div>
          <h4 className={`text-3xl font-bold ${isDarkMode ? "text-amber-400" : "text-amber-600"}`}>{stats.pendingRewards}</h4>
          <p className={`mt-1 font-medium ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>Pending Rewards</p>
        </div>
      </div>
    </div>
  );
}
