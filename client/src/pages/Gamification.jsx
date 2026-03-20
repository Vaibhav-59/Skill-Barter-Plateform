// pages/Gamification.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTheme } from "../hooks/useTheme";

import {
  getGamification,
  getLeaderboard,
  updateGamification,
} from "../services/gamificationApi";

import ProgressCard          from "../components/gamification/ProgressCard";
import BadgeGrid             from "../components/gamification/BadgeGrid";
import StreakTracker         from "../components/gamification/StreakTracker";
import Leaderboard           from "../components/gamification/Leaderboard";
import AchievementProgress   from "../components/gamification/AchievementProgress";
import PointsSystem          from "../components/gamification/PointsSystem";
import RewardsSection        from "../components/gamification/RewardsSection";

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-12 h-12 rounded-full border-4 border-amber-500/30 border-t-amber-500 animate-spin" />
    </div>
  );
}

// ─── Tab nav ──────────────────────────────────────────────────────────────────
const TABS = [
  { id: "overview",      label: "Overview",       icon: "🎮" },
  { id: "badges",        label: "Badges",          icon: "🏅" },
  { id: "streak",        label: "Streak",          icon: "🔥" },
  { id: "leaderboard",  label: "Leaderboard",     icon: "🏆" },
  { id: "achievements",  label: "Achievements",    icon: "🎯" },
  { id: "points",        label: "XP System",       icon: "⚡" },
  { id: "rewards",       label: "Rewards",         icon: "🎁" },
];

// Removed DEMO_ACTIONS since auto-updates are now implemented in the backend.

export default function Gamification() {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const [activeTab,   setActiveTab]   = useState("overview");
  const [data,        setData]        = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading,     setLoading]     = useState(true);

  // Current user id from localStorage
  const currentUserId = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}")._id; }
    catch { return null; }
  })();

  const fetchData = useCallback(async () => {
    try {
      const [gamRes, lbRes] = await Promise.all([
        getGamification(),
        getLeaderboard(),
      ]);
      if (gamRes.success) setData(gamRes.data);
      if (lbRes.success)  setLeaderboard(lbRes.data);
    } catch (err) {
      toast.error("Could not load gamification data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);


  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-950 via-slate-950 to-gray-900"
          : "bg-gradient-to-br from-gray-50 via-orange-50/30 to-white"
      }`}
    >
      {/* Decorative blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-yellow-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Back button ── */}
        <button
          onClick={() => navigate("/skill-hub")}
          className={`mb-6 flex items-center gap-2 text-sm font-medium transition-colors ${
            isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          ← Back to Skill Hub
        </button>

        {/* ── Header ── */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 mb-4">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Gamification</span>
          </div>
          <h1 className={`text-4xl sm:text-5xl font-extrabold tracking-tight mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Level Up Your{" "}
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              Skills
            </span>
          </h1>
          <p className={`text-lg max-w-2xl mx-auto ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
            Earn XP, unlock badges, maintain streaks and rise on the leaderboard!
          </p>

          {/* Quick stats strip */}
          {data && (
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              {[
                { label: "XP",       value: data.xp?.toLocaleString() || "0",  icon: "⚡" },
                { label: "Level",    value: data.level || 1,                    icon: "🎮" },
                { label: "Streak",   value: `${data.learningStreak || 0}d 🔥`,  icon: "🔥" },
                { label: "Sessions", value: data.sessionsCompleted || 0,         icon: "📅" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl font-extrabold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                    {s.value}
                  </div>
                  <div className={`text-xs mt-0.5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>


        {/* ── Tab nav ── */}
        <div className={`mb-8 p-1 rounded-2xl flex flex-wrap gap-1 ${isDarkMode ? "bg-white/5" : "bg-gray-100"}`}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/20"
                  : isDarkMode
                  ? "text-gray-400 hover:text-white hover:bg-white/10"
                  : "text-gray-500 hover:text-gray-900 hover:bg-white"
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        {loading ? (
          <Spinner />
        ) : (
          <div>
            {activeTab === "overview" && (
              <div className="space-y-6">
                <ProgressCard data={data} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <StreakTracker data={data} />
                  <AchievementProgress achievements={data?.achievements || []} />
                </div>
              </div>
            )}

            {activeTab === "badges" && (
              <BadgeGrid
                badges={data?.badges || []}
                badgeCatalogue={data?.badgeCatalogue || []}
              />
            )}

            {activeTab === "streak" && <StreakTracker data={data} />}

            {activeTab === "leaderboard" && (
              <Leaderboard entries={leaderboard} currentUserId={currentUserId} />
            )}

            {activeTab === "achievements" && (
              <AchievementProgress achievements={data?.achievements || []} />
            )}

            {activeTab === "points" && (
              <PointsSystem xpHistory={data?.xpHistory || []} />
            )}

            {activeTab === "rewards" && (
              <RewardsSection xp={data?.xp || 0} />
            )}
          </div>
        )}

        {/* ── Footer ── */}
        <div className="mt-16 text-center">
          <p className={`text-sm ${isDarkMode ? "text-slate-600" : "text-gray-400"}`}>
            More rewards, seasonal leaderboards & spin wheel coming soon 🚀
          </p>
        </div>
      </div>
    </div>
  );
}
