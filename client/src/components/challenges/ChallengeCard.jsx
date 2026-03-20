// components/challenges/ChallengeCard.jsx
import { Clock, Zap, Users, ChevronRight, Star, Cpu, Shield } from "lucide-react";

const DIFFICULTY_CONFIG = {
  Easy: {
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/30",
    dot: "bg-green-400",
    badge: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  Medium: {
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/30",
    dot: "bg-yellow-400",
    badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  Hard: {
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/30",
    dot: "bg-red-400",
    badge: "bg-red-500/20 text-red-400 border-red-500/30",
  },
};

const CATEGORY_GRADIENT = {
  "Web Development": "from-blue-500 to-cyan-600",
  "Data Science": "from-violet-500 to-purple-700",
  "UI/UX Design": "from-pink-500 to-rose-600",
  "AI & Machine Learning": "from-amber-500 to-orange-600",
  "Mobile Development": "from-teal-500 to-emerald-600",
  "DevOps": "from-slate-500 to-gray-700",
  "Cybersecurity": "from-red-500 to-rose-700",
  Other: "from-gray-500 to-gray-700",
};

export default function ChallengeCard({ challenge, onStart, isDarkMode }) {
  const diff = DIFFICULTY_CONFIG[challenge.difficulty] || DIFFICULTY_CONFIG.Medium;
  const gradient = CATEGORY_GRADIENT[challenge.skillCategory] || "from-fuchsia-500 to-purple-700";

  return (
    <div
      className={`group relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
        isDarkMode
          ? "bg-gray-900/70 border-gray-800 hover:border-fuchsia-500/40"
          : "bg-white border-gray-200 hover:border-fuchsia-400/60"
      }`}
    >
      {/* Top gradient bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`} />

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Header badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {/* Difficulty */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${diff.badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
            {challenge.difficulty}
          </span>

          {/* Special badges */}
          {challenge.isDaily && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Star className="w-3 h-3" /> Daily
            </span>
          )}
          {challenge.isTeamChallenge && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
              <Users className="w-3 h-3" /> Team
            </span>
          )}
          {challenge.isAIGenerated && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30">
              <Cpu className="w-3 h-3" /> AI
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className={`text-lg font-bold mb-1 leading-snug group-hover:text-fuchsia-400 transition-colors ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {challenge.title}
        </h3>

        {/* Category */}
        <p
          className={`text-xs font-medium mb-3 ${
            isDarkMode ? "text-fuchsia-400" : "text-fuchsia-600"
          }`}
        >
          {challenge.skillCategory}
        </p>

        {/* Description */}
        <p
          className={`text-sm leading-relaxed mb-4 flex-1 line-clamp-2 ${
            isDarkMode ? "text-slate-400" : "text-gray-500"
          }`}
        >
          {challenge.description}
        </p>

        {/* Tags */}
        {challenge.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {challenge.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                  isDarkMode
                    ? "bg-gray-800 text-slate-400"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Meta row */}
        <div
          className={`flex items-center gap-4 text-xs mb-4 ${
            isDarkMode ? "text-slate-500" : "text-gray-400"
          }`}
        >
          {challenge.timeLimit && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {challenge.timeLimit} min
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {challenge.participantsCount?.toLocaleString() || 0}
          </span>
          <span className="flex items-center gap-1 text-fuchsia-500 font-semibold">
            <Zap className="w-3.5 h-3.5" />
            {challenge.rewardXP} XP
          </span>
        </div>

        {/* CTA */}
        <button
          id={`start-challenge-${challenge._id}`}
          onClick={() => onStart(challenge)}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r ${gradient} text-white shadow-md hover:shadow-lg hover:opacity-90 active:scale-95 transition-all duration-200`}
        >
          Start Challenge
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
