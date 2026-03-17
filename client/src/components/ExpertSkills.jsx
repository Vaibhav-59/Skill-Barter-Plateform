// components/ExpertSkills.jsx
import { useTheme } from "../hooks/useTheme";

const levelConfig = {
  Beginner: { color: "from-green-400 to-emerald-500", bar: "w-1/4", label: "25%" },
  Intermediate: { color: "from-blue-400 to-cyan-500", bar: "w-1/2", label: "50%" },
  Advanced: { color: "from-violet-400 to-purple-500", bar: "w-3/4", label: "75%" },
  Expert: { color: "from-amber-400 to-orange-500", bar: "w-full", label: "100%" },
};

function SkillBar({ skill, highlighted }) {
  const { isDarkMode } = useTheme();
  const config = levelConfig[skill.level] || levelConfig["Beginner"];

  return (
    <div
      className={`p-4 rounded-2xl border transition-all duration-300 ${
        highlighted
          ? `bg-gradient-to-r ${config.color.replace("from-", "from-").replace("to-", "to-")} border-transparent`
          : isDarkMode
          ? "bg-gray-800/60 border-gray-700/50 hover:border-gray-600/60"
          : "bg-gray-50 border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`font-semibold text-sm ${highlighted ? "text-white" : isDarkMode ? "text-white" : "text-slate-800"}`}>
          {skill.name}
          {highlighted && <span className="ml-2 text-xs opacity-80">✨ Featured</span>}
        </span>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
          highlighted
            ? "bg-white/20 text-white"
            : `bg-gradient-to-r ${config.color} text-white`
        }`}>
          {skill.level}
        </span>
      </div>
      <div className={`h-1.5 rounded-full overflow-hidden ${highlighted ? "bg-white/20" : isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}>
        <div className={`h-full rounded-full ${config.bar} transition-all duration-1000 ${
          highlighted ? "bg-white/70" : `bg-gradient-to-r ${config.color}`
        }`} />
      </div>
    </div>
  );
}

export default function ExpertSkills({ expert, highlightSkill }) {
  const { isDarkMode } = useTheme();

  const teachSkills = expert.teachSkills || [];
  const learnSkills = expert.learnSkills || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Teaching Skills */}
      <div className={`rounded-2xl border p-6 ${isDarkMode ? "bg-gray-900/50 backdrop-blur-xl border-gray-800/60" : "bg-white/80 backdrop-blur-xl border-gray-200 shadow-md"}`}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-lg">🎓</span>
          </div>
          <div>
            <h3 className={`font-bold text-base ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Skills Offered
            </h3>
            <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              {teachSkills.length} skill{teachSkills.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {teachSkills.length > 0 ? (
          <div className="space-y-3">
            {teachSkills.map((skill, i) => (
              <SkillBar
                key={i}
                skill={skill}
                highlighted={skill.name.toLowerCase() === highlightSkill?.toLowerCase()}
              />
            ))}
          </div>
        ) : (
          <div className={`text-center py-8 text-sm ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
            No teaching skills listed yet
          </div>
        )}
      </div>

      {/* Learning Goals */}
      <div className={`rounded-2xl border p-6 ${isDarkMode ? "bg-gray-900/50 backdrop-blur-xl border-gray-800/60" : "bg-white/80 backdrop-blur-xl border-gray-200 shadow-md"}`}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-lg">📚</span>
          </div>
          <div>
            <h3 className={`font-bold text-base ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Wants to Learn
            </h3>
            <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              {learnSkills.length} skill{learnSkills.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {learnSkills.length > 0 ? (
          <div className="space-y-3">
            {learnSkills.map((skill, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  isDarkMode
                    ? "bg-gray-800/50 border-gray-700/50 text-slate-300"
                    : "bg-blue-50/50 border-blue-100 text-slate-700"
                }`}
              >
                <span className="text-sm font-medium">{skill.name}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                  isDarkMode ? "bg-blue-500/15 text-blue-400 border border-blue-500/25" : "bg-blue-100 text-blue-700"
                }`}>
                  {skill.level}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-8 text-sm ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
            No learning goals listed yet
          </div>
        )}
      </div>

      {/* Portfolio / Certificates */}
      {expert.certificates && expert.certificates.length > 0 && (
        <div className={`lg:col-span-2 rounded-2xl border p-6 ${isDarkMode ? "bg-gray-900/50 backdrop-blur-xl border-gray-800/60" : "bg-white/80 backdrop-blur-xl border-gray-200 shadow-md"}`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-lg">🏆</span>
            </div>
            <h3 className={`font-bold text-base ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Portfolio & Certificates
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {expert.certificates.map((cert, i) => (
              <a
                key={i}
                href={cert.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative aspect-video rounded-xl overflow-hidden border transition-all duration-300 hover:scale-105 ${
                  isDarkMode ? "border-gray-700 hover:border-amber-500/40" : "border-gray-200 hover:border-amber-400"
                }`}
              >
                {cert.fileType === "image" ? (
                  <img src={cert.fileUrl} alt={cert.fileName} className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full flex flex-col items-center justify-center gap-1 ${isDarkMode ? "bg-gray-800" : "bg-amber-50"}`}>
                    <span className="text-2xl">📄</span>
                    <span className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>{cert.fileName || "Document"}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">View</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
