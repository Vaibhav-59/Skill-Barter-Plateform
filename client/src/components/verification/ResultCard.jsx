import { useTheme } from "../../hooks/useTheme";
import VerificationBadge from "./VerificationBadge";

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function ResultCard({
  skillName,
  score,
  percentage,
  status,
  totalQuestions,
  timeTaken = 0,
  onRetest,
  onReview,
}) {
  const { isDarkMode } = useTheme();
  const isPassed = status === "passed";

  // Grade label
  const grade =
    percentage >= 95 ? "S" :
    percentage >= 85 ? "A" :
    percentage >= 70 ? "B" :
    percentage >= 50 ? "C" : "F";

  const gradeColor =
    grade === "S" ? "from-yellow-400 to-amber-500" :
    grade === "A" ? "from-emerald-400 to-teal-500" :
    grade === "B" ? "from-blue-400 to-cyan-500" :
    grade === "C" ? "from-slate-400 to-gray-500" :
    "from-rose-400 to-red-500";

  return (
    <div className={`relative max-w-2xl mx-auto w-full rounded-3xl overflow-hidden shadow-2xl ${
      isDarkMode ? "bg-gray-900 border border-white/10" : "bg-white border border-gray-100"
    } ${isPassed ? "shadow-emerald-500/10" : "shadow-rose-500/10"}`}>

      {/* Top gradient bar */}
      <div className={`h-2 w-full bg-gradient-to-r ${isPassed ? "from-emerald-500 via-teal-400 to-cyan-500" : "from-rose-500 via-red-500 to-orange-500"}`} />

      {/* Background glow */}
      <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-20 ${isPassed ? "bg-emerald-500" : "bg-rose-500"}`} />
      <div className={`absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-3xl opacity-10 ${isPassed ? "bg-teal-500" : "bg-red-500"}`} />

      <div className="relative z-10 p-8 sm:p-12">
        {/* Header */}
        <div className="text-center mb-10">
          {/* Big outcome icon */}
          <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center shadow-2xl ${
            isPassed
              ? "bg-gradient-to-br from-emerald-400 to-teal-600 shadow-emerald-500/40"
              : "bg-gradient-to-br from-rose-400 to-red-600 shadow-rose-500/40"
          }`}>
            {isPassed ? (
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            ) : (
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
          </div>

          <h2 className={`text-3xl sm:text-4xl font-black tracking-tight mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            {isPassed ? "Skill Verified! 🎉" : "Not Passed Yet"}
          </h2>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className={`text-base font-semibold ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
              {skillName}
            </span>
            {isPassed && <VerificationBadge size="md" />}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {/* Grade */}
          <div className={`col-span-2 sm:col-span-1 p-5 rounded-2xl text-center border ${
            isDarkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100"
          }`}>
            <div className={`text-5xl font-black bg-gradient-to-br ${gradeColor} bg-clip-text text-transparent`}>
              {grade}
            </div>
            <div className={`text-xs font-bold uppercase tracking-widest mt-1 ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>Grade</div>
          </div>

          {/* Score */}
          <div className={`p-5 rounded-2xl text-center border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100"}`}>
            <div className={`text-3xl font-black ${isPassed ? "text-emerald-500" : "text-rose-500"}`}>
              {score}<span className={`text-base font-semibold ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>/{totalQuestions}</span>
            </div>
            <div className={`text-xs font-bold uppercase tracking-widest mt-1 ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>Score</div>
          </div>

          {/* Percentage */}
          <div className={`p-5 rounded-2xl text-center border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100"}`}>
            <div className={`text-3xl font-black ${isDarkMode ? "text-white" : "text-gray-900"}`}>{percentage}%</div>
            <div className={`text-xs font-bold uppercase tracking-widest mt-1 ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>Accuracy</div>
          </div>

          {/* Time */}
          <div className={`p-5 rounded-2xl text-center border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100"}`}>
            <div className={`text-2xl font-black ${isDarkMode ? "text-white" : "text-gray-900"}`}>{formatTime(timeTaken)}</div>
            <div className={`text-xs font-bold uppercase tracking-widest mt-1 ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>Time</div>
          </div>
        </div>

        {/* Pass threshold bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>Your Score</span>
            <span className={`text-xs font-bold ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>Pass Mark: 70%</span>
          </div>
          <div className={`relative w-full h-3 rounded-full overflow-hidden ${isDarkMode ? "bg-white/10" : "bg-gray-100"}`}>
            {/* Pass threshold marker */}
            <div className="absolute h-full w-0.5 bg-white/50 z-10 left-[70%]" />
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                isPassed
                  ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                  : "bg-gradient-to-r from-rose-500 to-orange-400"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Message */}
        <p className={`text-center text-sm max-w-sm mx-auto mb-8 leading-relaxed ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
          {isPassed
            ? "Congratulations! Your Verified badge has been added to your profile, skills, and expert listing."
            : `You need at least 70% to pass. You scored ${percentage}%. Keep practising and try again!`}
        </p>

        {/* CTA buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          {onReview && (
            <button
              onClick={onReview}
              className={`px-6 py-3 rounded-xl text-sm font-bold border transition-all hover:scale-[1.02] active:scale-95 ${
                isDarkMode
                  ? "border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              📋 Review Answers
            </button>
          )}
          {onRetest && (
            <button
              onClick={onRetest}
              className="px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              🔄 Retry Test
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
