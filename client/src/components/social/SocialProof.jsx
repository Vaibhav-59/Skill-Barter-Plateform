import { useTheme } from "../../hooks/useTheme";

export default function SocialProof({ connectedCount }) {
  const { isDarkMode } = useTheme();

  return (
    <div className={`mt-10 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between shadow-xl ${
      isDarkMode ? "bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/20" : "bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200"
    }`}>
      <div className="flex items-center space-x-4 mb-4 md:mb-0">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur opacity-30 animate-pulse"></div>
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center relative shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>
        <div>
          <h3 className={`text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent`}>
            Social verification Proof
          </h3>
          <p className={`${isDarkMode ? "text-slate-300" : "text-gray-700"} font-medium`}>
            {connectedCount} Accounts Connected ✔
          </p>
        </div>
      </div>
      
      <div className="text-center md:text-right">
        <div className={`inline-flex items-center px-4 py-2 rounded-full font-bold shadow-md ${
          connectedCount >= 2 
            ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30" 
            : connectedCount === 1 
              ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
              : "bg-slate-500/20 text-slate-500 border border-slate-500/30"
        }`}>
          {connectedCount >= 2 ? "High Trust Profile" : connectedCount === 1 ? "Medium Trust Profile" : "Unverified Profile"}
        </div>
        <p className={`text-xs mt-2 max-w-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
          Connecting accounts verifies your expertise and increases your chances of finding matches.
        </p>
      </div>
    </div>
  );
}
