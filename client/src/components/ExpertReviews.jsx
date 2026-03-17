// components/ExpertReviews.jsx
import { useTheme } from "../hooks/useTheme";

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <svg
        key={star}
        className={`w-4 h-4 ${star <= rating ? "text-amber-400" : "text-slate-600"}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor(diff / 60000);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "Just now";
};

export default function ExpertReviews({ reviews = [], rating = 0, reviewCount = 0 }) {
  const { isDarkMode } = useTheme();

  // Rating distribution
  const distribution = [5, 4, 3, 2, 1].map((r) => ({
    rating: r,
    count: reviews.filter((rev) => rev.rating === r).length,
  }));
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  return (
    <div
      className={`rounded-2xl border p-6 ${
        isDarkMode
          ? "bg-gray-900/50 backdrop-blur-xl border-gray-800/60"
          : "bg-white/80 backdrop-blur-xl border-gray-200 shadow-md"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-lg">⭐</span>
        </div>
        <div>
          <h3 className={`font-bold text-base ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            Reviews & Ratings
          </h3>
          <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
            {reviewCount} total review{reviewCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {reviewCount > 0 ? (
        <>
          {/* Rating Summary */}
          <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-800/30">
            <div className="text-center">
              <div className="text-5xl font-black bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                {rating.toFixed(1)}
              </div>
              <StarRating rating={Math.round(rating)} />
              <p className={`text-xs mt-1 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                out of 5
              </p>
            </div>
            <div className="flex-1 space-y-1.5">
              {distribution.map(({ rating: r, count }) => (
                <div key={r} className="flex items-center gap-2">
                  <span className={`text-xs w-3 text-right ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>{r}</span>
                  <svg className="w-3 h-3 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <div className={`flex-1 h-2 rounded-full overflow-hidden ${isDarkMode ? "bg-gray-800" : "bg-gray-200"}`}>
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-700"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs w-4 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review Cards */}
          <div className="space-y-4">
            {reviews.slice(0, 5).map((review) => (
              <div
                key={review._id}
                className={`p-4 rounded-xl border transition-all duration-300 ${
                  isDarkMode
                    ? "bg-gray-800/40 border-gray-700/40 hover:border-gray-600/50"
                    : "bg-gray-50 border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {review.reviewer?.profileImage ? (
                      <img
                        src={review.reviewer.profileImage}
                        alt={review.reviewer.name}
                        className="w-9 h-9 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl flex items-center justify-center text-white text-sm font-bold">
                        {review.reviewer?.name?.charAt(0) || "U"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-semibold text-sm truncate ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                        {review.reviewer?.name || "Anonymous"}
                      </span>
                      <span className={`text-xs ml-2 flex-shrink-0 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                        {timeAgo(review.createdAt)}
                      </span>
                    </div>
                    <StarRating rating={review.rating} />
                    <p className={`text-sm mt-2 leading-relaxed ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                      {review.comment}
                    </p>
                    {/* Additional metrics */}
                    {(review.wouldRecommend !== null && review.wouldRecommend !== undefined) && (
                      <div className="flex items-center gap-1 mt-2">
                        <span className={`text-xs ${review.wouldRecommend ? "text-emerald-400" : "text-red-400"}`}>
                          {review.wouldRecommend ? "👍 Would recommend" : "👎 Would not recommend"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">⭐</div>
          <p className={`font-medium ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>No reviews yet</p>
          <p className={`text-sm mt-1 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
            Be the first to connect and review this expert
          </p>
        </div>
      )}
    </div>
  );
}
