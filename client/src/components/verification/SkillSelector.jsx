import { useState, useRef } from "react";
import { useTheme } from "../../hooks/useTheme";

const POPULAR_SKILLS = [
  "React", "JavaScript", "Python", "Node.js", "TypeScript",
  "CSS", "HTML", "SQL", "MongoDB", "Docker",
  "Machine Learning", "UI/UX Design", "GraphQL", "AWS", "Git",
];

export default function SkillSelector({ value, onChange, userSkills = [] }) {
  const { isDarkMode } = useTheme();
  const [customInput, setCustomInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  // Build suggestions: profile skills + popular, filtered by input
  const allOptions = [
    ...userSkills.map((s) => ({ name: s.name || s, source: "profile" })),
    ...POPULAR_SKILLS
      .filter((p) => !userSkills.find((s) => (s.name || s).toLowerCase() === p.toLowerCase()))
      .map((p) => ({ name: p, source: "popular" })),
  ];

  const filtered = customInput
    ? allOptions.filter((o) => o.name.toLowerCase().includes(customInput.toLowerCase()))
    : allOptions;

  const handleInputChange = (e) => {
    const v = e.target.value;
    setCustomInput(v);
    onChange(v);
    setShowSuggestions(true);
  };

  const handleSelect = (name) => {
    setCustomInput(name);
    onChange(name);
    setShowSuggestions(false);
  };

  return (
    <div className="mb-6">
      <label className={`block text-xs font-bold mb-2 uppercase tracking-widest flex items-center gap-2 ${
        isDarkMode ? "text-slate-400" : "text-gray-500"
      }`}>
        🎯 Skill to Verify
      </label>

      {/* Text Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={customInput || value}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="Type or select a skill (e.g. React, Python, UI Design...)"
          className={`w-full px-4 py-3 pr-10 rounded-xl border text-sm font-medium transition-all focus:outline-none focus:ring-2 ${
            isDarkMode
              ? "bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20 focus:bg-white/8"
              : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-400 focus:ring-emerald-400/20 shadow-sm"
          }`}
        />
        {/* Skill icon */}
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          {value ? (
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          ) : (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>

        {/* Dropdown Suggestions */}
        {showSuggestions && filtered.length > 0 && (
          <div className={`absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-xl z-50 overflow-hidden max-h-56 overflow-y-auto ${
            isDarkMode ? "bg-gray-900 border-white/10" : "bg-white border-gray-100"
          }`}>
            {filtered.slice(0, 12).map((opt) => (
              <button
                key={opt.name}
                type="button"
                onMouseDown={() => handleSelect(opt.name)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors ${
                  isDarkMode
                    ? "text-slate-200 hover:bg-white/5"
                    : "text-gray-700 hover:bg-emerald-50"
                }`}
              >
                <span className="font-medium">{opt.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  opt.source === "profile"
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-slate-500/20 text-slate-400"
                }`}>
                  {opt.source === "profile" ? "My Skill" : "Popular"}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick picks chips */}
      {!value && (
        <div className="flex flex-wrap gap-2 mt-3">
          {["React", "Python", "JavaScript", "Node.js", "UI/UX"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSelect(s)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all hover:scale-105 active:scale-95 ${
                isDarkMode
                  ? "border-white/10 text-slate-400 hover:text-white hover:border-emerald-500/50 hover:bg-emerald-500/10"
                  : "border-gray-200 text-gray-500 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
