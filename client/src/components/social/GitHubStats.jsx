import { useTheme } from "../../hooks/useTheme";

export default function GitHubStats({ githubData, username }) {
  const { isDarkMode } = useTheme();

  if (!githubData) return null;

  return (
    <div className={`p-6 rounded-2xl border transition-all duration-300 mt-6 ${
      isDarkMode 
        ? "bg-slate-900/60 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]" 
        : "bg-indigo-50 border-indigo-100 shadow-sm"
    }`}>
      <div className="flex items-center space-x-3 mb-6 border-b pb-4 border-indigo-500/10">
        <svg className="w-6 h-6 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.332-5.467-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
        <h3 className={`font-bold text-lg ${isDarkMode ? "text-indigo-400" : "text-indigo-900"}`}>
          GitHub Activity Analysis
        </h3>
        {username && (
          <span className={`text-sm py-1 px-3 rounded-full ${isDarkMode ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-200 text-indigo-800"}`}>
            @{username}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl ${isDarkMode ? "bg-slate-800/80 border border-slate-700/50" : "bg-white border border-gray-200"}`}>
          <div className="text-sm text-slate-500 mb-1">Public Repos</div>
          <div className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            {githubData.reposCount}
          </div>
        </div>
        
        <div className={`p-4 rounded-xl ${isDarkMode ? "bg-slate-800/80 border border-slate-700/50" : "bg-white border border-gray-200"}`}>
          <div className="text-sm text-slate-500 mb-1">Total Stars</div>
          <div className={`text-2xl font-bold flex items-center ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            <svg className="w-5 h-5 text-amber-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {githubData.stars}
          </div>
        </div>

        <div className={`col-span-2 p-4 rounded-xl flex flex-col justify-center ${isDarkMode ? "bg-slate-800/80 border border-slate-700/50" : "bg-white border border-gray-200"}`}>
          <div className="text-sm text-slate-500 mb-2">Top Languages Evaluated</div>
          <div className="flex flex-wrap gap-2">
            {githubData.languages && githubData.languages.length > 0 ? (
              githubData.languages.map(lang => (
                <span key={lang} className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  isDarkMode ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20" : "bg-indigo-100 text-indigo-700"
                }`}>
                  {lang}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-500 italic">No significant languages detected</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
