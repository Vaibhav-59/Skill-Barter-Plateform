// components/SkillCard.jsx
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";

export default function SkillCard({ skill }) {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const { skillName, skillIcon, expertCount, bgColor, category } = skill;

  return (
    <div
      onClick={() => navigate(`/skills/explore/${encodeURIComponent(skillName)}`)}
      id={`skill-card-${skillName.replace(/\s+/g, "-").toLowerCase()}`}
      className={`group relative cursor-pointer rounded-2xl border overflow-hidden transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] shadow-lg hover:shadow-2xl ${
        isDarkMode
          ? `bg-gray-900/60 backdrop-blur-xl ${bgColor?.border || "border-violet-500/30"} hover:${bgColor?.border || "border-violet-400/50"} hover:bg-gray-900/80`
          : `bg-white/80 backdrop-blur-xl border-gray-200 hover:border-indigo-300 hover:bg-white shadow-md`
      }`}
    >
      {/* Gradient glow on hover */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl bg-gradient-to-br ${bgColor?.bg || "from-violet-500 to-purple-600"}`}
        style={{ opacity: 0 }}
      />
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl bg-gradient-to-br ${bgColor?.bg || "from-violet-500 to-purple-600"}`}
      />

      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12" />

      <div className="relative z-10 p-6">
        {/* Icon + Category */}
        <div className="flex items-start justify-between mb-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg bg-gradient-to-br ${bgColor?.bg || "from-violet-500 to-purple-600"} transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
          >
            {skillIcon}
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
              isDarkMode
                ? `${bgColor?.light || "bg-violet-500/10"} ${bgColor?.border || "border-violet-500/30"} text-slate-300`
                : "bg-indigo-50 border-indigo-200 text-indigo-600"
            }`}
          >
            {category}
          </span>
        </div>

        {/* Skill Name */}
        <h3
          className={`text-lg font-bold mb-3 leading-tight group-hover:text-white transition-colors duration-300 ${
            isDarkMode ? "text-white" : "text-slate-800"
          }`}
        >
          {skillName}
        </h3>

        {/* Expert Count Badge */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <div
              className={`flex -space-x-1.5`}
            >
              {[...Array(Math.min(expertCount, 3))].map((_, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-full border-2 border-gray-900 bg-gradient-to-br ${bgColor?.bg || "from-violet-500 to-purple-600"} flex items-center justify-center text-[8px] font-bold text-white`}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <span
              className={`text-sm font-semibold ${
                isDarkMode ? "text-slate-300" : "text-slate-600"
              }`}
            >
              <span className={`font-bold bg-gradient-to-r ${bgColor?.bg || "from-violet-500 to-purple-600"} bg-clip-text text-transparent`}>
                {expertCount}
              </span>{" "}
              {expertCount === 1 ? "expert" : "experts"}
            </span>
          </div>

          {/* Arrow */}
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:translate-x-1 ${
              isDarkMode
                ? `${bgColor?.light || "bg-violet-500/10"} text-slate-400 group-hover:text-white`
                : "bg-gray-100 text-gray-500 group-hover:bg-indigo-500 group-hover:text-white"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
