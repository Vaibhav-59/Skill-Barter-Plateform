// components/ExpertListItem.jsx
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";

const StarRating = ({ rating }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? "text-amber-400" : "text-slate-600"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

export default function ExpertListItem({ expert, skillName }) {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const handleClick = () => {
    navigate(`/skills/explore/${encodeURIComponent(skillName)}/expert/${expert._id}`);
  };

  const levelColors = {
    Beginner: "from-green-400 to-emerald-500",
    Intermediate: "from-blue-400 to-cyan-500",
    Advanced: "from-violet-400 to-purple-500",
    Expert: "from-amber-400 to-orange-500",
  };

  const levelColor = levelColors[expert.skillLevel] || "from-emerald-400 to-teal-500";

  return (
    <div
      onClick={handleClick}
      id={`expert-item-${expert._id}`}
      className={`group flex items-center gap-4 p-5 rounded-2xl border cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
        isDarkMode
          ? "bg-gray-900/50 backdrop-blur-xl border-gray-800/60 hover:border-violet-500/30 hover:bg-gray-900/80"
          : "bg-white/80 backdrop-blur-xl border-gray-200 hover:border-violet-300 hover:bg-white shadow-md"
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-violet-500/30 shadow-lg">
          {expert.profileImage ? (
            <img
              src={expert.profileImage}
              alt={expert.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${levelColor} flex items-center justify-center text-white text-xl font-bold`}>
              {expert.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          )}
        </div>
        {/* Online indicator */}
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-gray-900 animate-pulse shadow-lg shadow-emerald-400/30" />
      </div>

      {/* Expert Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={`font-bold text-base truncate group-hover:text-violet-400 transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            {expert.name}
          </h3>
          {expert.experienceLevel && (
            <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${levelColor} text-white capitalize`}>
              {expert.experienceLevel}
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-2">
          <StarRating rating={expert.rating} />
          <span className={`text-xs font-semibold ${isDarkMode ? "text-amber-400" : "text-amber-500"}`}>
            {expert.rating > 0 ? expert.rating.toFixed(1) : "New"}
          </span>
          {expert.reviewCount > 0 && (
            <span className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              ({expert.reviewCount} {expert.reviewCount === 1 ? "review" : "reviews"})
            </span>
          )}
        </div>

        {/* Skill Tags */}
        <div className="flex flex-wrap gap-1.5">
          {expert.teachSkills?.slice(0, 3).map((sk, i) => (
            <span
              key={i}
              className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                sk.name.toLowerCase() === skillName?.toLowerCase()
                  ? `bg-gradient-to-r ${levelColor} text-white font-bold`
                  : isDarkMode
                  ? "bg-gray-800/80 text-slate-400 border border-gray-700/50"
                  : "bg-gray-100 text-slate-600 border border-gray-200"
              }`}
            >
              {sk.name}
            </span>
          ))}
          {expert.teachSkills?.length > 3 && (
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${isDarkMode ? "bg-gray-800 text-slate-400" : "bg-gray-100 text-slate-500"}`}>
              +{expert.teachSkills.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Skill level + Arrow */}
      <div className="flex-shrink-0 flex flex-col items-end gap-2">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full bg-gradient-to-r ${levelColor} text-white`}>
          {expert.skillLevel}
        </span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:translate-x-1 group-hover:bg-violet-500/20 ${
          isDarkMode ? "bg-gray-800 text-slate-400" : "bg-gray-100 text-slate-500"
        }`}>
          <svg className="w-4 h-4 group-hover:text-violet-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
