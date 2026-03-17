// components/ExpertProfileHeader.jsx
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";

const StarRating = ({ rating, size = "md" }) => {
  const starClass = size === "lg" ? "w-5 h-5" : "w-4 h-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${starClass} ${star <= Math.round(rating) ? "text-amber-400" : "text-slate-600"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

export default function ExpertProfileHeader({ expert, onMessage, onMatch, skillName }) {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const initials = expert.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "EX";

  const levelColors = {
    beginner: "from-green-400 to-emerald-500",
    intermediate: "from-blue-400 to-cyan-500",
    advanced: "from-violet-400 to-purple-500",
    expert: "from-amber-400 to-orange-500",
  };
  const levelGradient = levelColors[expert.experienceLevel?.toLowerCase()] || "from-violet-400 to-purple-600";

  return (
    <div
      className={`relative rounded-3xl overflow-hidden border shadow-2xl ${
        isDarkMode
          ? "bg-gray-900/60 backdrop-blur-xl border-gray-800/60"
          : "bg-white/80 backdrop-blur-xl border-gray-200 shadow-xl"
      }`}
    >
      {/* Gradient Banner */}
      <div className={`h-32 w-full bg-gradient-to-r ${levelGradient} relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-30">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/20 animate-pulse"
              style={{
                width: `${40 + i * 20}px`,
                height: `${40 + i * 20}px`,
                top: `${-10 + i * 5}px`,
                left: `${i * 15}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: "3s",
              }}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      <div className="px-8 pb-8">
        {/* Avatar */}
        <div className="relative -mt-16 mb-4 flex items-end justify-between">
          <div className="relative">
            <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-violet-500/50 shadow-2xl">
              {expert.profileImage ? (
                <img
                  src={expert.profileImage}
                  alt={expert.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${levelGradient} flex items-center justify-center text-white text-3xl font-black`}>
                  {initials}
                </div>
              )}
            </div>
            {/* Online badge */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full border-3 border-gray-900 animate-pulse shadow-lg shadow-emerald-400/40 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </div>

          {/* Quick action buttons */}
          <div className="flex gap-3 mt-16">
            <button
              id="btn-send-message"
              onClick={onMessage}
              className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-sm font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-violet-500/25"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Message
            </button>
            <button
              id="btn-send-match"
              onClick={onMatch}
              className={`group flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border ${
                isDarkMode
                  ? "bg-gray-800/80 border-gray-700 text-slate-200 hover:border-violet-500/50 hover:bg-gray-800"
                  : "bg-white border-gray-200 text-slate-700 hover:border-violet-400 hover:bg-violet-50"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Match Request
            </button>
          </div>
        </div>

        {/* Name & Info */}
        <div className="space-y-3">
          <div>
            <h1 className={`text-3xl font-black mb-1 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              {expert.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {expert.experienceLevel && (
                <span className={`px-3 py-1 rounded-full text-white text-xs font-bold bg-gradient-to-r ${levelGradient} capitalize`}>
                  {expert.experienceLevel} Level
                </span>
              )}
              {expert.location && (expert.location.city || expert.location.country) && (
                <span className={`flex items-center gap-1.5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                  <span>📍</span>
                  {[expert.location.city, expert.location.country].filter(Boolean).join(", ")}
                </span>
              )}
            </div>
          </div>

          {/* Rating Row */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <StarRating rating={expert.rating} size="lg" />
              <span className="text-amber-400 font-bold text-lg">
                {expert.rating > 0 ? expert.rating.toFixed(1) : "New"}
              </span>
            </div>
            <span className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              •
            </span>
            <span className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              {expert.reviewCount || 0} {expert.reviewCount === 1 ? "review" : "reviews"}
            </span>
          </div>

          {/* Bio */}
          {expert.bio && (
            <p className={`text-sm leading-relaxed max-w-2xl ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
              {expert.bio}
            </p>
          )}

          {/* Availability */}
          {expert.availability && expert.availability.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {expert.availability.slice(0, 5).map((slot, i) => (
                <span
                  key={i}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium ${
                    isDarkMode
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-emerald-50 border-emerald-200 text-emerald-700"
                  }`}
                >
                  🕐 {slot}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
