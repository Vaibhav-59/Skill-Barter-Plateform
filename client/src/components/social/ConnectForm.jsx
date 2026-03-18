import { useState, useEffect } from "react";
import { useTheme } from "../../hooks/useTheme";

export default function ConnectForm({ platform, onSave, onCancel, defaultUrl = "" }) {
  const { isDarkMode } = useTheme();
  const [url, setUrl] = useState(defaultUrl);

  useEffect(() => {
    setUrl(defaultUrl);
  }, [defaultUrl]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(platform.id, url);
  };

  return (
    <div className={`p-6 rounded-2xl border ${
      isDarkMode ? "bg-gray-800/80 border-slate-700/50" : "bg-gray-50 border-gray-200"
    } mt-4 relative overflow-hidden`}>
      <div className={`absolute top-0 left-0 w-1 h-full ${platform.color}`}></div>
      
      <div className="flex items-center space-x-3 mb-4">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${platform.color}`}>
          {platform.icon}
        </div>
        <h4 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          Connect {platform.name}
        </h4>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
            Profile URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={`https://${platform.id}.com/username`}
            required
            className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-all duration-300 ${
              isDarkMode 
                ? "bg-gray-900/50 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500" 
                : "bg-white border-gray-300 text-gray-900 focus:border-emerald-500"
            }`}
          />
        </div>
        <div className="flex space-x-3 pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors duration-300 shadow-lg shadow-emerald-500/20"
          >
            {defaultUrl ? "Update" : "Save Connection"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className={`px-5 py-2.5 font-medium rounded-xl transition-colors duration-300 ${
              isDarkMode
                ? "bg-slate-700 hover:bg-slate-600 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
