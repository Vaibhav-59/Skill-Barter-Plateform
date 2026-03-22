// components/resources/RecommendedResources.jsx
import { Sparkles } from "lucide-react";
import ResourceCard from "./ResourceCard";

export default function RecommendedResources({ resources, loading, onLike, onBookmark, likedIds, bookmarkedIds, isDarkMode, onView }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)" }}>
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Recommended For You</h2>
          <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>Personalized based on your skills and learning goals</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`rounded-2xl border ${isDarkMode ? "bg-gray-900/80 border-slate-700/40" : "bg-white border-gray-200"} animate-pulse`} style={{ height: 280 }} />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className={`flex flex-col items-center py-20 ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
          <Sparkles className="w-12 h-12 mb-3 opacity-30" />
          <p className="font-semibold">No recommendations yet</p>
          <p className="text-sm mt-1">Complete your profile with skills to get personalized suggestions</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {resources.map(r => (
            <ResourceCard
              key={r._id} resource={r}
              isLiked={likedIds.has(r._id)}
              isBookmarked={bookmarkedIds.has(r._id)}
              onLike={() => onLike(r._id)}
              onBookmark={() => onBookmark(r._id)}
              onView={() => onView(r._id)}
              viewMode="grid"
              isDarkMode={isDarkMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}
