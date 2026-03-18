import { useTheme } from "../../hooks/useTheme";

export default function SocialCard({ platform, isConnected, url, icon, onConnect, onRemove }) {
  const { isDarkMode } = useTheme();

  return (
    <div className={`p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg flex items-center justify-between ${
      isDarkMode ? "bg-gray-800/60 border-slate-700/50" : "bg-white border-gray-100"
    }`}>
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${platform.color} shadow-md`}>
          {icon}
        </div>
        <div>
          <h3 className={`font-semibold text-lg ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            {platform.name}
          </h3>
          <div className="flex items-center mt-1 space-x-2">
            {isConnected ? (
              <>
                <span className="text-emerald-500 flex items-center text-sm font-medium">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Connected
                </span>
                <span className={`text-sm max-w-[120px] sm:max-w-[200px] truncate ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                  ({url})
                </span>
              </>
            ) : (
              <span className="text-rose-500 flex items-center text-sm font-medium">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Not Connected
              </span>
            )}
          </div>
        </div>
      </div>
      <div>
        {isConnected ? (
          <button
            onClick={() => onRemove(platform.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              isDarkMode 
                ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20" 
                : "bg-rose-50 text-rose-600 hover:bg-rose-100"
            }`}
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={() => onConnect(platform.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-sm ${
              isDarkMode
                ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200"
            }`}
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
}
