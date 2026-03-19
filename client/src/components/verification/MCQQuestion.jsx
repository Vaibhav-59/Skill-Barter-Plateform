import { useTheme } from "../../hooks/useTheme";

export default function MCQQuestion({
  question,
  options = [],
  selectedOption,
  onSelect,
  questionNumber,
  totalQuestions,
  showReview = false,
  correctAnswer = null,
}) {
  const { isDarkMode } = useTheme();
  const letters = ["A", "B", "C", "D"];

  const getOptionState = (option) => {
    if (!showReview) {
      return option === selectedOption ? "selected" : "default";
    }
    if (option === correctAnswer) return "correct";
    if (option === selectedOption && option !== correctAnswer) return "wrong";
    return "default";
  };

  const optionStyles = {
    selected: isDarkMode
      ? "border-blue-500 bg-blue-500/15 shadow-[0_0_20px_rgba(59,130,246,0.12)]"
      : "border-blue-400 bg-blue-50 shadow-sm",
    correct: "border-emerald-500 bg-emerald-500/15 shadow-[0_0_20px_rgba(16,185,129,0.12)]",
    wrong: "border-rose-500 bg-rose-500/15",
    default: isDarkMode
      ? "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 shadow-sm",
  };

  const letterStyles = {
    selected: "bg-blue-500 text-white shadow-lg shadow-blue-500/30",
    correct: "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30",
    wrong: "bg-rose-500 text-white shadow-lg shadow-rose-500/30",
    default: isDarkMode ? "bg-white/10 text-slate-400" : "bg-gray-100 text-gray-500",
  };

  const textStyles = {
    selected: isDarkMode ? "text-blue-200" : "text-blue-900",
    correct: isDarkMode ? "text-emerald-200" : "text-emerald-900",
    wrong: isDarkMode ? "text-rose-200" : "text-rose-900",
    default: isDarkMode ? "text-slate-200" : "text-gray-700",
  };

  return (
    <div className="w-full">
      {/* Q number */}
      <div className="flex items-center gap-3 mb-5">
        <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest ${
          isDarkMode ? "bg-blue-500/15 text-blue-400" : "bg-blue-50 text-blue-600"
        }`}>
          Question {questionNumber} / {totalQuestions}
        </span>
      </div>

      {/* Question text */}
      <h3 className={`text-lg sm:text-xl lg:text-2xl font-bold leading-relaxed mb-8 ${
        isDarkMode ? "text-white" : "text-gray-900"
      }`}>
        {question}
      </h3>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option, idx) => {
          const state = getOptionState(option);
          const letter = letters[idx] || String(idx + 1);

          return (
            <button
              key={idx}
              onClick={() => !showReview && onSelect(option)}
              disabled={showReview}
              className={`w-full group flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 text-left transition-all duration-200 ${optionStyles[state]} ${
                showReview ? "cursor-default" : "cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              }`}
            >
              {/* Letter */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0 transition-all duration-200 ${letterStyles[state]}`}>
                {state === "correct" ? "✓" : state === "wrong" ? "✗" : letter}
              </div>

              {/* Option text */}
              <span className={`flex-1 text-sm sm:text-base font-medium leading-relaxed ${textStyles[state]}`}>
                {option}
              </span>

              {/* Indicator dot */}
              {state === "selected" && !showReview && (
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
