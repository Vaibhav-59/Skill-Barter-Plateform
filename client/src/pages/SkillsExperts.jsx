// pages/SkillsExperts.jsx
import { useEffect, useState, useMemo } from "react";
import { useTheme } from "../hooks/useTheme";
import { skillsApi } from "../services/skillsApi";
import SkillCard from "../components/SkillCard";

const CATEGORIES = ["All", "Technology", "Design", "Marketing", "Language", "Music & Arts", "Business", "Other"];

const SkeletonCard = ({ isDarkMode }) => (
  <div className={`rounded-2xl border p-6 animate-pulse ${isDarkMode ? "bg-gray-900/60 border-gray-800/60" : "bg-white/80 border-gray-200"}`}>
    <div className="flex items-start justify-between mb-4">
      <div className={`w-14 h-14 rounded-2xl ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`} />
      <div className={`w-20 h-6 rounded-full ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`} />
    </div>
    <div className={`h-5 rounded-lg mb-3 ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`} style={{ width: "60%" }} />
    <div className={`h-4 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`} style={{ width: "40%" }} />
  </div>
);

export default function SkillsExperts() {
  const { isDarkMode } = useTheme();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("experts"); // "experts" | "name"

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await skillsApi.getAllSkills();
        setSkills(res.data?.data || []);
      } catch (err) {
        setError("Failed to load skills. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredSkills = useMemo(() => {
    let result = skills;

    if (activeCategory !== "All") {
      result = result.filter((s) => s.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.skillName.toLowerCase().includes(q));
    }

    if (sortBy === "name") {
      result = [...result].sort((a, b) => a.skillName.localeCompare(b.skillName));
    } else {
      result = [...result].sort((a, b) => b.expertCount - a.expertCount);
    }

    return result;
  }, [skills, search, activeCategory, sortBy]);

  const totalExperts = skills.reduce((acc, s) => acc + s.expertCount, 0);

  return (
    <div
      className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${
        isDarkMode
          ? "bg-gradient-to-br from-black via-gray-950 to-slate-950"
          : "bg-gradient-to-br from-slate-50 via-white to-violet-50/30"
      }`}
    >
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-80 -right-80 w-[700px] h-[700px] bg-violet-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-80 -left-80 w-[700px] h-[700px] bg-indigo-500/4 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/3 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/30 rounded-full text-violet-400 text-sm font-semibold mb-4">
            <span>🌟</span> Discover & Learn
          </div>
          <h1 className={`text-4xl sm:text-5xl font-black mb-3 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            Skills &{" "}
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent">
              Experts
            </span>
          </h1>
          <p className={`text-lg max-w-2xl mx-auto ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
            Explore all available skills and connect with experts who can teach them
          </p>

          {/* Stats Bar */}
          {!loading && (
            <div className="flex items-center justify-center gap-8 mt-6">
              <div className="text-center">
                <div className="text-2xl font-black bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">
                  {skills.length}
                </div>
                <div className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Skills</div>
              </div>
              <div className={`w-px h-8 ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`} />
              <div className="text-center">
                <div className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-transparent">
                  {totalExperts}
                </div>
                <div className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Experts</div>
              </div>
              <div className={`w-px h-8 ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`} />
              <div className="text-center">
                <div className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                  {CATEGORIES.length - 1}
                </div>
                <div className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Categories</div>
              </div>
            </div>
          )}
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg className={`w-5 h-5 ${isDarkMode ? "text-slate-400" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              id="skills-search"
              type="text"
              placeholder="Search skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500/50 ${
                isDarkMode
                  ? "bg-gray-900/60 backdrop-blur-xl border-gray-700/60 text-white placeholder-slate-500 hover:border-gray-600/60"
                  : "bg-white/80 backdrop-blur-xl border-gray-200 text-slate-900 placeholder-slate-400 hover:border-gray-300 shadow-sm"
              }`}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`px-4 py-3.5 rounded-2xl border text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500/50 cursor-pointer ${
              isDarkMode
                ? "bg-gray-900/60 backdrop-blur-xl border-gray-700/60 text-white"
                : "bg-white/80 backdrop-blur-xl border-gray-200 text-slate-700 shadow-sm"
            }`}
          >
            <option value="experts">Sort: Most Experts</option>
            <option value="name">Sort: A → Z</option>
          </select>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 border ${
                activeCategory === cat
                  ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white border-transparent shadow-lg shadow-violet-500/25"
                  : isDarkMode
                  ? "bg-gray-900/50 border-gray-700/50 text-slate-400 hover:border-gray-600 hover:text-slate-200"
                  : "bg-white/70 border-gray-200 text-slate-600 hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Content */}
        {error ? (
          <div className={`text-center py-20 rounded-3xl border ${isDarkMode ? "bg-gray-900/40 border-gray-800/40" : "bg-white/60 border-gray-200"}`}>
            <div className="text-5xl mb-4">⚠️</div>
            <p className={`font-semibold text-lg mb-2 ${isDarkMode ? "text-white" : "text-slate-800"}`}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} isDarkMode={isDarkMode} />)}
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className={`text-center py-20 rounded-3xl border ${isDarkMode ? "bg-gray-900/40 border-gray-800/40" : "bg-white/60 border-gray-200"}`}>
            <div className="text-5xl mb-4">🔍</div>
            <p className={`font-semibold text-xl mb-2 ${isDarkMode ? "text-white" : "text-slate-800"}`}>No skills found</p>
            <p className={`${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              {search ? `No results for "${search}"` : "No skills in this category yet"}
            </p>
            <button
              onClick={() => { setSearch(""); setActiveCategory("All"); }}
              className="mt-4 px-6 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all duration-300"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <p className={`text-sm mb-4 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              Showing <span className="font-bold text-violet-400">{filteredSkills.length}</span> skill{filteredSkills.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredSkills.map((skill, i) => (
                <SkillCard key={i} skill={skill} />
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
