// components/community/TrendingTopics.jsx
import { TrendingUp, Hash } from "lucide-react";

const DEFAULT_TAGS = [
  { tag: "React", count: 124 }, { tag: "Python", count: 98 },
  { tag: "JavaScript", count: 87 }, { tag: "AI", count: 76 },
  { tag: "UI/UX", count: 65 }, { tag: "Node.js", count: 54 },
  { tag: "MongoDB", count: 43 }, { tag: "TypeScript", count: 38 },
  { tag: "DevOps", count: 32 }, { tag: "Next.js", count: 28 },
];

export default function TrendingTopics({ tags, isDarkMode, onTagClick, activeTag }) {
  const displayTags = (tags && tags.length > 0) ? tags : DEFAULT_TAGS;
  const card = isDarkMode ? "bg-gray-900/90 border-slate-700/50" : "bg-white border-gray-200";

  return (
    <div className={`rounded-2xl border p-5 ${card}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)" }}>
          <TrendingUp className="w-3.5 h-3.5 text-white" />
        </div>
        <h3 className={`font-bold text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>Trending Topics</h3>
      </div>

      <div className="space-y-1.5">
        {displayTags.map(({ tag, count }, i) => (
          <button
            key={tag}
            onClick={() => onTagClick(tag)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 text-left group ${
              activeTag === tag
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                : isDarkMode
                  ? "hover:bg-gray-800/70 text-slate-300 hover:text-white border border-transparent hover:border-slate-600/30"
                  : "hover:bg-gray-50 text-gray-700 border border-transparent hover:border-gray-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`text-xs font-mono font-bold w-4 ${isDarkMode ? "text-slate-600" : "text-gray-400"}`}>
                {(i + 1).toString().padStart(2, "0")}
              </span>
              <Hash className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
              <span className="text-sm font-semibold">{tag}</span>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
              activeTag === tag
                ? "bg-emerald-500/20 text-emerald-400"
                : isDarkMode ? "bg-gray-800/60 text-slate-500" : "bg-gray-100 text-gray-400"
            }`}>{count}</span>
          </button>
        ))}
      </div>

      {activeTag && (
        <button
          onClick={() => onTagClick("")}
          className="w-full mt-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors border border-slate-600/30 hover:border-slate-500"
        >
          Clear filter
        </button>
      )}
    </div>
  );
}
