// /client/src/components/matching/SmartMatchCard.jsx
import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  MapPin, Star, Zap, BookOpen, CheckCircle, Globe,
  GitBranch, Shield, Calendar, User, TrendingUp,
  Heart, ArrowRight, ChevronDown, Clock, Award,
  Sparkles, BarChart2,
} from "lucide-react";
import {
  createMatchRequest,
  likeMatch,
  markMatchAsViewed,
} from "../../redux/slices/smartMatchSlice";

/* ─────────────────────────────────────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────────────────────────────────────── */
const MATCH_TYPE = {
  perfect_match: { label: "Perfect Match", emoji: "✨", from: "#10b981", to: "#14b8a6", glow: "rgba(16,185,129,0.35)" },
  style_aligned: { label: "Style Aligned", emoji: "🎨", from: "#a855f7", to: "#8b5cf6", glow: "rgba(168,85,247,0.35)" },
  verified_expert: { label: "Verified Expert", emoji: "✅", from: "#3b82f6", to: "#06b6d4", glow: "rgba(59,130,246,0.35)" },
  mutual_learning: { label: "Mutual Learning", emoji: "🤝", from: "#f59e0b", to: "#f97316", glow: "rgba(245,158,11,0.35)" },
  trusted_mentor: { label: "Trusted Mentor", emoji: "⭐", from: "#eab308", to: "#f59e0b", glow: "rgba(234,179,8,0.35)" },
  skill_complement: { label: "Skill Complement", emoji: "🎯", from: "#f43f5e", to: "#ec4899", glow: "rgba(244,63,94,0.35)" },
  potential_match: { label: "Potential Match", emoji: "💡", from: "#64748b", to: "#475569", glow: "rgba(100,116,139,0.2)" },
};

const scoreGradient = (s) =>
  s >= 80 ? ["#10b981", "#14b8a6", "rgba(16,185,129,0.15)"]
    : s >= 65 ? ["#3b82f6", "#06b6d4", "rgba(59,130,246,0.15)"]
      : s >= 50 ? ["#f59e0b", "#f97316", "rgba(245,158,11,0.15)"]
        : ["#64748b", "#475569", "rgba(100,116,139,0.1)"];

/* ─────────────────────────────────────────────────────────────────────────────
   ANIMATED RING
───────────────────────────────────────────────────────────────────────────── */
const ScoreRing = ({ score }) => {
  const [animated, setAnimated] = useState(0);
  const [c1, c2, bgColor] = scoreGradient(score);
  const R = 40, stroke = 6, norm = 2 * Math.PI * R;
  const id = `ring-grad-${score}`;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 120);
    return () => clearTimeout(t);
  }, [score]);

  return (
    <div className="relative flex-shrink-0" style={{ width: 96, height: 96 }}>
      {/* outer glow ring */}
      <div
        className="absolute inset-0 rounded-full opacity-30 blur-md"
        style={{ background: `conic-gradient(${c1}, ${c2}, transparent)` }}
      />
      <svg width="96" height="96" viewBox="0 0 96 96" className="absolute inset-0 -rotate-90">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </linearGradient>
        </defs>
        {/* track */}
        <circle cx="48" cy="48" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        {/* fill */}
        <circle
          cx="48" cy="48" r={R} fill="none"
          stroke={`url(#${id})`} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={norm}
          strokeDashoffset={norm - (animated / 100) * norm}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      {/* inner face */}
      <div
        className="absolute inset-[8px] rounded-full flex flex-col items-center justify-center"
        style={{ background: `radial-gradient(circle, ${bgColor} 0%, rgba(10,15,26,0.95) 100%)` }}
      >
        <span className="text-2xl font-black text-white leading-none">{score}</span>
        <span className="text-[9px] font-semibold uppercase tracking-widest mt-0.5" style={{ color: c1 }}>match</span>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   SKILL PILL
───────────────────────────────────────────────────────────────────────────── */
const SkillPill = ({ skill, variant, verified }) => {
  const name = typeof skill === "string" ? skill : skill?.name || "";
  const styles = {
    teach: { bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.25)", text: "#6ee7b7" },
    learn: { bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.25)", text: "#93c5fd" },
  };
  const s = styles[variant] || styles.teach;
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-transform hover:scale-105"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}
    >
      {verified && <CheckCircle className="w-2.5 h-2.5 flex-shrink-0" style={{ color: "#10b981" }} />}
      {name}
    </span>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   BREAKDOWN BAR
───────────────────────────────────────────────────────────────────────────── */
const BreakdownBar = ({ label, value, explanation }) => {
  const [w, setW] = useState(0);
  const ref = useRef();
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setW(value); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value]);

  const col = value >= 70 ? "#10b981" : value >= 50 ? "#f59e0b" : "#64748b";
  return (
    <div ref={ref} className="group/bar">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] font-medium text-slate-400">{label}</span>
        <span className="text-[10px] font-bold" style={{ color: col }}>{value}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${w}%`,
            background: `linear-gradient(90deg, ${col}, ${col}aa)`,
            transition: "width 0.8s cubic-bezier(.4,0,.2,1)",
            boxShadow: `0 0 8px ${col}66`,
          }}
        />
      </div>
      {explanation && (
        <p className="text-[9px] text-slate-600 mt-0.5 opacity-0 group-hover/bar:opacity-100 transition-opacity">{explanation}</p>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN CARD
───────────────────────────────────────────────────────────────────────────── */
const SmartMatchCard = ({ match, onSendRequest, className = "" }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [requested, setRequested] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const { user, compatibilityScore, matchType, reasons = [], highlights = [], confidence, breakdown } = match;
  const cfg = MATCH_TYPE[matchType] || MATCH_TYPE.potential_match;
  const [c1, c2] = scoreGradient(compatibilityScore);

  const teach = (user.skillsOffered || user.teachSkills || []).slice(0, 5);
  const learn = (user.skillsWanted || user.learnSkills || []).slice(0, 4);
  const verified = (user.verifiedSkills || []).map(s => s.toLowerCase());
  const allTags = [...(highlights || []), ...(reasons || [])].slice(0, 4);

  const avatar = user.profileImage || user.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "U")}&background=0d1b2a&color=10b981&bold=true&size=128`;

  const breakdownRows = breakdown
    ? Object.entries(breakdown)
      .map(([k, d]) => ({
        label: k.replace(/([A-Z])/g, " $1").replace(/^(.)/, s => s.toUpperCase()),
        value: Math.round((d.raw || 0) * 100),
        explanation: d.explanation || "",
      }))
      .sort((a, b) => b.value - a.value)
    : [];

  const handleConnect = async (e) => {
    e.stopPropagation();
    if (requested || requesting) return;
    setRequesting(true);
    try {
      await dispatch(createMatchRequest({
        receiverId: user._id,
        message: "Hi! I'd love to exchange skills with you. Let's connect!",
        skillsInvolved: { offering: learn.slice(0, 2), requesting: teach.slice(0, 2) },
      }));
      dispatch(likeMatch(user._id));
      setRequested(true);
      onSendRequest?.();
    } catch (err) {
      console.error(err);
    } finally {
      setRequesting(false);
    }
  };

  const handleView = () => {
    dispatch(markMatchAsViewed(user._id));
    navigate(`/user/${user._id}`);
  };

  /* activity label */
  const lastSeen = user.lastActive || user.lastLogin;
  const daysAgo = lastSeen ? Math.floor((Date.now() - new Date(lastSeen)) / 86400000) : null;
  const actLabel = daysAgo === null ? null : daysAgo === 0 ? "Active today" : daysAgo <= 7 ? `${daysAgo}d ago` : "Inactive";

  return (
    <div
      className={`relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 group ${className}`}
      style={{
        background: "linear-gradient(145deg, rgba(15,23,42,0.95) 0%, rgba(10,15,26,0.98) 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.4)`,
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 0 1px ${cfg.glow}, 0 0 40px ${cfg.glow}, 0 16px 48px rgba(0,0,0,0.5)`; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 0 0 1px rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.4)`; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {/* ── Top gradient line ── */}
      <div className="h-[2px] w-full flex-shrink-0" style={{ background: `linear-gradient(90deg, ${cfg.from}, ${cfg.to})` }} />

      {/* ── Match type badge ── */}
      <div className="absolute top-4 left-4 z-20">
        <div
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg"
          style={{ background: `linear-gradient(135deg, ${cfg.from}, ${cfg.to})`, boxShadow: `0 2px 12px ${cfg.glow}` }}
        >
          <span>{cfg.emoji}</span>
          <span>{cfg.label}</span>
        </div>
      </div>

      {/* ── Hero section ── */}
      <div className="px-5 pt-14 pb-5 flex items-start gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className="w-[56px] h-[56px] rounded-2xl overflow-hidden ring-2 transition-all duration-300"
            style={{ ringColor: cfg.from, boxShadow: `0 0 0 2px ${cfg.from}55, 0 4px 16px rgba(0,0,0,0.5)` }}
          >
            <img src={avatar} alt={user.name} className="w-full h-full object-cover" />
          </div>
          {user.isOnline && (
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-md shadow-emerald-500/50" />
          )}
          {user.isGithubConnected && (
            <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center">
              <GitBranch className="w-2.5 h-2.5 text-slate-300" />
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-[15px] leading-snug truncate">{user.name}</h3>

          {/* meta row 1 */}
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1">
            {user.experienceLevel && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                <TrendingUp className="w-3 h-3" style={{ color: c1 }} />
                <span className="capitalize">{user.experienceLevel}</span>
                {user.yearsOfExperience > 0 && <span className="text-slate-600">· {user.yearsOfExperience}yr</span>}
              </span>
            )}
            {user.location && (user.location.city || user.location.country) && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                <MapPin className="w-3 h-3" />
                {user.location.city || user.location.country}
              </span>
            )}
          </div>

          {/* meta row 2 */}
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1.5">
            {user.averageRating > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px]">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-amber-400">{user.averageRating.toFixed(1)}</span>
                <span className="text-slate-600">({user.totalReviews})</span>
              </span>
            )}
            {actLabel && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                <Clock className="w-3 h-3" />
                {actLabel}
              </span>
            )}
            {verified.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: "#6ee7b7" }}>
                <Award className="w-3 h-3" />
                {verified.length} verified
              </span>
            )}
          </div>
        </div>

        {/* Score ring */}
        <ScoreRing score={compatibilityScore} />
      </div>

      {/* ── Divider ── */}
      <div className="mx-5 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

      {/* ── Profile style badges ── */}
      {(user.learningStyle || user.teachingStyle || (user.languages || []).length > 0) && (
        <div className="px-5 py-3 flex flex-wrap gap-1.5">
          {user.learningStyle && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)", color: "#c4b5fd" }}>
              <User className="w-2.5 h-2.5" /> {user.learningStyle}
            </span>
          )}
          {user.teachingStyle && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{ background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.2)", color: "#5eead4" }}>
              <BookOpen className="w-2.5 h-2.5" /> {user.teachingStyle}
            </span>
          )}
          {(user.languages || []).slice(0, 2).map(l => (
            <span key={l} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#a5b4fc" }}>
              <Globe className="w-2.5 h-2.5" /> {l}
            </span>
          ))}
          {(user.availability && (Array.isArray(user.availability) ? user.availability : []).length > 0) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.18)", color: "#fcd34d" }}>
              <Calendar className="w-2.5 h-2.5" />
              {Array.isArray(user.availability) ? user.availability[0] : user.availability}
            </span>
          )}
        </div>
      )}

      {/* ── Bio ── */}
      {user.bio && (
        <div className="px-5 pb-3">
          <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 border-l-2 pl-2.5" style={{ borderColor: `${cfg.from}55` }}>
            {user.bio}
          </p>
        </div>
      )}

      {/* ── Skills ── */}
      <div className="px-5 space-y-3 pb-3">
        {teach.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <BookOpen className="w-3 h-3" style={{ color: "#10b981" }} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Can Teach</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {teach.map((sk, i) => (
                <SkillPill key={i} skill={sk} variant="teach" verified={verified.includes((typeof sk === "string" ? sk : sk.name || "").toLowerCase())} />
              ))}
            </div>
          </div>
        )}
        {learn.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Zap className="w-3 h-3" style={{ color: "#3b82f6" }} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Wants to Learn</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {learn.map((sk, i) => <SkillPill key={i} skill={sk} variant="learn" />)}
            </div>
          </div>
        )}
      </div>

      {/* ── Highlights ── */}
      {allTags.length > 0 && (
        <div className="mx-5 mb-3 rounded-xl px-3 py-3 space-y-1.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {allTags.map((h, i) => (
            <div key={i} className="flex items-baseline gap-2">
              <span className="flex-shrink-0 w-1 h-1 rounded-full mt-1.5" style={{ background: cfg.from }} />
              <span className="text-[11px] text-slate-300 leading-snug">{h}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Confidence + breakdown toggle ── */}
      <div className="mx-5 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3 h-3 text-slate-600" />
          <span className="text-[10px] text-slate-600">Confidence</span>
          <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="h-full rounded-full" style={{ width: `${confidence}%`, background: `linear-gradient(90deg, ${c1}, ${c2})`, transition: "width 1s ease" }} />
          </div>
          <span className="text-[10px] font-bold" style={{ color: c1 }}>{confidence}%</span>
        </div>

        {breakdown && (
          <button
            onClick={() => setExpanded(p => !p)}
            className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            <BarChart2 className="w-3 h-3" />
            Breakdown
            <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      {/* ── Expanded breakdown ── */}
      {expanded && breakdownRows.length > 0 && (
        <div
          className="mx-5 mb-3 rounded-xl p-3 space-y-2.5"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-1.5 mb-3">
            <BarChart2 className="w-3 h-3 text-slate-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Factor Breakdown</span>
          </div>
          {breakdownRows.map(r => (
            <BreakdownBar key={r.label} label={r.label} value={r.value} explanation={r.explanation} />
          ))}
        </div>
      )}

      {/* ── Action buttons ── */}
      <div className="px-5 pb-5 pt-1 grid grid-cols-2 gap-2 mt-auto">
        <button
          onClick={handleView}
          className="relative flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[12px] font-semibold text-slate-300 transition-all duration-200 overflow-hidden group/btn hover:text-white active:scale-95"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
        >
          <User className="w-3.5 h-3.5" />
          View Profile
        </button>

        <button
          onClick={handleConnect}
          disabled={requested || requesting}
          className="relative flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[12px] font-bold text-white transition-all duration-200 overflow-hidden active:scale-95 disabled:cursor-default"
          style={{
            background: requested
              ? "rgba(16,185,129,0.15)"
              : `linear-gradient(135deg, ${cfg.from}, ${cfg.to})`,
            border: requested
              ? "1px solid rgba(16,185,129,0.3)"
              : "1px solid transparent",
            boxShadow: requested ? "none" : `0 4px 16px ${cfg.glow}`,
            opacity: requesting ? 0.7 : 1,
          }}
          onMouseEnter={e => { if (!requested && !requesting) e.currentTarget.style.opacity = "0.88"; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
        >
          {requesting ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending...
            </>
          ) : requested ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300">Requested!</span>
            </>
          ) : (
            <>
              <Heart className="w-3.5 h-3.5" />
              Connect
              <ArrowRight className="w-3 h-3 ml-0.5 transition-transform group-hover/btn:translate-x-0.5" />
            </>
          )}
        </button>
      </div>

      {/* ── Subtle inner glow on hover ── */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${cfg.glow} 0%, transparent 65%)` }}
      />
    </div>
  );
};

export default SmartMatchCard;
