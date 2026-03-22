// components/resources/TrendingResources.jsx
import { TrendingUp, Eye, Heart, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SECTION_META = [
  { key: "mostViewed", label: "Most Viewed",  icon: <Eye    className="w-4 h-4" />, color: "#3b82f6" },
  { key: "mostLiked",  label: "Most Liked",   icon: <Heart  className="w-4 h-4" />, color: "#ef4444" },
  { key: "recent",     label: "Newly Added",  icon: <Clock  className="w-4 h-4" />, color: "#10b981" },
];

function MiniCard({ resource, index, isDarkMode, onView, accentColor }) {
  const card = isDarkMode ? "bg-gray-800/50 border-slate-700/30 hover:border-slate-500/50" : "bg-gray-50 border-gray-200 hover:border-emerald-300";
  return (
    <div
      onClick={() => onView(resource._id)}
      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md group ${card}`}
    >
      <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0"
        style={{ background: accentColor }}>
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold line-clamp-1 group-hover:text-emerald-400 transition-colors ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          {resource.title}
        </p>
        <p className={`text-xs mt-0.5 ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>{resource.category}</p>
      </div>
    </div>
  );
}

export default function TrendingResources({ data, isDarkMode, onView }) {
  const card = isDarkMode ? "bg-gray-900/80 border-slate-700/40" : "bg-white border-gray-200";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-5 h-5 text-emerald-400" />
        <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Trending Now</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SECTION_META.map(({ key, label, icon, color }) => (
          <div key={key} className={`rounded-2xl border p-5 ${card}`}>
            <div className="flex items-center gap-2 mb-4">
              <span style={{ color }}>{icon}</span>
              <h3 className={`font-bold text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>{label}</h3>
            </div>
            <div className="space-y-2">
              {(data[key] || []).length === 0 ? (
                <p className={`text-sm ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>No data yet</p>
              ) : (
                (data[key] || []).map((r, i) => (
                  <MiniCard key={r._id} resource={r} index={i} isDarkMode={isDarkMode} onView={onView} accentColor={color} />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
