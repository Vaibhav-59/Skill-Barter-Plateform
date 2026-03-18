import { useTheme } from "../hooks/useTheme";
import SkillHubGrid from "../components/SkillHubGrid";

export default function SkillHub() {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-950 via-slate-950 to-gray-900"
          : "bg-gradient-to-br from-gray-50 via-slate-50 to-white"
      }`}
    >
      {/* Decorative background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ── Header ── */}
        <div className="mb-12 text-center">
          {/* Pill label */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
              Central Hub
            </span>
          </div>

          <h1
            className={`text-5xl sm:text-6xl font-extrabold tracking-tight mb-4 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Skill{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Hub
            </span>
          </h1>

          <p
            className={`text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed ${
              isDarkMode ? "text-slate-400" : "text-gray-500"
            }`}
          >
            Enhance your skills and grow with advanced features — all in one
            place.
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-8 mt-10">
            {[
              { value: "7+", label: "Features" },
              { value: "∞", label: "Growth" },
              { value: "100%", label: "Free Access" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div
                  className={`text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent`}
                >
                  {stat.value}
                </div>
                <div
                  className={`text-sm mt-1 ${
                    isDarkMode ? "text-slate-500" : "text-gray-500"
                  }`}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section Title ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2
              className={`text-2xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Explore Features
            </h2>
            <p
              className={`text-sm mt-1 ${
                isDarkMode ? "text-slate-500" : "text-gray-500"
              }`}
            >
              Click a card to dive in
            </p>
          </div>
          {/* Decorative line */}
          <div
            className={`hidden sm:block flex-1 ml-8 h-px ${
              isDarkMode
                ? "bg-gradient-to-r from-slate-700 to-transparent"
                : "bg-gradient-to-r from-gray-200 to-transparent"
            }`}
          />
        </div>

        {/* ── Feature Cards Grid ── */}
        <SkillHubGrid />

        {/* ── Footer note ── */}
        <div className="mt-16 text-center">
          <p
            className={`text-sm ${
              isDarkMode ? "text-slate-600" : "text-gray-400"
            }`}
          >
            More features are on the way. Stay tuned for updates! 🚀
          </p>
        </div>
      </div>
    </div>
  );
}
