// pages/Community.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "../hooks/useTheme";
import {
  Users, Search, X, LayoutList, Star, HelpCircle,
  MessageSquare, Bookmark, Sparkles, RefreshCw,
  ChevronDown, TrendingUp, Filter, Zap,
} from "lucide-react";
import { toast } from "react-toastify";
import * as communityApi from "../services/communityApi";
import CreatePost from "../components/community/CreatePost";
import PostCard from "../components/community/PostCard";
import TrendingTopics from "../components/community/TrendingTopics";

/* ── constants ── */
const TABS = [
  { id: "all",        label: "All",         icon: <LayoutList className="w-4 h-4" /> },
  { id: "post",       label: "Posts",       icon: <MessageSquare className="w-4 h-4" /> },
  { id: "question",   label: "Questions",   icon: <HelpCircle className="w-4 h-4" /> },
  { id: "discussion", label: "Discussions", icon: <Zap className="w-4 h-4" /> },
  { id: "saved",      label: "Saved",       icon: <Bookmark className="w-4 h-4" /> },
  { id: "recommended",label: "For You",     icon: <Sparkles className="w-4 h-4" /> },
];

const SORTS = [
  { value: "newest",     label: "Newest" },
  { value: "popular",    label: "Most Popular" },
  { value: "unanswered", label: "Unanswered" },
];

/* ── get current user from localStorage ── */
function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem("user")) || {}; }
  catch { return {}; }
}

export default function Community() {
  const { isDarkMode } = useTheme();
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?._id || currentUser?.id || "";

  /* ── state ── */
  const [posts,        setPosts]        = useState([]);
  const [recommended,  setRecommended]  = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [activeTab,    setActiveTab]    = useState("all");
  const [sort,         setSort]         = useState("newest");
  const [activeTag,    setActiveTag]    = useState("");
  const [search,       setSearch]       = useState("");
  const [debouncedQ,   setDebouncedQ]   = useState("");
  const [showSort,     setShowSort]     = useState(false);
  const [pagination,   setPagination]   = useState({ page: 1, pages: 1, total: 0 });

  const debRef = useRef();

  /* ── search debounce ── */
  useEffect(() => {
    clearTimeout(debRef.current);
    debRef.current = setTimeout(() => setDebouncedQ(search), 350);
    return () => clearTimeout(debRef.current);
  }, [search]);

  /* ── fetch ── */
  const fetchPosts = useCallback(async (page = 1, showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);
    try {
      const params = {
        page, limit: 12, sort,
        ...(activeTab !== "all" && activeTab !== "saved" && activeTab !== "recommended" && { postType: activeTab }),
        ...(activeTab === "saved"  && { saved: "true" }),
        ...(activeTag              && { tag: activeTag }),
        ...(debouncedQ             && { search: debouncedQ }),
      };
      const res = await communityApi.getPosts(params);
      setPosts(res.data || []);
      setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
    } catch { toast.error("Failed to load posts"); }
    finally { setLoading(false); setRefreshing(false); }
  }, [activeTab, sort, activeTag, debouncedQ]);

  const fetchRecommended = async () => {
    try { const r = await communityApi.getRecommended(); setRecommended(r.data || []); }
    catch {}
  };

  const fetchTrendingTags = async () => {
    try { const r = await communityApi.getTrendingTags(); setTrendingTags(r.data || []); }
    catch {}
  };

  useEffect(() => { fetchTrendingTags(); fetchRecommended(); }, []);
  useEffect(() => { if (activeTab !== "recommended") fetchPosts(1); }, [fetchPosts, activeTab]);

  /* ── handlers ── */
  const handlePosted = (newPost) => setPosts(p => [newPost, ...p]);
  const handleDelete = (id)      => setPosts(p => p.filter(x => x._id !== id));

  const handleTagClick = (tag) => {
    setActiveTag(p => (p === tag ? "" : tag));
    setActiveTab("all");
  };

  /* ── display list ── */
  const displayList = activeTab === "recommended" ? recommended : posts;

  /* ── styles ── */
  const bg    = isDarkMode ? "bg-gray-950" : "bg-gray-50";
  const card  = isDarkMode ? "bg-gray-900/90 border-slate-700/50" : "bg-white border-gray-200";
  const text  = isDarkMode ? "text-white"    : "text-gray-900";
  const sub   = isDarkMode ? "text-slate-400" : "text-gray-500";
  const input = isDarkMode
    ? "bg-gray-800/60 border-slate-600/40 text-white placeholder-slate-500 focus:border-emerald-500/60"
    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-emerald-400";

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300`}>

      {/* ── HERO HEADER ── */}
      <div className="relative overflow-hidden border-b border-slate-700/30"
        style={{ background: isDarkMode
          ? "linear-gradient(135deg, rgba(10,15,26,0.98) 0%, rgba(15,23,42,0.96) 60%, rgba(88,28,135,0.12) 100%)"
          : "linear-gradient(135deg, #faf5ff 0%, #f0fdf4 60%, #ede9fe 100%)" }}
      >
        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-10"
            style={{ background: "radial-gradient(circle, #a855f7, transparent)" }} />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full blur-3xl opacity-8"
            style={{ background: "radial-gradient(circle, #10b981, transparent)" }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ background: "linear-gradient(135deg, #a855f7, #8b5cf6)" }}>
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-3xl font-black ${text}`}>Community</h1>
                  <p className={`text-sm ${sub}`}>Ask · Share · Discuss · Grow Together</p>
                </div>
              </div>
              <p className={`text-base ${sub} max-w-xl`}>
                Connect with learners and experts. Ask questions, start discussions, and share knowledge
                tagged with the skills that matter to you.
              </p>
            </div>

            {/* Stats pills */}
            <div className="flex items-center gap-3">
              {[
                { label: "Posts", value: pagination.total || "—" },
                { label: "Tags",  value: trendingTags.length || "—" },
              ].map(s => (
                <div key={s.label} className={`px-4 py-2 rounded-xl border text-center ${card}`}>
                  <div className={`text-lg font-black ${text}`}>{s.value}</div>
                  <div className={`text-xs ${sub}`}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="mt-6 relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text" placeholder="Search posts, questions, discussions…"
              value={search} onChange={e => setSearch(e.target.value)}
              className={`w-full pl-12 pr-12 py-3.5 rounded-2xl border text-base outline-none transition-colors ${input}`}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col xl:flex-row gap-8">

          {/* ── MAIN FEED ── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Create post */}
            <CreatePost isDarkMode={isDarkMode} currentUser={currentUser} onPosted={handlePosted} />

            {/* Control bar */}
            <div className={`flex items-center gap-3 p-1.5 rounded-2xl border ${card}`}>
              {/* Tabs */}
              <div className="flex gap-1 flex-1 overflow-x-auto [scrollbar-width:none]">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setActiveTag(""); }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                      activeTab === tab.id
                        ? "text-white shadow-md"
                        : isDarkMode ? "text-slate-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                    }`}
                    style={activeTab === tab.id ? { background: "linear-gradient(135deg, #a855f7, #8b5cf6)" } : {}}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* Sort + refresh */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="relative">
                  <button onClick={() => setShowSort(p => !p)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                      isDarkMode ? "border-slate-600/40 text-slate-400 hover:text-white" : "border-gray-200 text-gray-500 hover:text-gray-900"
                    }`}>
                    <Filter className="w-3.5 h-3.5" />
                    {SORTS.find(s => s.value === sort)?.label}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {showSort && (
                    <div className={`absolute right-0 top-full mt-1 z-20 rounded-xl border shadow-xl overflow-hidden ${
                      isDarkMode ? "bg-gray-800 border-slate-700/50" : "bg-white border-gray-200"
                    }`} style={{ minWidth: 160 }}>
                      {SORTS.map(s => (
                        <button key={s.value}
                          onClick={() => { setSort(s.value); setShowSort(false); }}
                          className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                            sort === s.value
                              ? isDarkMode ? "text-purple-400 bg-purple-500/10" : "text-purple-600 bg-purple-50"
                              : isDarkMode ? "text-slate-300 hover:bg-gray-700/60" : "text-gray-700 hover:bg-gray-50"
                          }`}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => fetchPosts(1, false)}
                  className={`p-2 rounded-xl border transition-colors ${
                    isDarkMode ? "border-slate-600/40 text-slate-400 hover:text-white" : "border-gray-200 text-gray-400 hover:text-gray-700"
                  } ${refreshing ? "animate-spin" : ""}`}>
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Active tag banner */}
            {activeTag && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)" }}>
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300 font-semibold">Filtering by <strong>#{activeTag}</strong></span>
                <button onClick={() => setActiveTag("")} className="ml-auto p-0.5 text-purple-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Results meta */}
            {activeTab !== "recommended" && !loading && (
              <div className={`text-xs ${sub} flex items-center justify-between`}>
                <span>
                  {pagination.total} post{pagination.total !== 1 ? "s" : ""}
                  {debouncedQ && <> for "<span className="text-purple-400 font-semibold">{debouncedQ}</span>"</>}
                </span>
              </div>
            )}

            {/* Feed */}
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={`rounded-2xl border animate-pulse ${card}`} style={{ height: 200 }} />
                ))}
              </div>
            ) : displayList.length === 0 ? (
              <div className={`flex flex-col items-center py-24 ${sub}`}>
                <Users className="w-14 h-14 mb-4 opacity-20" />
                <p className="text-lg font-bold">
                  {activeTab === "saved" ? "No saved posts yet"
                    : activeTab === "recommended" ? "No recommendations yet"
                    : "Nothing here yet"}
                </p>
                <p className="text-sm mt-1 opacity-60">
                  {activeTab === "saved" ? "Save posts to read them later"
                    : activeTab === "recommended" ? "Complete your profile to get personalized suggestions"
                    : "Be the first to post something!"}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-5">
                  {displayList.map(p => (
                    <PostCard
                      key={p._id} post={p}
                      isDarkMode={isDarkMode}
                      currentUserId={currentUserId}
                      onDelete={handleDelete}
                      onRefresh={() => fetchPosts(pagination.page, false)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {activeTab !== "recommended" && pagination.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => fetchPosts(p)}
                        className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                          pagination.page === p
                            ? "text-white shadow-md"
                            : isDarkMode ? "text-slate-400 border border-slate-600/40 hover:text-white" : "text-gray-500 border border-gray-200"
                        }`}
                        style={pagination.page === p ? { background: "linear-gradient(135deg, #a855f7, #8b5cf6)" } : {}}>
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── SIDEBAR ── */}
          <div className="w-full xl:w-72 flex-shrink-0 space-y-5">

            {/* Stats card */}
            <div className={`rounded-2xl border p-5 ${card}`}>
              <h3 className={`font-bold text-sm mb-4 ${text}`}>Community Stats</h3>
              {[
                { label: "Total Posts",   val: pagination.total || "—", color: "text-purple-400" },
                { label: "Trending Tags", val: trendingTags.length || "—", color: "text-emerald-400" },
                { label: "Saved by You",  val: posts.filter(p => p.saves?.some(s => s.toString() === currentUserId)).length, color: "text-amber-400" },
              ].map(s => (
                <div key={s.label} className={`flex justify-between items-center py-2 border-b last:border-0 ${isDarkMode ? "border-slate-700/30" : "border-gray-100"}`}>
                  <span className={`text-sm ${sub}`}>{s.label}</span>
                  <span className={`text-sm font-bold ${s.color}`}>{s.val}</span>
                </div>
              ))}
            </div>

            {/* Trending topics */}
            <TrendingTopics tags={trendingTags} isDarkMode={isDarkMode} onTagClick={handleTagClick} activeTag={activeTag} />

            {/* Tips card */}
            <div className={`rounded-2xl border p-5 ${card}`}
              style={{ background: isDarkMode ? "linear-gradient(135deg, rgba(168,85,247,0.05), rgba(139,92,246,0.05))" : undefined }}>
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-amber-400" />
                <h3 className={`font-bold text-sm ${text}`}>Community Tips</h3>
              </div>
              {[
                "Tag your posts with relevant skills for better discovery",
                "Use Question type for technical problems",
                "Accept the best answer to help others",
                "Share learning resources in your posts",
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5 mb-2.5 last:mb-0">
                  <span className="w-5 h-5 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0 mt-0.5"
                    style={{ background: "linear-gradient(135deg, #a855f7, #8b5cf6)" }}>{i + 1}</span>
                  <p className={`text-xs leading-relaxed ${sub}`}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
