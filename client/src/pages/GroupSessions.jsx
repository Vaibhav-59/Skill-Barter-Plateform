import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { toast } from "react-toastify";

import SessionCard from "../components/groupsessions/SessionCard";
import CreateSessionForm from "../components/groupsessions/CreateSessionForm";
import ParticipantsList from "../components/groupsessions/ParticipantsList";
import SessionChat from "../components/groupsessions/SessionChat";

import {
  getAllSessions,
  getMySessions,
  getJoinedSessions,
  getMyStats,
  joinSession,
  leaveSession,
  updateSession,
  deleteSession,
} from "../services/groupSessionApi";

const NAV_TABS = [
  { id: "upcoming", label: "Upcoming", icon: "📅" },
  { id: "live", label: "Live Now", icon: "🔴" },
  { id: "create", label: "Create", icon: "➕" },
  { id: "my", label: "My Sessions", icon: "🎤" },
  { id: "joined", label: "Joined", icon: "👋" },
];

function StatCard({ label, value, icon, color, isDarkMode }) {
  return (
    <div
      className={`rounded-2xl border p-4 flex items-center gap-4 transition-all hover:scale-[1.02] ${
        isDarkMode
          ? "bg-white/[0.03] border-white/[0.07]"
          : "bg-white border-gray-100 shadow-sm"
      }`}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${color}`}
      >
        {icon}
      </div>
      <div>
        <p
          className={`text-2xl font-black ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {value ?? "—"}
        </p>
        <p
          className={`text-xs font-medium ${
            isDarkMode ? "text-slate-500" : "text-gray-400"
          }`}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

// Modal overlay wrapper
function Modal({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

export default function GroupSessions() {
  const { isDarkMode } = useTheme();

  // Tab
  const [activeTab, setActiveTab] = useState("upcoming");

  // Data
  const [stats, setStats] = useState(null);
  const [allSessions, setAllSessions] = useState([]);
  const [mySessions, setMySessions] = useState([]);
  const [joinedSessions, setJoinedSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [participantsSession, setParticipantsSession] = useState(null);
  const [chatSession, setChatSession] = useState(null);
  const [editSession, setEditSession] = useState(null);
  const [detailSession, setDetailSession] = useState(null);
  const [recordingModal, setRecordingModal] = useState(null);
  const [recordingLink, setRecordingLink] = useState("");

  // Search/filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Current user id from localStorage
  const currentUserId = (() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      return u._id || u.id || null;
    } catch {
      return null;
    }
  })();

  // ── Data fetching ────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, allRes, myRes, joinedRes] = await Promise.all([
        getMyStats(),
        getAllSessions(),
        getMySessions(),
        getJoinedSessions(),
      ]);
      setStats(statsRes.data);
      setAllSessions(allRes.data || []);
      setMySessions(myRes.data || []);
      setJoinedSessions(joinedRes.data || []);
    } catch (err) {
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Derived lists ────────────────────────────────────────────────────────
  const liveSessions = allSessions.filter((s) => s.status === "live");

  const upcomingSessions = allSessions.filter(
    (s) => s.status === "scheduled" || s.status === "live"
  );

  const filteredUpcoming = upcomingSessions.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.title?.toLowerCase().includes(q) ||
      s.skill?.toLowerCase().includes(q) ||
      s.hostUserId?.name?.toLowerCase().includes(q)
    );
  });

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleJoin = async (id) => {
    try {
      await joinSession(id);
      toast.success("Joined session! 🎉");
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to join");
    }
  };

  const handleLeave = async (id) => {
    try {
      await leaveSession(id);
      toast.success("Left session");
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to leave");
    }
  };

  const handleStart = async (id) => {
    try {
      await updateSession(id, { status: "live" });
      toast.success("Session is now live! 🔴");
      fetchAll();
    } catch (err) {
      toast.error("Failed to start session");
    }
  };

  const handleComplete = async (id) => {
    try {
      await updateSession(id, { status: "completed" });
      toast.success("Session marked as completed! Credits awarded 🏆");
      fetchAll();
    } catch (err) {
      toast.error("Failed to complete session");
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this session?")) return;
    try {
      await updateSession(id, { status: "cancelled" });
      toast.success("Session cancelled");
      fetchAll();
    } catch (err) {
      toast.error("Failed to cancel session");
    }
  };

  const handleSaveRecording = async () => {
    if (!recordingModal) return;
    try {
      await updateSession(recordingModal._id, { recordingLink });
      toast.success("Recording link saved!");
      setRecordingModal(null);
      setRecordingLink("");
      fetchAll();
    } catch {
      toast.error("Failed to save recording link");
    }
  };

  // ── Skeleton ─────────────────────────────────────────────────────────────
  const SkeletonCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className={`rounded-2xl border h-64 animate-pulse ${
            isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-100 border-gray-200"
          }`}
        />
      ))}
    </div>
  );

  const EmptyState = ({ icon, title, sub, action }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3
        className={`font-bold text-lg mb-2 ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}
      >
        {title}
      </h3>
      <p
        className={`text-sm mb-6 max-w-xs ${
          isDarkMode ? "text-slate-400" : "text-gray-500"
        }`}
      >
        {sub}
      </p>
      {action}
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-950 via-slate-950 to-gray-900"
          : "bg-gradient-to-br from-gray-50 via-slate-50 to-white"
      }`}
    >
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="mb-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs mb-5">
            <Link
              to="/skill-hub"
              className={`font-medium hover:underline ${
                isDarkMode
                  ? "text-slate-500 hover:text-slate-300"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Skill Hub
            </Link>
            <span className={isDarkMode ? "text-slate-700" : "text-gray-300"}>
              /
            </span>
            <span
              className={`font-semibold ${
                isDarkMode ? "text-blue-400" : "text-blue-600"
              }`}
            >
              Group Sessions
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-400/10 border border-blue-400/20 mb-4">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                  Collaborative Learning
                </span>
              </div>
              <h1
                className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Group{" "}
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  Sessions
                </span>
              </h1>
              <p
                className={`mt-3 text-base sm:text-lg max-w-xl leading-relaxed ${
                  isDarkMode ? "text-slate-400" : "text-gray-500"
                }`}
              >
                Host or join group learning sessions. Teach a skill, earn
                credits, and grow together.
              </p>
            </div>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setActiveTab("create")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105"
              >
                <span>+</span> Host Session
              </button>
              <Link
                to="/skill-hub/time-banking"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:scale-105 ${
                  isDarkMode
                    ? "border-white/10 text-slate-300 hover:text-white hover:border-white/20 bg-white/5 hover:bg-white/10"
                    : "border-gray-200 text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 shadow-sm"
                }`}
              >
                <span>💳</span> Time Banking
              </Link>
            </div>
          </div>
        </div>

        {/* ── Stats Row ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <StatCard
            label="Sessions Hosted"
            value={stats?.hosted ?? 0}
            icon="🎤"
            color="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-blue-400"
            isDarkMode={isDarkMode}
          />
          <StatCard
            label="Sessions Joined"
            value={stats?.joined ?? 0}
            icon="👋"
            color="bg-gradient-to-br from-violet-500/20 to-purple-500/20 text-violet-400"
            isDarkMode={isDarkMode}
          />
          <StatCard
            label="Upcoming"
            value={stats?.upcoming ?? 0}
            icon="📅"
            color="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400"
            isDarkMode={isDarkMode}
          />
          <StatCard
            label="Completed"
            value={stats?.completed ?? 0}
            icon="✅"
            color="bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400"
            isDarkMode={isDarkMode}
          />
        </div>

        {/* ── Tab Navigation ────────────────────────────────────────────── */}
        <div
          className={`flex gap-1 p-1 rounded-2xl mb-8 w-fit overflow-x-auto ${
            isDarkMode
              ? "bg-white/5 border border-white/[0.07]"
              : "bg-gray-100 border border-gray-200"
          }`}
        >
          {NAV_TABS.map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                  : isDarkMode
                  ? "text-slate-400 hover:text-white hover:bg-white/5"
                  : "text-gray-500 hover:text-gray-900 hover:bg-white"
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              {/* Count badges */}
              {tab.id === "live" && liveSessions.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {liveSessions.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Content ──────────────────────────────────────────────────────── */}
        <div>
          {/* ── UPCOMING TAB ──────────────────────────────────────────────── */}
          {activeTab === "upcoming" && (
            <div>
              {/* Search + filter bar */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search sessions, skills or hosts…"
                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                      isDarkMode
                        ? "bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-blue-500/40"
                        : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-300 shadow-sm"
                    }`}
                  />
                </div>
              </div>

              {loading ? (
                <SkeletonCards />
              ) : filteredUpcoming.length === 0 ? (
                <EmptyState
                  icon="📅"
                  title="No upcoming sessions"
                  sub="Be the first to host a group session and start earning credits!"
                  action={
                    <button
                      onClick={() => setActiveTab("create")}
                      className="px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:scale-105 transition-all shadow-lg shadow-blue-500/20"
                    >
                      + Host a Session
                    </button>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredUpcoming.map((s) => (
                    <SessionCard
                      key={s._id}
                      session={s}
                      currentUserId={currentUserId}
                      variant={s.status === "live" ? "live" : "upcoming"}
                      onJoin={handleJoin}
                      onViewParticipants={(sess) => setParticipantsSession(sess)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── LIVE TAB ──────────────────────────────────────────────────── */}
          {activeTab === "live" && (
            <div>
              {loading ? (
                <SkeletonCards />
              ) : liveSessions.length === 0 ? (
                <EmptyState
                  icon="🔴"
                  title="No live sessions right now"
                  sub="Start a session to go live and teach your skill to multiple learners!"
                  action={
                    <button
                      onClick={() => setActiveTab("my")}
                      className="px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-red-600 to-rose-600 text-white hover:scale-105 transition-all"
                    >
                      Go to My Sessions
                    </button>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {liveSessions.map((s) => (
                    <SessionCard
                      key={s._id}
                      session={s}
                      currentUserId={currentUserId}
                      variant="live"
                      onJoin={handleJoin}
                      onViewParticipants={(sess) => setParticipantsSession(sess)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── CREATE TAB ────────────────────────────────────────────────── */}
          {activeTab === "create" && (
            <div className="max-w-2xl mx-auto">
              <div
                className={`rounded-2xl border overflow-hidden ${
                  isDarkMode
                    ? "bg-white/[0.03] border-white/[0.07]"
                    : "bg-white border-gray-100 shadow-sm"
                }`}
              >
                {/* Card header */}
                <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-xl">
                      🚀
                    </div>
                    <div>
                      <h2
                        className={`text-xl font-bold ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Host a Group Session
                      </h2>
                      <p
                        className={`text-xs ${
                          isDarkMode ? "text-slate-400" : "text-gray-500"
                        }`}
                      >
                        Teach a skill and earn credits for every participant
                      </p>
                    </div>
                  </div>
                  <CreateSessionForm
                    onSuccess={() => {
                      fetchAll();
                      setActiveTab("my");
                    }}
                  />
                </div>
              </div>

              {/* Credit info banner */}
              <div
                className={`mt-6 rounded-2xl border p-5 ${
                  isDarkMode
                    ? "bg-amber-500/5 border-amber-500/20"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💡</div>
                  <div>
                    <h4
                      className={`font-bold text-sm mb-1 ${
                        isDarkMode ? "text-amber-300" : "text-amber-800"
                      }`}
                    >
                      Credit Rewards
                    </h4>
                    <p
                      className={`text-xs leading-relaxed ${
                        isDarkMode ? "text-amber-400/80" : "text-amber-700"
                      }`}
                    >
                      As a host, you earn <strong>1 credit per participant</strong>{" "}
                      when you mark a session as completed. A session with 10
                      participants earns you 10 credits!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── MY SESSIONS TAB ─────────────────────────────────────────── */}
          {activeTab === "my" && (
            <div>
              {loading ? (
                <SkeletonCards />
              ) : mySessions.length === 0 ? (
                <EmptyState
                  icon="🎤"
                  title="You haven't hosted any sessions"
                  sub="Create your first group session and start teaching!"
                  action={
                    <button
                      onClick={() => setActiveTab("create")}
                      className="px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:scale-105 transition-all shadow-lg shadow-blue-500/20"
                    >
                      + Create Session
                    </button>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {mySessions.map((s) => (
                    <div key={s._id} className="flex flex-col gap-2">
                      <SessionCard
                        session={s}
                        currentUserId={currentUserId}
                        variant="my"
                        onStart={handleStart}
                        onCancel={handleCancel}
                        onEdit={(sess) => setEditSession(sess)}
                        onViewParticipants={(sess) =>
                          setParticipantsSession(sess)
                        }
                      />
                      {/* Extra host actions */}
                      <div className="flex gap-2 px-1">
                        <button
                          onClick={() => setChatSession(s)}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all hover:scale-105 ${
                            isDarkMode
                              ? "border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                              : "border-gray-200 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          💬 Chat
                        </button>
                        {s.status === "live" && (
                          <button
                            onClick={() => handleComplete(s._id)}
                            className="flex-1 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all hover:scale-105"
                          >
                            ✓ Complete
                          </button>
                        )}
                        {(s.status === "live" || s.status === "completed") && (
                          <button
                            onClick={() => {
                              setRecordingModal(s);
                              setRecordingLink(s.recordingLink || "");
                            }}
                            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all hover:scale-105 ${
                              isDarkMode
                                ? "border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                                : "border-gray-200 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            🎥 Recording
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── JOINED TAB ──────────────────────────────────────────────── */}
          {activeTab === "joined" && (
            <div>
              {loading ? (
                <SkeletonCards />
              ) : joinedSessions.length === 0 ? (
                <EmptyState
                  icon="👋"
                  title="You haven't joined any sessions"
                  sub="Browse upcoming sessions and join one to start learning!"
                  action={
                    <button
                      onClick={() => setActiveTab("upcoming")}
                      className="px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:scale-105 transition-all"
                    >
                      Browse Sessions
                    </button>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {joinedSessions.map((s) => (
                    <div key={s._id} className="flex flex-col gap-2">
                      <SessionCard
                        session={s}
                        currentUserId={currentUserId}
                        variant="joined"
                        onLeave={handleLeave}
                        onViewDetails={(sess) => setDetailSession(sess)}
                        onJoinMeeting={() =>
                          window.open(s.meetingLink, "_blank")
                        }
                      />
                      <button
                        onClick={() => setChatSession(s)}
                        className={`py-1.5 rounded-xl text-xs font-semibold border transition-all hover:scale-105 mx-1 ${
                          isDarkMode
                            ? "border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                            : "border-gray-200 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        💬 Session Chat
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── MODALS ────────────────────────────────────────────────────────── */}

      {/* Participants Modal */}
      {participantsSession && (
        <Modal onClose={() => setParticipantsSession(null)}>
          <ParticipantsList
            participants={participantsSession.participants || []}
            hostUserId={participantsSession.hostUserId}
            onClose={() => setParticipantsSession(null)}
          />
        </Modal>
      )}

      {/* Chat Modal */}
      {chatSession && (
        <Modal onClose={() => setChatSession(null)}>
          <SessionChat
            sessionId={chatSession._id}
            currentUserId={currentUserId}
            onClose={() => setChatSession(null)}
          />
        </Modal>
      )}

      {/* Edit Modal */}
      {editSession && (
        <Modal onClose={() => setEditSession(null)}>
          <div
            className={`rounded-2xl border overflow-hidden ${
              isDarkMode
                ? "bg-gray-900 border-white/10"
                : "bg-white border-gray-200 shadow-xl"
            }`}
          >
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-cyan-500" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3
                  className={`font-bold text-lg ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Edit Session
                </h3>
                <button
                  onClick={() => setEditSession(null)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isDarkMode
                      ? "text-slate-400 hover:text-white hover:bg-white/10"
                      : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  ✕
                </button>
              </div>
              <CreateSessionForm
                editData={editSession}
                onSuccess={() => {
                  setEditSession(null);
                  fetchAll();
                }}
                onCancel={() => setEditSession(null)}
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Detail Modal */}
      {detailSession && (
        <Modal onClose={() => setDetailSession(null)}>
          <div
            className={`rounded-2xl border overflow-hidden ${
              isDarkMode
                ? "bg-gray-900 border-white/10"
                : "bg-white border-gray-200 shadow-xl"
            }`}
          >
            <div className="h-1 w-full bg-gradient-to-r from-violet-500 to-purple-600" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3
                  className={`font-bold text-lg ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Session Details
                </h3>
                <button
                  onClick={() => setDetailSession(null)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isDarkMode
                      ? "text-slate-400 hover:text-white hover:bg-white/10"
                      : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3">
                {[
                  ["Title", detailSession.title],
                  ["Skill", detailSession.skill],
                  ["Host", detailSession.hostUserId?.name],
                  ["Date", new Date(detailSession.date).toLocaleDateString()],
                  ["Time", `${detailSession.startTime} – ${detailSession.endTime}`],
                  ["Type", detailSession.sessionType],
                  ["Status", detailSession.status],
                  ["Participants", `${detailSession.participants?.length}/${detailSession.maxParticipants}`],
                  ["Description", detailSession.description],
                  ["Recording", detailSession.recordingLink || "—"],
                ].map(([k, v]) =>
                  v ? (
                    <div key={k} className="flex gap-3">
                      <span
                        className={`text-xs font-semibold w-24 flex-shrink-0 pt-0.5 ${
                          isDarkMode ? "text-slate-500" : "text-gray-400"
                        }`}
                      >
                        {k}
                      </span>
                      <span
                        className={`text-sm flex-1 ${
                          isDarkMode ? "text-slate-200" : "text-gray-700"
                        }`}
                      >
                        {v}
                      </span>
                    </div>
                  ) : null
                )}
              </div>
              {detailSession.meetingLink &&
                detailSession.status !== "completed" &&
                detailSession.status !== "cancelled" && (
                  <a
                    href={detailSession.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:scale-105 transition-all"
                  >
                    Join Meeting →
                  </a>
                )}
            </div>
          </div>
        </Modal>
      )}

      {/* Recording Modal */}
      {recordingModal && (
        <Modal onClose={() => setRecordingModal(null)}>
          <div
            className={`rounded-2xl border overflow-hidden ${
              isDarkMode
                ? "bg-gray-900 border-white/10"
                : "bg-white border-gray-200 shadow-xl"
            }`}
          >
            <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-pink-600" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3
                  className={`font-bold text-lg ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  🎥 Save Recording
                </h3>
                <button
                  onClick={() => setRecordingModal(null)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isDarkMode
                      ? "text-slate-400 hover:text-white hover:bg-white/10"
                      : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  ✕
                </button>
              </div>
              <p
                className={`text-sm mb-4 ${
                  isDarkMode ? "text-slate-400" : "text-gray-500"
                }`}
              >
                Paste the recording link for <strong>{recordingModal.title}</strong> so participants can access it later.
              </p>
              <input
                value={recordingLink}
                onChange={(e) => setRecordingLink(e.target.value)}
                placeholder="https://drive.google.com/…"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none mb-4 transition-all ${
                  isDarkMode
                    ? "bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-purple-500/40"
                    : "bg-gray-50 border-gray-200 text-gray-900 focus:border-purple-300"
                }`}
              />
              <button
                onClick={handleSaveRecording}
                className="w-full py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:scale-105 transition-all shadow-lg shadow-purple-500/20"
              >
                Save Recording Link
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
