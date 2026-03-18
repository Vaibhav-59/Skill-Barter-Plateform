import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";

export default function SkillHubCard({
  title,
  description,
  icon,
  route,
  gradient,
  badge,
  badgeColor,
  delay = 0,
}) {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  return (
    <div
      onClick={() => navigate(route)}
      className={`
        group relative cursor-pointer rounded-2xl p-6 border transition-all duration-400
        hover:scale-[1.04] hover:shadow-2xl
        ${
          isDarkMode
            ? "bg-gray-900/60 border-slate-700/30 hover:border-emerald-400/30 backdrop-blur-sm"
            : "bg-white border-gray-100 hover:border-emerald-300/60 shadow-sm"
        }
        overflow-hidden
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Animated gradient background on hover */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-2xl ${gradient}`}
      />

      {/* Subtle corner glow */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 bg-white/10" />

      <div className="relative z-10">
        {/* Badge */}
        {badge && (
          <span
            className={`absolute top-0 right-0 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
              badgeColor ||
              "bg-emerald-400/20 text-emerald-400 border border-emerald-400/30"
            }`}
          >
            {badge}
          </span>
        )}

        {/* Icon container */}
        <div
          className={`
            w-14 h-14 rounded-2xl flex items-center justify-center mb-5
            shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3
            ${gradient}
          `}
        >
          <div className="text-white w-7 h-7">{icon}</div>
        </div>

        {/* Title */}
        <h3
          className={`font-bold text-lg mb-2 transition-colors duration-300 ${
            isDarkMode
              ? "text-white group-hover:text-white"
              : "text-gray-800 group-hover:text-gray-900"
          }`}
        >
          {title}
        </h3>

        {/* Description */}
        <p
          className={`text-sm leading-relaxed transition-colors duration-300 ${
            isDarkMode
              ? "text-slate-400 group-hover:text-slate-200"
              : "text-gray-500 group-hover:text-gray-700"
          }`}
        >
          {description}
        </p>

        {/* Arrow indicator */}
        <div className="mt-5 flex items-center space-x-1 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1">
          <span className="text-emerald-400">Explore</span>
          <svg
            className="w-4 h-4 text-emerald-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
