import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Swords, Cpu, Calendar, LayoutGrid, Trophy, History,
  RefreshCw, Loader2, Sparkles, Bot, ChevronRight,
  CheckCircle, Clock, XCircle, Zap, Timer,
} from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import {
  getAllChallenges,
  getUserHistory,
  getLeaderboard,
  getUserStats,
  generateAIChallenge,
  seedChallenges,
  getDailyChallenge,
} from "../services/challengeApi";
import ChallengeCard from "../components/challenges/ChallengeCard";
import ChallengeFilters from "../components/challenges/ChallengeFilters";
import ChallengeStats from "../components/challenges/ChallengeStats";
import ChallengeLeaderboard from "../components/challenges/ChallengeLeaderboard";
import MyCreatedChallenges from "../components/challenges/MyCreatedChallenges";
import { toast } from "react-toastify";

const TABS = [
  { id: "challenges", label: "Active Challenges", icon: LayoutGrid },
  { id: "created", label: "Manage My Challenges", icon: Swords },
  { id: "history", label: "My History", icon: History },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
];

const STATUS_CONFIG = {
  Accepted: { color: "text-green-400 bg-green-500/10 border-green-500/30", icon: CheckCircle },
  Rejected: { color: "text-red-400 bg-red-500/10 border-red-500/30", icon: XCircle },
  Pending: { color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30", icon: Clock },
};

const AI_CATEGORIES = [
  "Web Development", "Data Science", "UI/UX Design", "AI & Machine Learning",
];

export default function Challenges() {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("challenges");
  const [challenges, setChallenges] = useState([]);
  const [history, setHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState(null);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [dailyCountdown, setDailyCountdown] = useState("");
  const countdownRef = useRef(null);

  const [filters, setFilters] = useState({ category: "All", difficulty: "All", type: "all" });
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCategory, setAiCategory] = useState("Web Development");
  const [aiDiff, setAiDiff] = useState("Medium");
  const [showAIPanel, setShowAIPanel] = useState(false);

  // Fetch daily challenge and start countdown timer
  const fetchDailyChallenge = useCallback(async () => {
    try {
      const res = await getDailyChallenge();
      setDailyChallenge(res.data);

      // Start live countdown
      if (countdownRef.current) clearInterval(countdownRef.current);
      const expiresAt = res.expiresAt ? new Date(res.expiresAt) : null;
      if (!expiresAt) return;

      const tick = () => {
        const diff = expiresAt.getTime() - Date.now();
        if (diff <= 0) {
          setDailyCountdown("Refreshing...");
          clearInterval(countdownRef.current);
          // Auto re-fetch when the timer hits zero
          setTimeout(fetchDailyChallenge, 2000);
          return;
        }
        const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
        const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
        const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
        setDailyCountdown(`${h}:${m}:${s}`);
      };
      tick();
      countdownRef.current = setInterval(tick, 1000);
    } catch {
      // Silently fail — daily challenge unavailable
    }
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, []);

  // Fetch challenges with current filters
  const fetchChallenges = useCallback(async () => {
    try {
      const params = {};
      if (filters.category !== "All") params.category = filters.category;
      if (filters.difficulty !== "All") params.difficulty = filters.difficulty;
      if (filters.type !== "all") params.type = filters.type;
      const res = await getAllChallenges(params);
      setChallenges(res.data || []);
    } catch {
      toast.error("Failed to load challenges.");
    }
  }, [filters]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [hRes, lRes, sRes] = await Promise.allSettled([
        getUserHistory(),
        getLeaderboard(),
        getUserStats(),
      ]);
      setHistory(hRes.status === "fulfilled" ? hRes.value.data || [] : []);
      setLeaderboard(lRes.status === "fulfilled" ? lRes.value.data || [] : []);
      setStats(sRes.status === "fulfilled" ? sRes.value.data : null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchChallenges(), fetchAll(), fetchDailyChallenge()]);
    };
    init();
  }, []);

  // Re-fetch challenges when filters change
  useEffect(() => {
    fetchChallenges();
  }, [filters]);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await seedChallenges();
      toast.success(res.message || "Challenges seeded!");
      await fetchChallenges();
    } catch {
      toast.error("Failed to seed challenges.");
    } finally {
      setSeeding(false);
    }
  };

  const handleGenerateAI = async () => {
    setAiLoading(true);
    try {
      const res = await generateAIChallenge({ skillCategory: aiCategory, difficulty: aiDiff });
      toast.success("🤖 AI Challenge generated!");
      setChallenges((prev) => [res.data, ...prev]);
      setShowAIPanel(false);
    } catch {
      toast.error("AI generation failed. Try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleStartChallenge = (challenge) => {
    navigate(`/skill-hub/challenges/${challenge._id}`);
  };

  const cardBase = isDarkMode
    ? "bg-gray-900/60 border-gray-800 backdrop-blur-sm"
    : "bg-white border-gray-200";

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-950 via-slate-950 to-gray-900"
          : "bg-gradient-to-br from-gray-50 via-slate-50 to-white"
      }`}
    >
      {/* Decorative blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-fuchsia-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* ── Header ── */}
        <div className="mb-10">
          {/* Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fuchsia-400/10 border border-fuchsia-400/20 mb-5">
            <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
            <span className="text-xs font-semibold text-fuchsia-400 uppercase tracking-widest">Skill Challenges</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1
                className={`text-4xl sm:text-5xl font-extrabold tracking-tight mb-3 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <Swords className="inline w-10 h-10 mr-3 text-fuchsia-500 -mt-1" />
                Challenges
              </h1>
              <p className={`text-lg ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                Test your skills, earn XP, and climb the leaderboard.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                id="ai-generate-btn"
                onClick={() => setShowAIPanel((p) => !p)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-700 text-white text-sm font-semibold shadow-md hover:opacity-90 active:scale-95 transition-all"
              >
                <Bot className="w-4 h-4" />
                AI Generate
              </button>
              <button
                id="seed-challenges-btn"
                onClick={handleSeed}
                disabled={seeding}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all active:scale-95 ${
                  isDarkMode
                    ? "border-gray-700 text-slate-300 hover:border-fuchsia-500/50 hover:text-fuchsia-400"
                    : "border-gray-200 text-gray-600 hover:border-fuchsia-400 hover:text-fuchsia-600"
                }`}
              >
                {seeding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Seed Data
              </button>
            </div>
          </div>
        </div>

        {/* AI Generate Panel */}
        {showAIPanel && (
          <div
            className={`rounded-2xl border p-5 mb-6 animate-in fade-in slide-in-from-top-2 duration-300 ${
              isDarkMode
                ? "bg-gradient-to-br from-fuchsia-900/20 to-purple-900/20 border-fuchsia-500/20"
                : "bg-gradient-to-br from-fuchsia-50 to-purple-50 border-fuchsia-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-fuchsia-500" />
              <h3 className={`font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Generate AI Challenge
              </h3>
            </div>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-48">
                <label className={`text-xs font-medium block mb-1 ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}>
                  Category
                </label>
                <select
                  value={aiCategory}
                  onChange={(e) => setAiCategory(e.target.value)}
                  className={`w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500 ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                >
                  {AI_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="min-w-32">
                <label className={`text-xs font-medium block mb-1 ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}>
                  Difficulty
                </label>
                <select
                  value={aiDiff}
                  onChange={(e) => setAiDiff(e.target.value)}
                  className={`w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500 ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
              <button
                onClick={handleGenerateAI}
                disabled={aiLoading}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-700 text-white text-sm font-semibold shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
              >
                {aiLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                ) : (
                  <><Cpu className="w-4 h-4" /> Generate</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <ChallengeStats stats={stats} isDarkMode={isDarkMode} />

        {/* Tabs */}
        <div
          className={`flex gap-1 p-1 rounded-2xl mb-6 ${
            isDarkMode ? "bg-gray-900/60 border border-gray-800" : "bg-gray-100"
          }`}
        >
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              id={`tab-${id}`}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === id
                  ? "bg-fuchsia-600 text-white shadow-md shadow-fuchsia-500/20"
                  : isDarkMode
                  ? "text-slate-400 hover:text-white"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* ── Challenges Tab ── */}
        {activeTab === "challenges" && (
          <div>
            {/* ── Daily Challenge Card ── */}
            {dailyChallenge && (
              <div
                className={`relative overflow-hidden rounded-2xl border mb-6 p-5 ${ 
                  isDarkMode
                    ? "bg-gradient-to-br from-amber-900/20 via-orange-900/10 to-yellow-900/10 border-amber-500/25"
                    : "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-amber-300"
                }`}
              >
                {/* Glow blob */}
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Icon + badge */}
                  <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-400/15 border border-amber-400/25">
                    <Calendar className="w-7 h-7 text-amber-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-widest text-amber-500 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                        🌟 Daily Challenge
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                          dailyChallenge.difficulty === "Easy"
                            ? "text-green-400 bg-green-400/10 border-green-400/25"
                            : dailyChallenge.difficulty === "Hard"
                            ? "text-red-400 bg-red-400/10 border-red-400/25"
                            : "text-yellow-400 bg-yellow-400/10 border-yellow-400/25"
                        }`}
                      >
                        {dailyChallenge.difficulty}
                      </span>
                      <span className={`text-xs ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
                        {dailyChallenge.skillCategory}
                      </span>
                    </div>
                    <p className={`font-bold text-lg leading-snug truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {dailyChallenge.title}
                    </p>
                    <p className={`text-sm mt-0.5 line-clamp-1 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                      {dailyChallenge.description}
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    {/* Live countdown */}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
                      isDarkMode ? "bg-gray-900/60 border-amber-500/20" : "bg-white border-amber-200"
                    }`}>
                      <Timer className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-xs font-mono font-bold text-amber-500 tabular-nums">
                        {dailyCountdown || "Loading..."}
                      </span>
                    </div>
                    <span className={`text-xs ${isDarkMode ? "text-slate-600" : "text-gray-400"}`}>resets in</span>
                    {/* XP reward badge */}
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/25">
                      <Zap className="w-3.5 h-3.5 text-fuchsia-400" />
                      <span className="text-xs font-bold text-fuchsia-400">+{dailyChallenge.rewardXP} XP</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartChallenge(dailyChallenge)}
                    className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold shadow-md hover:opacity-90 active:scale-95 transition-all"
                  >
                    Start Now
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <ChallengeFilters
              filters={filters}
              onChange={setFilters}
              isDarkMode={isDarkMode}
            />

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-10 h-10 rounded-full border-4 border-fuchsia-500 border-t-transparent animate-spin" />
                <p className={isDarkMode ? "text-slate-500" : "text-gray-400"}>Loading challenges...</p>
              </div>
            ) : challenges.length === 0 ? (
              <div className={`text-center py-16 rounded-2xl border ${isDarkMode ? "bg-gray-900/60 border-gray-800" : "bg-white border-gray-200"}`}>
                <Swords className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}>
                  No challenges found
                </p>
                <p className={`text-sm mb-4 ${isDarkMode ? "text-slate-600" : "text-gray-400"}`}>
                  Try adjusting filters or seed initial data.
                </p>
                <button
                  onClick={handleSeed}
                  disabled={seeding}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-fuchsia-600 text-white text-sm font-semibold hover:bg-fuchsia-700 transition-colors"
                >
                  {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Load Sample Challenges
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {challenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge._id}
                    challenge={challenge}
                    onStart={handleStartChallenge}
                    isDarkMode={isDarkMode}
                  />
                ))}
              </div>
            )}
          </div>
        )}


        {/* ── History Tab ── */}
        {activeTab === "history" && (
          <div>
            <h2 className={`text-xl font-bold mb-5 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              My Challenge History
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-fuchsia-500 animate-spin" />
              </div>
            ) : history.length === 0 ? (
              <div className={`text-center py-16 rounded-2xl border ${isDarkMode ? "bg-gray-900/60 border-gray-800" : "bg-white border-gray-200"}`}>
                <History className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className={`font-semibold mb-1 ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}>No submissions yet</p>
                <p className={`text-sm ${isDarkMode ? "text-slate-600" : "text-gray-400"}`}>
                  Complete your first challenge to see it here.
                </p>
              </div>
            ) : (
              <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? "bg-gray-900/60 border-gray-800" : "bg-white border-gray-200"}`}>
                {/* Table header */}
                <div
                  className={`px-5 py-3 border-b grid grid-cols-12 gap-2 text-xs font-semibold uppercase tracking-widest ${
                    isDarkMode
                      ? "border-gray-800 text-slate-500 bg-gray-950/50"
                      : "border-gray-100 text-gray-400 bg-gray-50"
                  }`}
                >
                  <span className="col-span-5">Challenge</span>
                  <span className="col-span-2">Category</span>
                  <span className="col-span-2">Status</span>
                  <span className="col-span-1 text-right">XP</span>
                  <span className="col-span-2 text-right">Date</span>
                </div>

                {/* Rows */}
                <div className="divide-y divide-gray-800/20">
                  {history.map((sub) => {
                    const cfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.Pending;
                    const StatusIcon = cfg.icon;
                    return (
                      <div
                        key={sub._id}
                        className={`px-5 py-4 grid grid-cols-12 gap-2 items-center transition-colors ${
                          isDarkMode ? "hover:bg-gray-800/40" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="col-span-5">
                          <p className={`font-semibold text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {sub.challengeId?.title || "Deleted Challenge"}
                          </p>
                          {sub.challengeId?.difficulty && (
                            <span
                              className={`text-xs ${
                                sub.challengeId.difficulty === "Easy"
                                  ? "text-green-400"
                                  : sub.challengeId.difficulty === "Hard"
                                  ? "text-red-400"
                                  : "text-yellow-400"
                              }`}
                            >
                              {sub.challengeId.difficulty}
                            </span>
                          )}
                        </div>
                        <div className={`col-span-2 text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                          {sub.challengeId?.skillCategory || "—"}
                        </div>
                        <div className="col-span-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {sub.status}
                          </span>
                        </div>
                        <div className={`col-span-1 text-right text-sm font-bold ${isDarkMode ? "text-fuchsia-400" : "text-fuchsia-600"}`}>
                          {sub.xpAwarded > 0 ? `+${sub.xpAwarded}` : "—"}
                        </div>
                        <div className={`col-span-2 text-right text-xs ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
                          {new Date(sub.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Leaderboard Tab ── */}
        {activeTab === "leaderboard" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                🏆 Global Leaderboard
              </h2>
              <span className={`text-xs ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
                By total XP earned
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-fuchsia-500 animate-spin" />
              </div>
            ) : (
              <ChallengeLeaderboard data={leaderboard} isDarkMode={isDarkMode} />
            )}
          </div>
        )}

        {/* ── Manage Tab ── */}
        {activeTab === "created" && (
          <MyCreatedChallenges isDarkMode={isDarkMode} />
        )}

        {/* Footer note */}
        <div className="mt-16 text-center">
          <p className={`text-sm ${isDarkMode ? "text-slate-700" : "text-gray-300"}`}>
            New challenges added regularly. Keep sharpening your skills! 🚀
          </p>
        </div>
      </div>
    </div>
  );
}
