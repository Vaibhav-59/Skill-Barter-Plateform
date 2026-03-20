// components/challenges/ChallengeFilters.jsx
import { Filter } from "lucide-react";

const CATEGORIES = [
  "All",
  "Web Development",
  "Data Science",
  "UI/UX Design",
  "AI & Machine Learning",
  "Mobile Development",
  "DevOps",
  "Cybersecurity",
];

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];
const TYPES = [
  { label: "All", value: "all" },
  { label: "Daily 🌟", value: "daily" },
  { label: "Team 👥", value: "team" },
  { label: "AI Generated 🤖", value: "ai" },
];

export default function ChallengeFilters({ filters, onChange, isDarkMode }) {
  const pill = (active) =>
    active
      ? "bg-fuchsia-600 text-white border-fuchsia-600 shadow-md shadow-fuchsia-500/30"
      : isDarkMode
      ? "bg-gray-800/60 text-slate-300 border-gray-700 hover:border-fuchsia-500/50 hover:text-fuchsia-400"
      : "bg-white text-gray-600 border-gray-200 hover:border-fuchsia-400 hover:text-fuchsia-600";

  return (
    <div
      className={`rounded-2xl border p-5 mb-6 ${
        isDarkMode
          ? "bg-gray-900/60 border-gray-800 backdrop-blur-sm"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-fuchsia-500" />
        <span
          className={`text-sm font-semibold ${
            isDarkMode ? "text-slate-300" : "text-gray-700"
          }`}
        >
          Filter Challenges
        </span>
      </div>

      {/* Category */}
      <div className="mb-4">
        <p
          className={`text-xs font-medium uppercase tracking-wider mb-2 ${
            isDarkMode ? "text-slate-500" : "text-gray-400"
          }`}
        >
          Category
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onChange({ ...filters, category: cat })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${pill(
                filters.category === cat
              )}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div className="mb-4">
        <p
          className={`text-xs font-medium uppercase tracking-wider mb-2 ${
            isDarkMode ? "text-slate-500" : "text-gray-400"
          }`}
        >
          Difficulty
        </p>
        <div className="flex gap-2">
          {DIFFICULTIES.map((d) => {
            const colorActive =
              d === "Easy"
                ? "bg-green-600 text-white border-green-600"
                : d === "Medium"
                ? "bg-yellow-500 text-white border-yellow-500"
                : d === "Hard"
                ? "bg-red-600 text-white border-red-600"
                : "bg-fuchsia-600 text-white border-fuchsia-600";
            return (
              <button
                key={d}
                onClick={() => onChange({ ...filters, difficulty: d })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                  filters.difficulty === d ? colorActive : pill(false)
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      {/* Type */}
      <div>
        <p
          className={`text-xs font-medium uppercase tracking-wider mb-2 ${
            isDarkMode ? "text-slate-500" : "text-gray-400"
          }`}
        >
          Type
        </p>
        <div className="flex flex-wrap gap-2">
          {TYPES.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => onChange({ ...filters, type: value })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${pill(
                filters.type === value
              )}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
