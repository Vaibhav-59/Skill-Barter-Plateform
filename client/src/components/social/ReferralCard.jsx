import { useTheme } from "../../hooks/useTheme";

export default function ReferralCard({ users, onSimulateReward }) {
  const { isDarkMode } = useTheme();

  return (
    <div className={`mt-8 p-6 lg:p-8 rounded-3xl border transition-all duration-300 shadow-xl ${
      isDarkMode 
        ? "bg-gray-800/40 border-slate-700/50" 
        : "bg-white border-gray-200"
    }`}>
      <h3 className={`text-xl font-bold mb-6 flex items-center ${isDarkMode ? "text-white" : "text-gray-900"}`}>
        <svg className="w-6 h-6 mr-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        Referral Tracking
      </h3>

      {(!users || users.length === 0) ? (
        <div className={`py-12 text-center rounded-2xl border border-dashed ${
          isDarkMode ? "border-slate-700 text-slate-500 bg-gray-800/20" : "border-gray-300 text-gray-400 bg-gray-50/50"
        }`}>
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
          <p>No successful referrals yet. Share your link to start earning!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className={`text-xs uppercase font-semibold tracking-wider ${
              isDarkMode ? "text-slate-400 bg-slate-800/80" : "text-gray-500 bg-gray-100/80"
            }`}>
              <tr>
                <th className="px-6 py-4 rounded-l-xl">Invited User</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Credits Earned</th>
                <th className="px-6 py-4 rounded-r-xl">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((ref, i) => (
                <tr key={ref._id} className={`border-b border-opacity-50 transition-colors duration-200 ${
                  isDarkMode 
                    ? "border-slate-700/50 hover:bg-slate-800/30" 
                    : "border-gray-100 hover:bg-gray-50"
                }`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold mr-3 overflow-hidden">
                        {ref.avatar ? (
                          <img src={ref.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          ref.username.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className={`font-semibold ${isDarkMode ? "text-slate-200" : "text-gray-800"}`}>
                        {ref.username}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      ref.status === "Completed Exchange" ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30" :
                      ref.status === "Completed Session" ? "bg-amber-500/20 text-amber-500 border border-amber-500/30" :
                      "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    }`}>
                      {ref.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center font-bold text-emerald-500">
                      +{ref.creditsEarned}
                      <svg className="w-4 h-4 ml-1 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* Simulated rewards strictly for proof of concept logic since standard progression wasn't physically required */}
                    {ref.status !== "Completed Exchange" && (
                      <button 
                        onClick={() => onSimulateReward(ref._id, ref.status === 'Joined' ? 'Completed Session' : 'Completed Exchange')}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                          isDarkMode ? "bg-slate-700 hover:bg-slate-600 text-slate-300" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                        }`}
                      >
                        Simulate Progress
                      </button>
                    )}
                    {ref.status === "Completed Exchange" && (
                      <span className="text-xs text-slate-500 italic">Maxed Out</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
