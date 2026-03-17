// pages/SkillExpertsList.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { skillsApi } from "../services/skillsApi";
import ExpertListItem from "../components/ExpertListItem";

const SkeletonItem = ({ isDarkMode }) => (
  <div className={`flex items-center gap-4 p-5 rounded-2xl border animate-pulse ${isDarkMode ? "bg-gray-900/50 border-gray-800/60" : "bg-white/80 border-gray-200"}`}>
    <div className={`w-14 h-14 rounded-2xl flex-shrink-0 ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`} />
    <div className="flex-1 space-y-2">
      <div className={`h-4 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`} style={{ width: "40%" }} />
      <div className={`h-3 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`} style={{ width: "25%" }} />
      <div className="flex gap-2">
        <div className={`h-5 w-16 rounded-full ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`} />
        <div className={`h-5 w-20 rounded-full ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`} />
      </div>
    </div>
    <div className={`w-9 h-9 rounded-xl ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`} />
  </div>
);

// Skill icon helper (duplicated here to avoid circular dep / keep component self-contained)
function getSkillIcon(skillName) {
  const name = skillName?.toLowerCase() || "";
  const iconMap = {
    javascript: "⚡", python: "🐍", java: "☕", react: "⚛️", nodejs: "🟢", "node.js": "🟢",
    typescript: "🔷", vue: "💚", angular: "🔴", mongodb: "🍃", docker: "🐳", aws: "☁️",
    "machine learning": "🤖", ml: "🤖", ai: "🧠", "data science": "📊", sql: "🗄️",
    figma: "🎭", "ui/ux": "🎨", design: "🎨", photoshop: "🎨",
    marketing: "📣", seo: "🔍", "digital marketing": "📣",
    english: "🇬🇧", spanish: "🇪🇸", french: "🇫🇷", hindi: "🇮🇳",
    music: "🎵", guitar: "🎸", piano: "🎹",
    "project management": "📋", leadership: "👑", "public speaking": "🎤",
  };
  for (const [key, icon] of Object.entries(iconMap)) {
    if (name.includes(key)) return icon;
  }
  return "🌟";
}

export default function SkillExpertsList() {
  const { skillName } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const [experts, setExperts] = useState([]);
  const [skillMeta, setSkillMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("rating");

  const decoded = decodeURIComponent(skillName);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await skillsApi.getExpertsBySkill(decoded);
        const data = res.data;
        setExperts(data.data || []);
        setSkillMeta({
          skillName: data.skillName || decoded,
          skillIcon: data.skillIcon || getSkillIcon(decoded),
          expertCount: data.expertCount || 0,
        });
      } catch (err) {
        setError("Failed to load experts for this skill.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [decoded]);

  const filtered = experts
    .filter((e) =>
      search ? e.name.toLowerCase().includes(search.toLowerCase()) : true
    )
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "reviews") return b.reviewCount - a.reviewCount;
      return a.name.localeCompare(b.name);
    });

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
        <div className="absolute -top-60 right-0 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -left-40 w-[400px] h-[400px] bg-indigo-500/4 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className={`group flex items-center gap-2 mb-6 text-sm font-semibold transition-all duration-300 ${
            isDarkMode ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:-translate-x-1 ${isDarkMode ? "bg-gray-800 group-hover:bg-gray-700" : "bg-gray-100 group-hover:bg-gray-200"}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          Back to Skills
        </button>

        {/* Skill Header */}
        {loading ? (
          <div className={`rounded-3xl p-8 border mb-6 animate-pulse ${isDarkMode ? "bg-gray-900/60 border-gray-800/60" : "bg-white/80 border-gray-200"}`}>
            <div className="flex items-center gap-5">
              <div className={`w-20 h-20 rounded-2xl ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`} />
              <div className="space-y-2">
                <div className={`h-7 rounded-xl ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`} style={{ width: "180px" }} />
                <div className={`h-4 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`} style={{ width: "120px" }} />
              </div>
            </div>
          </div>
        ) : skillMeta && (
          <div
            className={`rounded-3xl p-6 sm:p-8 border mb-8 bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-indigo-500/10 backdrop-blur-xl relative overflow-hidden ${
              isDarkMode ? "border-violet-500/25" : "border-violet-200 shadow-xl shadow-violet-500/5"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-indigo-500/5 rounded-3xl pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-4xl shadow-2xl shadow-violet-500/30 flex-shrink-0">
                {skillMeta.skillIcon}
              </div>
              <div className="flex-1">
                <h1 className={`text-2xl sm:text-3xl font-black mb-1 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                  {skillMeta.skillName}
                </h1>
                <p className="text-violet-400 font-semibold text-base">
                  {skillMeta.expertCount}{" "}
                  {skillMeta.expertCount === 1 ? "expert" : "experts"} available
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search & Sort */}
        {!loading && experts.length > 0 && (
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search experts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500/50 ${
                  isDarkMode
                    ? "bg-gray-900/60 backdrop-blur-xl border-gray-700/60 text-white placeholder-slate-500"
                    : "bg-white/80 backdrop-blur-xl border-gray-200 text-slate-900 placeholder-slate-400 shadow-sm"
                }`}
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-3 py-3 rounded-2xl border text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500/50 cursor-pointer ${
                isDarkMode
                  ? "bg-gray-900/60 backdrop-blur-xl border-gray-700/60 text-white"
                  : "bg-white/80 backdrop-blur-xl border-gray-200 text-slate-700 shadow-sm"
              }`}
            >
              <option value="rating">Top Rated</option>
              <option value="reviews">Most Reviews</option>
              <option value="name">A → Z</option>
            </select>
          </div>
        )}

        {/* Content */}
        {error ? (
          <div className={`text-center py-16 rounded-3xl border ${isDarkMode ? "bg-gray-900/40 border-gray-800/40" : "bg-white/60 border-gray-200"}`}>
            <div className="text-4xl mb-3">⚠️</div>
            <p className={`font-semibold ${isDarkMode ? "text-white" : "text-slate-800"}`}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => <SkeletonItem key={i} isDarkMode={isDarkMode} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className={`text-center py-16 rounded-3xl border ${isDarkMode ? "bg-gray-900/40 border-gray-800/40" : "bg-white/60 border-gray-200"}`}>
            <div className="text-4xl mb-3">👤</div>
            <p className={`font-semibold text-xl mb-1 ${isDarkMode ? "text-white" : "text-slate-800"}`}>
              {search ? "No experts match your search" : "No experts yet"}
            </p>
            <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              {search
                ? "Try a different search term"
                : `No one has listed ${decoded} as a teaching skill yet`}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-4 px-6 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className={`text-sm mb-2 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              {filtered.length} expert{filtered.length !== 1 ? "s" : ""} found
            </p>
            {filtered.map((expert) => (
              <ExpertListItem key={expert._id} expert={expert} skillName={decoded} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
