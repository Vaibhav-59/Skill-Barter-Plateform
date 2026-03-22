// pages/LearningResources.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import {
  Search, Plus, Bookmark, TrendingUp, Sparkles, Filter,
  BookOpen, Video, FileText, Code, BookMarked, Globe,
  Star, Clock, Eye, Heart, X, ChevronDown, LayoutGrid,
  List, SlidersHorizontal, RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";
import * as resourceApi from "../services/resourceApi";
import ResourceCard from "../components/resources/ResourceCard";
import AddResourceForm from "../components/resources/AddResourceForm";
import TrendingResources from "../components/resources/TrendingResources";
import RecommendedResources from "../components/resources/RecommendedResources";

/* ── Constants ────────────────────────────────────────────────── */
const CATEGORIES = [
  "All", "Web Development", "Data Science", "UI/UX Design",
  "Mobile Development", "AI & Machine Learning", "DevOps", "Other",
];
const TYPES      = ["All", "Video", "Article", "Course", "Documentation", "Book", "Tutorial"];
const LEVELS     = ["All", "Beginner", "Intermediate", "Advanced"];
const SORTS      = [
  { value: "newest",  label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "rated",   label: "Highest Rated" },
  { value: "liked",   label: "Most Liked" },
];

const TYPE_ICONS = {
  Video: <Video className="w-3.5 h-3.5" />,
  Article: <FileText className="w-3.5 h-3.5" />,
  Course: <BookOpen className="w-3.5 h-3.5" />,
  Documentation: <Code className="w-3.5 h-3.5" />,
  Book: <BookMarked className="w-3.5 h-3.5" />,
  Tutorial: <Globe className="w-3.5 h-3.5" />,
};

const CAT_COLORS = {
  "Web Development":      "from-blue-500 to-cyan-500",
  "Data Science":         "from-purple-500 to-violet-500",
  "UI/UX Design":         "from-pink-500 to-rose-500",
  "Mobile Development":   "from-amber-500 to-orange-500",
  "AI & Machine Learning":"from-emerald-500 to-teal-500",
  "DevOps":               "from-slate-500 to-gray-500",
  "Other":                "from-indigo-500 to-blue-500",
};

/* ── TABS ─────────────────────────────────────────────────────── */
const TABS = [
  { id: "all",         label: "All Resources", icon: <LayoutGrid className="w-4 h-4" /> },
  { id: "recommended", label: "For You",       icon: <Sparkles className="w-4 h-4" /> },
  { id: "trending",    label: "Trending",      icon: <TrendingUp className="w-4 h-4" /> },
  { id: "bookmarked",  label: "Saved",         icon: <Bookmark className="w-4 h-4" /> },
];

export default function LearningResources() {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  /* ── state ── */
  const [activeTab,   setActiveTab]   = useState("all");
  const [resources,   setResources]   = useState([]);
  const [trending,    setTrending]    = useState({ mostViewed: [], mostLiked: [], recent: [] });
  const [recommended, setRecommended] = useState([]);
  const [bookmarked,  setBookmarked]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category,    setCategory]    = useState("All");
  const [type,        setType]        = useState("All");
  const [level,       setLevel]       = useState("All");
  const [sort,        setSort]        = useState("newest");
  const [viewMode,    setViewMode]    = useState("grid"); // grid | list
  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [pagination,  setPagination]  = useState({ page: 1, pages: 1, total: 0 });
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [likedIds,    setLikedIds]    = useState(new Set());

  const debounceRef = useRef();

  /* ── search debounce ── */
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  /* ── fetch ── */
  const fetchResources = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page, limit: 12, sort,
        ...(category !== "All"  && { category }),
        ...(type     !== "All"  && { resourceType: type }),
        ...(level    !== "All"  && { difficultyLevel: level }),
        ...(debouncedSearch     && { search: debouncedSearch }),
      };
      const res = await resourceApi.getResources(params);
      setResources(res.data || []);
      setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      toast.error("Failed to load resources");
    } finally {
      setLoading(false);
    }
  }, [category, type, level, sort, debouncedSearch]);

  const fetchTrending    = async () => { try { const r = await resourceApi.getTrending();   setTrending(r.data || {}); } catch {} };
  const fetchRecommended = async () => { try { const r = await resourceApi.getRecommended(); setRecommended(r.data || []); } catch {} };
  const fetchBookmarked  = async () => {
    try {
      const r = await resourceApi.getBookmarked();
      setBookmarked(r.data || []);
      setBookmarkedIds(new Set((r.data || []).map(b => b._id)));
    } catch {}
  };

  useEffect(() => {
    fetchTrending();
    fetchRecommended();
    fetchBookmarked();
  }, []);

  useEffect(() => {
    if (activeTab === "all") fetchResources(1);
  }, [fetchResources, activeTab]);

  /* ── like / bookmark handlers ── */
  const handleLike = async (id) => {
    try {
      const r = await resourceApi.toggleLike(id);
      setLikedIds(prev => {
        const next = new Set(prev);
        r.liked ? next.add(id) : next.delete(id);
        return next;
      });
      setResources(prev => prev.map(res =>
        res._id === id ? { ...res, likes: r.liked ? [...res.likes, "me"] : res.likes.slice(0, -1) } : res
      ));
    } catch { toast.error("Failed"); }
  };

  const handleBookmark = async (id) => {
    try {
      const r = await resourceApi.toggleBookmark(id);
      setBookmarkedIds(prev => {
        const next = new Set(prev);
        r.bookmarked ? next.add(id) : next.delete(id);
        return next;
      });
      if (!r.bookmarked) setBookmarked(prev => prev.filter(b => b._id !== id));
      else fetchBookmarked();
      toast.success(r.bookmarked ? "Bookmarked!" : "Removed from saved");
    } catch { toast.error("Failed"); }
  };

  const handleResourceAdded = (res) => {
    setResources(prev => [res, ...prev]);
    setShowAddForm(false);
    toast.success("Resource added!");
  };

  /* ── helpers ── */
  const bg    = isDarkMode ? "bg-gray-950" : "bg-gray-50";
  const card  = isDarkMode ? "bg-gray-900/80 border-slate-700/40" : "bg-white border-gray-200";
  const text  = isDarkMode ? "text-white"  : "text-gray-900";
  const sub   = isDarkMode ? "text-slate-400" : "text-gray-500";
  const input = isDarkMode
    ? "bg-gray-800/60 border-slate-600/40 text-white placeholder-slate-500 focus:border-emerald-500/60"
    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-emerald-500";

  const displayList = activeTab === "bookmarked" ? bookmarked : resources;

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300`}>
      {/* ── HERO HEADER ── */}
      <div className="relative overflow-hidden border-b border-slate-700/30"
        style={{ background: isDarkMode
          ? "linear-gradient(135deg, rgba(10,15,26,0.98) 0%, rgba(15,23,42,0.96) 50%, rgba(6,78,59,0.15) 100%)"
          : "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #d1fae5 100%)" }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: "radial-gradient(circle, #10b981, transparent)" }} />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full blur-3xl opacity-8" style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #10b981, #14b8a6)" }}>
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-3xl font-black ${text}`}>Learning Resources</h1>
                  <p className={`text-sm ${sub}`}>Discover · Share · Grow</p>
                </div>
              </div>
              <p className={`text-base ${sub} max-w-xl`}>
                Curated tutorials, videos, courses and articles matched to your skills and goals.
                Contribute resources and earn community recognition.
              </p>
            </div>

            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-white shadow-lg hover:opacity-90 active:scale-95 transition-all"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 20px rgba(16,185,129,0.35)" }}
            >
              <Plus className="w-4 h-4" />
              Add Resource
            </button>
          </div>

          {/* Search bar */}
          <div className="mt-6 relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search tutorials, courses, articles…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`w-full pl-12 pr-12 py-3.5 rounded-2xl border text-base outline-none transition-colors ${input}`}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="mt-5 flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setActiveTab("all"); }}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                  category === cat && activeTab === "all"
                    ? "text-white border-transparent shadow-md"
                    : isDarkMode
                      ? "text-slate-400 border-slate-600/40 hover:text-white hover:border-slate-500"
                      : "text-gray-600 border-gray-300 hover:text-gray-900"
                }`}
                style={category === cat && activeTab === "all"
                  ? { background: cat === "All" ? "linear-gradient(135deg, #10b981, #14b8a6)" : `linear-gradient(135deg, ${CAT_COLORS[cat]?.split(" ")[0]?.replace("from-","")?.replace(/-500/,"") || "#10b981"}, #14b8a6)` }
                  : {}}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col xl:flex-row gap-8">

          {/* ── MAIN COLUMN ── */}
          <div className="flex-1 min-w-0">
            {/* Tab bar */}
            <div className={`flex items-center justify-between gap-3 mb-6 p-1.5 rounded-2xl border ${card}`}>
              <div className="flex gap-1">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      activeTab === tab.id
                        ? "text-white shadow-md"
                        : isDarkMode ? "text-slate-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                    }`}
                    style={activeTab === tab.id ? { background: "linear-gradient(135deg, #10b981, #059669)" } : {}}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {/* View toggle */}
                <div className={`flex rounded-xl border overflow-hidden ${isDarkMode ? "border-slate-600/40" : "border-gray-200"}`}>
                  {[{ id: "grid", icon: <LayoutGrid className="w-4 h-4" /> }, { id: "list", icon: <List className="w-4 h-4" /> }].map(v => (
                    <button
                      key={v.id}
                      onClick={() => setViewMode(v.id)}
                      className={`p-2 transition-colors ${viewMode === v.id
                        ? "bg-emerald-500 text-white"
                        : isDarkMode ? "text-slate-400 hover:text-white" : "text-gray-400 hover:text-gray-700"
                      }`}
                    >{v.icon}</button>
                  ))}
                </div>

                {/* Filter toggle */}
                <button
                  onClick={() => setShowFilters(p => !p)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                    showFilters
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : isDarkMode
                        ? "border-slate-600/40 text-slate-400 hover:text-white hover:border-slate-500"
                        : "border-gray-200 text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>
              </div>
            </div>

            {/* Filters panel */}
            {showFilters && activeTab === "all" && (
              <div className={`mb-6 p-5 rounded-2xl border ${card} grid grid-cols-2 md:grid-cols-4 gap-4`}>
                {[
                  { label: "Type",       value: type,  set: setType,  options: TYPES  },
                  { label: "Level",      value: level, set: setLevel, options: LEVELS },
                  { label: "Sort By",    value: sort,  set: setSort,  options: SORTS.map(s => s.value), labels: SORTS.map(s => s.label) },
                ].map(({ label, value, set, options, labels }) => (
                  <div key={label}>
                    <label className={`block text-xs font-bold uppercase tracking-widest mb-1.5 ${sub}`}>{label}</label>
                    <div className="relative">
                      <select
                        value={value}
                        onChange={e => set(e.target.value)}
                        className={`w-full appearance-none pl-3 pr-8 py-2 rounded-xl border text-sm outline-none ${input}`}
                      >
                        {options.map((o, i) => <option key={o} value={o}>{labels ? labels[i] : o}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                ))}
                <div className="flex items-end">
                  <button
                    onClick={() => { setCategory("All"); setType("All"); setLevel("All"); setSort("newest"); setSearch(""); }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white border border-slate-600/40 hover:border-slate-500 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reset
                  </button>
                </div>
              </div>
            )}

            {/* Results bar */}
            {activeTab === "all" && (
              <div className={`flex items-center justify-between mb-5 text-sm ${sub}`}>
                <span>{pagination.total} resource{pagination.total !== 1 ? "s" : ""} found</span>
                {debouncedSearch && <span>Showing results for "<span className="text-emerald-400 font-semibold">{debouncedSearch}</span>"</span>}
              </div>
            )}

            {/* Content */}
            {activeTab === "recommended" ? (
              <RecommendedResources
                resources={recommended} loading={false}
                onLike={handleLike} onBookmark={handleBookmark}
                likedIds={likedIds} bookmarkedIds={bookmarkedIds}
                isDarkMode={isDarkMode} onView={id => navigate(`/resources/${id}`)}
              />
            ) : activeTab === "trending" ? (
              <TrendingResources data={trending} isDarkMode={isDarkMode} onView={id => navigate(`/resources/${id}`)} />
            ) : (
              <>
                {loading ? (
                  <div className={`grid gap-5 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3" : "grid-cols-1"}`}>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className={`rounded-2xl border ${card} animate-pulse`} style={{ height: 280 }} />
                    ))}
                  </div>
                ) : displayList.length === 0 ? (
                  <div className={`flex flex-col items-center justify-center py-24 ${sub}`}>
                    <BookOpen className="w-14 h-14 mb-4 opacity-30" />
                    <p className="text-lg font-semibold">
                      {activeTab === "bookmarked" ? "No saved resources yet" : "No resources found"}
                    </p>
                    <p className="text-sm mt-1 opacity-70">
                      {activeTab === "bookmarked"
                        ? "Bookmark resources to see them here"
                        : "Try adjusting your filters or search"}
                    </p>
                    {activeTab === "all" && (
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                        style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                      >
                        <Plus className="w-4 h-4" /> Add the first resource
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className={`grid gap-5 ${viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3"
                      : "grid-cols-1"}`}
                    >
                      {displayList.map(r => (
                        <ResourceCard
                          key={r._id} resource={r}
                          isLiked={likedIds.has(r._id)}
                          isBookmarked={bookmarkedIds.has(r._id)}
                          onLike={() => handleLike(r._id)}
                          onBookmark={() => handleBookmark(r._id)}
                          onView={() => navigate(`/resources/${r._id}`)}
                          viewMode={viewMode}
                          isDarkMode={isDarkMode}
                        />
                      ))}
                    </div>

                    {/* Pagination */}
                    {activeTab === "all" && pagination.pages > 1 && (
                      <div className="flex justify-center gap-2 mt-8">
                        {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                          <button
                            key={p}
                            onClick={() => fetchResources(p)}
                            className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                              pagination.page === p
                                ? "text-white shadow-md"
                                : isDarkMode ? "text-slate-400 hover:text-white border border-slate-600/40" : "text-gray-500 border border-gray-200"
                            }`}
                            style={pagination.page === p ? { background: "linear-gradient(135deg, #10b981, #059669)" } : {}}
                          >{p}</button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {/* ── SIDEBAR ── */}
          <div className="w-full xl:w-80 flex-shrink-0 space-y-6">
            {/* Stats card */}
            <div className={`rounded-2xl border p-5 ${card}`}>
              <h3 className={`font-bold text-base mb-4 ${text}`}>Resource Stats</h3>
              {[
                { label: "Total Resources", value: pagination.total || "—", color: "text-emerald-400" },
                { label: "Your Bookmarks",  value: bookmarked.length,       color: "text-blue-400"    },
                { label: "Categories",      value: CATEGORIES.length - 1,   color: "text-purple-400"  },
              ].map(s => (
                <div key={s.label} className="flex justify-between items-center py-2 border-b border-slate-700/30 last:border-0">
                  <span className={`text-sm ${sub}`}>{s.label}</span>
                  <span className={`text-sm font-bold ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Resource Types */}
            <div className={`rounded-2xl border p-5 ${card}`}>
              <h3 className={`font-bold text-base mb-4 ${text}`}>Browse by Type</h3>
              <div className="grid grid-cols-2 gap-2">
                {TYPES.slice(1).map(t => (
                  <button
                    key={t}
                    onClick={() => { setType(t); setActiveTab("all"); setShowFilters(true); }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      type === t
                        ? "text-white border-emerald-500/50"
                        : isDarkMode
                          ? "text-slate-400 border-slate-600/40 hover:text-white hover:border-slate-500"
                          : "text-gray-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-700"
                    }`}
                    style={type === t ? { background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(20,184,166,0.2))" } : {}}
                  >
                    <span className={type === t ? "text-emerald-400" : "text-slate-500"}>{TYPE_ICONS[t]}</span>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Level filter */}
            <div className={`rounded-2xl border p-5 ${card}`}>
              <h3 className={`font-bold text-base mb-4 ${text}`}>Difficulty Level</h3>
              <div className="space-y-2">
                {[
                  { l: "Beginner",     color: "text-emerald-400", bar: "bg-emerald-500", pct: "33%" },
                  { l: "Intermediate", color: "text-amber-400",   bar: "bg-amber-500",   pct: "66%" },
                  { l: "Advanced",     color: "text-rose-400",    bar: "bg-rose-500",    pct: "100%" },
                ].map(({ l, color, bar, pct }) => (
                  <button
                    key={l}
                    onClick={() => { setLevel(l); setActiveTab("all"); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all text-sm font-medium ${
                      level === l
                        ? "border-emerald-500/40 bg-emerald-500/10"
                        : isDarkMode ? "border-slate-600/30 hover:border-slate-500" : "border-gray-200 hover:border-emerald-200"
                    }`}
                  >
                    <span className={level === l ? color : sub}>{l}</span>
                    <div className="w-20 h-1.5 rounded-full bg-slate-700/40 overflow-hidden">
                      <div className={`h-full rounded-full ${bar}`} style={{ width: pct }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ADD RESOURCE MODAL ── */}
      {showAddForm && (
        <AddResourceForm
          isDarkMode={isDarkMode}
          onClose={() => setShowAddForm(false)}
          onAdded={handleResourceAdded}
        />
      )}
    </div>
  );
}
