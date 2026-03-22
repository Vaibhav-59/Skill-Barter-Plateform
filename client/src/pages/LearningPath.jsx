import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useTheme } from "../hooks/useTheme";
import GoalSelector from "../components/learningpath/GoalSelector";
import PathStep from "../components/learningpath/PathStep";
import ProgressBar from "../components/learningpath/ProgressBar";
import SuggestedExperts from "../components/learningpath/SuggestedExperts";
import DailyPlan from "../components/learningpath/DailyPlan";
import SkillGraph from "../components/learningpath/SkillGraph";
import {
  generatePath,
  getUserPaths,
  updateProgress,
  deletePath,
  adaptPath,
  getSkillExchange,
} from "../services/learningPathApi";

/* ─────────────────────────────────────────────────────────── */
/*  Gamification badge config                                  */
/* ─────────────────────────────────────────────────────────── */
const BADGES = [
  { threshold: 1,  icon: "🌱", label: "First Step",   desc: "Completed your first step",    color: "from-emerald-500 to-teal-600",     glow: "shadow-emerald-500/30" },
  { threshold: 3,  icon: "🔥", label: "On Fire",       desc: "3 steps crushed!",              color: "from-orange-500 to-red-600",       glow: "shadow-orange-500/30"  },
  { threshold: 5,  icon: "⚡", label: "Hustler",       desc: "Half-way warrior",              color: "from-yellow-500 to-amber-600",     glow: "shadow-yellow-500/30"  },
  { threshold: 8,  icon: "🚀", label: "Momentum",      desc: "Unstoppable momentum",          color: "from-blue-500 to-indigo-600",      glow: "shadow-blue-500/30"    },
  { threshold: 10, icon: "🏆", label: "Path Master",   desc: "Mastery unlocked!",             color: "from-rose-500 to-pink-600",        glow: "shadow-rose-500/30"    },
];
const getBadge = (n) => [...BADGES].reverse().find((b) => n >= b.threshold) || null;

/* ─────────────────────────────────────────────────────────── */
/*  Spinner                                                    */
/* ─────────────────────────────────────────────────────────── */
const Spinner = ({ size = 5, color = "rose" }) => (
  <svg className={`w-${size} h-${size} animate-spin text-${color}-400`} viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

/* ─────────────────────────────────────────────────────────── */
/*  Sidebar Path Card                                          */
/* ─────────────────────────────────────────────────────────── */
function SidebarPathCard({ p, isActive, onSelect, onDelete }) {
  const pct = p.progress || 0;
  return (
    <div
      onClick={() => onSelect(p)}
      className={`
        group relative cursor-pointer rounded-2xl border p-3.5 transition-all duration-300
        ${isActive
          ? "bg-gradient-to-br from-rose-500/15 via-pink-500/10 to-transparent border-rose-500/40 shadow-lg shadow-rose-500/10"
          : "bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06] hover:border-white/[0.14]"
        }
      `}
    >
      {/* Delete btn */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(p._id); }}
        className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex items-start gap-2.5 pr-6">
        <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${isActive ? "bg-rose-400 shadow-sm shadow-rose-400" : "bg-slate-600"}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold truncate ${isActive ? "text-white" : "text-slate-300"}`}>{p.goal}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {p.completedSteps?.length || 0}/{p.steps?.length || 0} steps
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-2.5 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${isActive ? "bg-gradient-to-r from-rose-500 to-pink-500" : "bg-slate-600"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={`text-right text-[10px] mt-1 ${isActive ? "text-rose-400" : "text-slate-600"}`}>{pct}%</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Tab button                                                 */
/* ─────────────────────────────────────────────────────────── */
const TABS = [
  { id: "roadmap",  label: "Roadmap",      emoji: "🗺️" },
  { id: "graph",   label: "Skill Graph",  emoji: "🔗" },
  { id: "daily",   label: "Daily Plan",   emoji: "📅" },
  { id: "exchange",label: "Experts",      emoji: "🤝" },
];

/* ─────────────────────────────────────────────────────────── */
/*  Stats mini card                                            */
/* ─────────────────────────────────────────────────────────── */
function StatCard({ icon, label, value, gradient }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-4 border border-white/[0.08] bg-gradient-to-br ${gradient}`}>
      <div className="absolute -right-3 -top-3 text-5xl opacity-10 select-none">{icon}</div>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl font-extrabold text-white">{value}</div>
      <div className="text-xs text-white/50 mt-0.5">{label}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Empty / hero state                                         */
/* ─────────────────────────────────────────────────────────── */
function HeroEmpty({ onGenerate, isLoading }) {
  return (
    <div className="flex flex-col items-center text-center py-10">
      {/* Animated orb */}
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 blur-3xl opacity-20 scale-150 animate-pulse" />
        <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-2xl shadow-rose-500/40 flex items-center justify-center">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
      </div>

      <h2 className="text-3xl font-extrabold text-white mb-2">
        Build Your Career{" "}
        <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
          Roadmap
        </span>
      </h2>
      <p className="text-slate-400 max-w-sm mb-3 text-sm leading-relaxed">
        Pick a career goal and let AI generate a step-by-step skill roadmap crafted just for you.
      </p>

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {["AI-Generated", "Progress Tracking", "Daily Plans", "Skill Exchange"].map((tag) => (
          <span key={tag} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400">
            ✦ {tag}
          </span>
        ))}
      </div>

      <div className="w-full max-w-xl">
        <GoalSelector onGenerate={onGenerate} isLoading={isLoading} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Main Page                                                  */
/* ─────────────────────────────────────────────────────────── */
export default function LearningPath() {
  const { isDarkMode } = useTheme();

  const [paths, setPaths]               = useState([]);
  const [activePath, setActivePath]     = useState(null);
  const [generating, setGenerating]     = useState(false);
  const [adapting, setAdapting]         = useState(false);
  const [experts, setExperts]           = useState([]);
  const [loadingExperts, setLoadingExperts] = useState(false);
  const [showCreate, setShowCreate]     = useState(false);
  const [activeTab, setActiveTab]       = useState("roadmap");
  const [notification, setNotification] = useState(null);
  const [loadingPaths, setLoadingPaths] = useState(true);

  /* Load paths */
  const loadPaths = useCallback(async () => {
    try {
      const res = await getUserPaths();
      if (res.success) {
        setPaths(res.data);
        if (res.data.length > 0) setActivePath(res.data[0]);
      }
    } catch { /* no paths */ }
    finally { setLoadingPaths(false); }
  }, []);

  useEffect(() => { loadPaths(); }, [loadPaths]);

  /* Fetch experts when path changes */
  useEffect(() => {
    if (!activePath) return;
    const skills = activePath.steps
      .filter((s) => !activePath.completedSteps.includes(s.stepNumber))
      .map((s) => s.skill).slice(0, 5);
    if (!skills.length) return;
    setLoadingExperts(true);
    getSkillExchange(skills)
      .then((r) => { if (r.success) setExperts(r.data); })
      .catch(() => {})
      .finally(() => setLoadingExperts(false));
  }, [activePath?._id]);

  /* Next-step notification */
  useEffect(() => {
    if (!activePath) return;
    const next = activePath.steps.find((s) => !activePath.completedSteps.includes(s.stepNumber));
    if (next) setNotification(`🎯 Next: ${next.skill} — ${next.estimatedTime}`);
    else if (activePath.steps.length) setNotification("🎉 Path complete! Congratulations!");
  }, [activePath]);

  /* ── Handlers ── */
  const handleGenerate = async (goal) => {
    setGenerating(true);
    try {
      const res = await generatePath(goal);
      if (res.success) {
        setPaths((p) => [res.data, ...p]);
        setActivePath(res.data);
        setShowCreate(false);
        toast.success(`🚀 Roadmap for "${goal}" ready!`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Generation failed");
    } finally { setGenerating(false); }
  };

  const handleToggleStep = async (stepNumber, completed) => {
    if (!activePath) return;
    try {
      const res = await updateProgress(activePath._id, stepNumber, completed);
      if (res.success) {
        setActivePath(res.data);
        setPaths((p) => p.map((x) => x._id === res.data._id ? res.data : x));
        if (completed) {
          const s = activePath.steps.find((x) => x.stepNumber === stepNumber);
          toast.success(`✅ "${s?.skill}" done! +${s?.xpReward || 50} XP`);
          const badge = getBadge(res.data.completedSteps.length);
          if (badge && res.data.completedSteps.length === badge.threshold)
            toast.info(`${badge.icon} Badge Unlocked: ${badge.label}!`, { autoClose: 4000 });
        }
      }
    } catch { toast.error("Progress update failed"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this learning path?")) return;
    try {
      const res = await deletePath(id);
      if (res.success) {
        const upd = paths.filter((p) => p._id !== id);
        setPaths(upd);
        if (activePath?._id === id) setActivePath(upd[0] || null);
        toast.success("Path deleted");
      }
    } catch { toast.error("Delete failed"); }
  };

  const handleAdapt = async () => {
    if (!activePath) return;
    setAdapting(true);
    try {
      const res = await adaptPath(activePath._id);
      if (res.success) {
        setActivePath(res.data);
        setPaths((p) => p.map((x) => x._id === res.data._id ? res.data : x));
        toast.success("🤖 AI adapted your path!");
      }
    } catch { toast.error("Adaptation failed"); }
    finally { setAdapting(false); }
  };

  const handleDailyTaskDone = (upd) => {
    setActivePath(upd);
    setPaths((p) => p.map((x) => x._id === upd._id ? upd : x));
  };

  /* ── Computed ── */
  const badge        = activePath ? getBadge(activePath.completedSteps?.length || 0) : null;
  const allSkills    = activePath?.steps?.map((s) => s.skill) || [];
  const completedCnt = activePath?.completedSteps?.length || 0;
  const totalCnt     = activePath?.steps?.length || 0;
  const pct          = totalCnt ? Math.round((completedCnt / totalCnt) * 100) : 0;

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-[#080c14]" : "bg-slate-50"}`}>

      {/* ── Animated background ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-60 -left-60 w-[600px] h-[600px] bg-rose-600/8 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 -right-60 w-[500px] h-[500px] bg-pink-600/6 rounded-full blur-[100px]" style={{ animationDelay: "1s" }} />
        <div className="absolute -bottom-40 left-1/3 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[80px]" />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ══ HEADER ══ */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 blur-lg opacity-50" />
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Learning Path
                  </h1>
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30">
                    AI
                  </span>
                </div>
                <p className="text-slate-400 text-sm mt-0.5">
                  AI roadmaps · Progress tracking · Skill exchange
                </p>
              </div>
            </div>

            {/* Header actions */}
            <div className="flex items-center gap-2 flex-wrap">
              {activePath && activePath.completedSteps?.length > 0 && (
                <button
                  onClick={handleAdapt}
                  disabled={adapting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 text-violet-300 text-sm font-medium hover:from-violet-500/30 hover:border-violet-400/40 transition-all disabled:opacity-50"
                >
                  {adapting ? <Spinner size={4} color="violet" /> : <span>🤖</span>}
                  {adapting ? "Adapting..." : "AI Re-Plan"}
                </button>
              )}
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white text-sm font-semibold shadow-lg shadow-rose-500/30 hover:from-rose-400 hover:to-pink-500 hover:shadow-rose-500/50 transition-all active:scale-[0.97]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Path
              </button>
            </div>
          </div>

          {/* Notification bar */}
          {notification && !showCreate && activePath && (
            <div className="mt-4 flex items-center justify-between px-4 py-3 rounded-2xl bg-gradient-to-r from-rose-500/10 to-pink-500/10 border border-rose-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                <span className="text-rose-200 text-sm font-medium">{notification}</span>
              </div>
              <button onClick={() => setNotification(null)} className="text-rose-400/60 hover:text-rose-300 transition-colors ml-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </header>

        {/* ══ MAIN LAYOUT ══ */}
        <div className="flex gap-5 flex-col xl:flex-row">

          {/* ── SIDEBAR ── */}
          <aside className="xl:w-72 flex-shrink-0">
            <div className="xl:sticky xl:top-6 flex flex-col gap-4">

              {/* Paths List */}
              <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-4 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">My Paths</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
                    {paths.length}
                  </span>
                </div>

                {loadingPaths ? (
                  <div className="flex justify-center py-6"><Spinner size={6} /></div>
                ) : paths.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="text-3xl mb-2">🗺️</div>
                    <p className="text-slate-500 text-xs">No paths yet</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {paths.map((p) => (
                      <SidebarPathCard
                        key={p._id}
                        p={p}
                        isActive={activePath?._id === p._id}
                        onSelect={(p) => { setActivePath(p); setShowCreate(false); }}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Stats Grid — only when path active */}
              {activePath && (
                <div className="grid grid-cols-2 gap-2.5">
                  <StatCard icon="⚡" label="Total XP" value={activePath.totalXP || 0} gradient="from-amber-500/10 to-yellow-500/5" />
                  <StatCard icon="🔥" label="Streak"   value={`${activePath.streakDays || 0}d`} gradient="from-orange-500/10 to-red-500/5" />
                  <StatCard icon="🎯" label="Steps"    value={`${completedCnt}/${totalCnt}`} gradient="from-rose-500/10 to-pink-500/5" />
                  <StatCard icon="📊" label="Done"     value={`${pct}%`} gradient="from-purple-500/10 to-violet-500/5" />
                </div>
              )}

              {/* Active badge */}
              {badge && activePath && (
                <div className={`relative overflow-hidden rounded-3xl border border-white/10 p-4 bg-gradient-to-br ${badge.color} bg-opacity-10 shadow-lg ${badge.glow}`}>
                  <div className="absolute -right-4 -bottom-4 text-7xl opacity-10 select-none">{badge.icon}</div>
                  <div className="text-3xl mb-1">{badge.icon}</div>
                  <div className="text-white font-bold text-sm">{badge.label}</div>
                  <div className="text-white/50 text-xs mt-0.5">{badge.desc}</div>
                </div>
              )}

              {/* All badges unlocked */}
              {activePath && (
                <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Badges</p>
                  <div className="flex gap-2 flex-wrap">
                    {BADGES.map((b) => {
                      const unlocked = completedCnt >= b.threshold;
                      return (
                        <div
                          key={b.label}
                          title={b.label}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${
                            unlocked
                              ? `bg-gradient-to-br ${b.color} shadow-md`
                              : "bg-white/5 border border-white/10 opacity-30 grayscale"
                          }`}
                        >
                          {b.icon}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <main className="flex-1 min-w-0 flex flex-col gap-5">

            {/* ── CREATE MODE ── */}
            {showCreate ? (
              <div className="animate-fadeIn">
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-5 transition-colors group"
                >
                  <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to paths
                </button>
                <GoalSelector onGenerate={handleGenerate} isLoading={generating} />
              </div>

            ) : activePath ? (
              <>
                {/* ── PATH HERO ── */}
                <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-rose-500/8 via-pink-500/5 to-transparent p-6 shadow-2xl">
                  {/* Decorative blobs */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/8 rounded-full blur-2xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-white truncate">{activePath.goal}</h2>
                        {activePath.adaptedAt && (
                          <span className="shrink-0 text-xs px-2.5 py-1 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-300 font-medium">
                            🤖 AI Adapted
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm">
                        {totalCnt} steps · Created {new Date(activePath.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </p>
                      {activePath.adaptationNote && (
                        <p className="text-violet-400 text-xs mt-1.5 italic">{activePath.adaptationNote}</p>
                      )}
                    </div>

                    {/* Circular progress */}
                    <div className="flex-shrink-0">
                      <div className="relative w-20 h-20">
                        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                          <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6"/>
                          <circle
                            cx="40" cy="40" r="32" fill="none"
                            stroke="url(#progressGrad)"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 32}`}
                            strokeDashoffset={`${2 * Math.PI * 32 * (1 - pct / 100)}`}
                            style={{ transition: "stroke-dashoffset 1s ease" }}
                          />
                          <defs>
                            <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#f43f5e"/>
                              <stop offset="100%" stopColor="#ec4899"/>
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-lg font-extrabold text-white leading-none">{pct}%</span>
                          <span className="text-[9px] text-slate-400">done</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress row */}
                  <div className="relative z-10 mt-5">
                    <ProgressBar
                      completed={completedCnt}
                      total={totalCnt}
                      xp={activePath.totalXP}
                      streakDays={activePath.streakDays}
                    />
                  </div>
                </div>

                {/* ── TABS ── */}
                <div className="flex gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.07] w-fit">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                        activeTab === tab.id
                          ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <span>{tab.emoji}</span>
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* ── TAB CONTENT ── */}

                {/* ROADMAP */}
                {activeTab === "roadmap" && (
                  <div className="relative pl-4">
                    {activePath.steps?.length > 0 ? (
                      activePath.steps.map((step, idx) => (
                        <PathStep
                          key={step.stepNumber}
                          step={step}
                          isCompleted={activePath.completedSteps?.includes(step.stepNumber)}
                          onToggle={handleToggleStep}
                          isLast={idx === activePath.steps.length - 1}
                          index={idx}
                          totalSteps={totalCnt}
                          completedCount={completedCnt}
                        />
                      ))
                    ) : (
                      <div className="text-center py-12 text-slate-500">No steps in this path</div>
                    )}
                  </div>
                )}

                {/* SKILL GRAPH */}
                {activeTab === "graph" && (
                  <SkillGraph steps={activePath.steps} completedSteps={activePath.completedSteps || []} />
                )}

                {/* DAILY PLAN */}
                {activeTab === "daily" && (
                  <DailyPlan plan={activePath.dailyPlan} pathId={activePath._id} onTaskDone={handleDailyTaskDone} />
                )}

                {/* SKILL EXCHANGE */}
                {activeTab === "exchange" && (
                  <div className="flex flex-col gap-4">
                    {loadingExperts ? (
                      <div className="flex justify-center py-10"><Spinner size={8} /></div>
                    ) : (
                      <SuggestedExperts experts={experts} pathSkills={allSkills} />
                    )}

                    {/* Skill exchange suggestions */}
                    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm">Suggested Skill Exchanges</h3>
                          <p className="text-xs text-slate-500">Trade your skills to learn faster</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {(activePath.steps || []).slice(0, 6).map((step) => (
                          <div key={step.stepNumber}
                            className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-teal-500/20 hover:bg-teal-500/5 transition-all group"
                          >
                            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm">📘</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-teal-300 font-semibold text-sm">Learn {step.skill}</span>
                              <p className="text-slate-500 text-xs mt-0.5">from platform experts via barter</p>
                            </div>
                            <svg className="w-4 h-4 text-slate-600 group-hover:text-teal-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>

            ) : (
              /* ── EMPTY / HERO STATE ── */
              !loadingPaths && (
                <div className="rounded-3xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-xl p-8">
                  <HeroEmpty onGenerate={handleGenerate} isLoading={generating} />
                </div>
              )
            )}

            {loadingPaths && (
              <div className="flex justify-center items-center py-20">
                <Spinner size={10} />
              </div>
            )}
          </main>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        .animate-fadeIn   { animation: fadeIn 0.35s ease both; }
        @keyframes shimmer { 0% { transform:translateX(-100%) } 100% { transform:translateX(200%) } }
        .animate-shimmer  { animation: shimmer 2.2s infinite; }
      `}</style>
    </div>
  );
}
