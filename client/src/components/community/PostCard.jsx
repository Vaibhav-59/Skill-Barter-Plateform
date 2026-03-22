// components/community/PostCard.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart, MessageSquare, Share2, Bookmark, MoreHorizontal,
  ExternalLink, CheckCircle, ThumbsUp, Trash2, Award,
  Send, HelpCircle, MessageCircle, ChevronDown, ChevronUp,
  Loader, Hash,
} from "lucide-react";
import { toast } from "react-toastify";
import CommentSection from "./CommentSection";
import * as communityApi from "../../services/communityApi";

/* ── helpers ── */
function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60)    return `${s}s ago`;
  if (s < 3600)  return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

const TYPE_META = {
  post:       { label: "Post",       color: "#10b981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.25)",  icon: <MessageCircle className="w-3 h-3" /> },
  question:   { label: "Question",   color: "#3b82f6", bg: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.25)",  icon: <HelpCircle className="w-3 h-3" />    },
  discussion: { label: "Discussion", color: "#a855f7", bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.25)", icon: <MessageSquare className="w-3 h-3" />  },
};

/* ── Answer item (for Q&A) ── */
function AnswerItem({ answer, postId, isAuthor, isDarkMode, currentUserId, onRefresh }) {
  const [upvoted,   setUpvoted]   = useState(() => answer.upvotes?.some(u => u.toString() === currentUserId));
  const [upvotes,   setUpvotes]   = useState(answer.upvotes?.length || 0);
  const [accepting, setAccepting] = useState(false);

  const bg = answer.isAccepted
    ? isDarkMode ? "bg-emerald-500/8 border-emerald-500/35" : "bg-emerald-50 border-emerald-300"
    : isDarkMode ? "bg-gray-800/40 border-slate-700/30" : "bg-gray-50 border-gray-200";

  const isExpert = answer.user?.verifiedSkills?.length > 0;
  const avatar = answer.user?.profileImage || answer.user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(answer.user?.name || "U")}&background=3b82f6&color=fff&size=32`;

  return (
    <div className={`rounded-xl border p-4 transition-all ${bg}`}>
      {answer.isAccepted && (
        <div className="flex items-center gap-1.5 mb-3 text-emerald-400 text-xs font-bold">
          <CheckCircle className="w-4 h-4" /> Accepted Answer
        </div>
      )}
      <div className="flex gap-3">
        {/* Upvote column */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
          <button
            onClick={async () => {
              try {
                const r = await communityApi.upvoteAnswer(postId, answer._id);
                setUpvoted(r.upvoted); setUpvotes(r.upvoteCount);
              } catch {}
            }}
            className="flex flex-col items-center gap-0.5 group"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              upvoted ? "bg-emerald-500/20 text-emerald-400" : isDarkMode ? "bg-gray-700/50 text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-400" : "bg-gray-100 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600"
            }`}>
              <ThumbsUp className="w-3.5 h-3.5" />
            </div>
            <span className={`text-xs font-bold ${upvoted ? "text-emerald-400" : isDarkMode ? "text-slate-500" : "text-gray-400"}`}>{upvotes}</span>
          </button>
          {isAuthor && !answer.isAccepted && (
            <button
              onClick={async () => {
                setAccepting(true);
                try { await communityApi.acceptAnswer(postId, answer._id); onRefresh(); }
                catch { toast.error("Could not accept"); }
                finally { setAccepting(false); }
              }}
              title="Mark as accepted"
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-400/50 hover:bg-emerald-500/20 hover:text-emerald-400 transition-all"
            >
              {accepting ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Answer content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <img src={avatar} alt={answer.user?.name} className="w-7 h-7 rounded-full object-cover" />
            <span className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{answer.user?.name}</span>
            {isExpert && <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold text-amber-400 bg-amber-400/10">
              <Award className="w-2.5 h-2.5" /> Expert
            </span>}
            <span className={`text-xs ml-auto ${isDarkMode ? "text-slate-600" : "text-gray-400"}`}>{timeAgo(answer.createdAt)}</span>
          </div>
          <p className={`text-sm leading-relaxed ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>{answer.content}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Main PostCard ── */
export default function PostCard({ post: initialPost, isDarkMode, currentUserId, onDelete, onRefresh }) {
  const navigate = useNavigate();
  const [post,      setPost]       = useState(initialPost);
  const [liked,     setLiked]      = useState(() => initialPost.likes?.some(l => l.toString() === currentUserId));
  const [likeCount, setLikeCount]  = useState(initialPost.likes?.length || 0);
  const [saved,     setSaved]      = useState(() => initialPost.saves?.some(s => s.toString() === currentUserId));
  const [showAnswers, setShowAnswers] = useState(false);
  const [answerText,  setAnswerText]  = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [showMenu,    setShowMenu]    = useState(false);

  const typeMeta  = TYPE_META[post.postType] || TYPE_META.post;
  const isOwn     = post.user?._id === currentUserId;
  const isQuestion = post.postType === "question";
  const hasAccepted = post.answers?.some(a => a.isAccepted);

  const card     = isDarkMode ? "bg-gray-900/90 border-slate-700/50" : "bg-white border-gray-200";
  const textMain = isDarkMode ? "text-white" : "text-gray-900";
  const textSub  = isDarkMode ? "text-slate-400" : "text-gray-500";
  const inputCls = isDarkMode
    ? "bg-gray-800/60 border-slate-600/40 text-white placeholder-slate-500 focus:border-emerald-500/60"
    : "bg-gray-50 border-gray-300 text-gray-900 focus:border-emerald-400";

  const avatar = post.user?.profileImage || post.user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user?.name || "U")}&background=10b981&color=fff&size=64`;

  const handleLike = async () => {
    try {
      const r = await communityApi.toggleLike(post._id);
      setLiked(r.liked); setLikeCount(r.likeCount);
    } catch {}
  };

  const handleSave = async () => {
    try {
      const r = await communityApi.toggleSave(post._id);
      setSaved(r.saved);
      toast.success(r.saved ? "Post saved!" : "Removed from saved");
    } catch {}
  };

  const handleShare = async () => {
    try { await navigator.clipboard.writeText(`${window.location.origin}/community/${post._id}`); toast.success("Link copied!"); }
    catch { toast.error("Could not copy"); }
  };

  const handleDelete = async () => {
    try { await communityApi.deletePost(post._id); onDelete(post._id); toast.success("Post deleted"); }
    catch { toast.error("Could not delete"); }
  };

  const handlePostAnswer = async () => {
    if (!answerText.trim()) return;
    setSubmitting(true);
    try {
      const r = await communityApi.addAnswer(post._id, answerText.trim());
      setPost(p => ({ ...p, answers: r.data }));
      setAnswerText(""); setShowAnswers(true);
      toast.success("Answer posted!");
    } catch { toast.error("Could not post answer"); }
    finally { setSubmitting(false); }
  };

  const handleRefresh = async () => {
    try {
      const r = await communityApi.getPost(post._id);
      setPost(r.data);
    } catch {}
  };

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all duration-200 hover:shadow-lg ${card}`}
      style={{ boxShadow: isDarkMode ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.06)" }}>

      {/* ── Top accent line ── */}
      <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, ${typeMeta.color}, transparent)` }} />

      <div className="p-5">
        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative cursor-pointer flex-shrink-0" onClick={() => navigate(`/user/${post.user?._id}`)}>
              <img src={avatar} alt={post.user?.name} className="w-11 h-11 rounded-xl object-cover ring-2 ring-transparent hover:ring-emerald-500/40 transition-all" />
              {post.user?.verifiedSkills?.length > 0 && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center bg-amber-400">
                  <Award className="w-2.5 h-2.5 text-white" />
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-bold text-sm cursor-pointer hover:text-emerald-400 transition-colors ${textMain}`}
                  onClick={() => navigate(`/user/${post.user?._id}`)}>
                  {post.user?.name}
                </span>
                {/* Post type badge */}
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: typeMeta.bg, border: `1px solid ${typeMeta.border}`, color: typeMeta.color }}>
                  {typeMeta.icon} {typeMeta.label}
                </span>
                {isQuestion && hasAccepted && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25">
                    <CheckCircle className="w-3 h-3" /> Solved
                  </span>
                )}
              </div>
              <div className={`text-xs mt-0.5 ${textSub}`}>
                {post.user?.experienceLevel && <span className="capitalize">{post.user.experienceLevel} · </span>}
                {timeAgo(post.createdAt)}
              </div>
            </div>
          </div>

          {/* Menu */}
          <div className="relative">
            <button onClick={() => setShowMenu(p => !p)} className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? "text-slate-500 hover:text-slate-300 hover:bg-gray-800/60" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}>
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {showMenu && (
              <div className={`absolute right-0 top-full mt-1 z-10 rounded-xl border shadow-xl overflow-hidden ${isDarkMode ? "bg-gray-800 border-slate-700/50" : "bg-white border-gray-200"}`} style={{ minWidth: 140 }}>
                {isOwn && (
                  <button onClick={() => { setShowMenu(false); handleDelete(); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                )}
                <button onClick={() => { setShowMenu(false); handleShare(); }}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${isDarkMode ? "text-slate-300 hover:bg-gray-700/60" : "text-gray-700 hover:bg-gray-50"}`}>
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Content ── */}
        {post.title && (
          <h3 className={`font-bold text-base mb-2 leading-snug ${textMain}`}>{post.title}</h3>
        )}
        <p className={`text-sm leading-relaxed whitespace-pre-line ${textSub} mb-3`}>{post.content}</p>

        {/* Resource link */}
        {post.resourceLink && (
          <a href={post.resourceLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium mb-3 transition-colors hover:opacity-90"
            style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#93c5fd" }}>
            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{post.resourceLink}</span>
          </a>
        )}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.map(t => (
              <span key={t} className="flex items-center gap-0.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#6ee7b7" }}>
                <Hash className="w-2.5 h-2.5" />{t}
              </span>
            ))}
          </div>
        )}

        {/* ── Stats ── */}
        <div className={`flex items-center gap-4 py-3 border-t border-b text-xs mb-4 ${isDarkMode ? "border-slate-700/30 text-slate-500" : "border-gray-100 text-gray-400"}`}>
          <span>{likeCount} like{likeCount !== 1 ? "s" : ""}</span>
          <span>{post.comments?.length || 0} comment{post.comments?.length !== 1 ? "s" : ""}</span>
          {isQuestion && <span>{post.answers?.length || 0} answer{post.answers?.length !== 1 ? "s" : ""}</span>}
          <span className="ml-auto">{post.views || 0} views</span>
        </div>

        {/* ── Action bar ── */}
        <div className="flex items-center gap-1 mb-4">
          {[
            {
              id: "like", label: liked ? "Liked" : "Like", icon: <Heart className="w-4 h-4" style={{ fill: liked ? "#ef4444" : "transparent" }} />,
              color: liked ? "#ef4444" : undefined, onClick: handleLike,
            },
            {
              id: "comment", label: "Comment", icon: <MessageSquare className="w-4 h-4" />,
              onClick: () => {},
            },
            {
              id: "share", label: "Share", icon: <Share2 className="w-4 h-4" />,
              onClick: handleShare,
            },
            {
              id: "save", label: saved ? "Saved" : "Save", icon: <Bookmark className="w-4 h-4" style={{ fill: saved ? "#f59e0b" : "transparent" }} />,
              color: saved ? "#f59e0b" : undefined, onClick: handleSave,
            },
          ].map(a => (
            <button key={a.id} onClick={a.onClick}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-opacity-80 ${
                isDarkMode ? "text-slate-400 hover:bg-gray-800/70 hover:text-white" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
              style={a.color ? { color: a.color } : {}}>
              {a.icon} <span className="hidden sm:inline">{a.label}</span>
            </button>
          ))}
        </div>

        {/* ── Q&A Answers ── */}
        {isQuestion && (
          <div className="space-y-3 mb-4">
            {/* Answer input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Write your answer…"
                value={answerText}
                onChange={e => setAnswerText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handlePostAnswer()}
                className={`flex-1 px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${inputCls}`}
              />
              <button onClick={handlePostAnswer} disabled={submitting || !answerText.trim()}
                className="p-2.5 rounded-xl text-white transition-all active:scale-95 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
                {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>

            {/* Toggle answers */}
            {post.answers?.length > 0 && (
              <button onClick={() => setShowAnswers(p => !p)}
                className={`flex items-center gap-2 text-sm font-semibold transition-colors ${isDarkMode ? "text-slate-400 hover:text-blue-400" : "text-gray-500 hover:text-blue-600"}`}>
                <HelpCircle className="w-4 h-4" />
                {showAnswers ? "Hide" : "View"} {post.answers.length} answer{post.answers.length !== 1 ? "s" : ""}
                {showAnswers ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}

            {/* Answers list */}
            {showAnswers && post.answers?.length > 0 && (
              <div className="space-y-3">
                {/* Accepted first */}
                {[...post.answers].sort((a, b) => b.isAccepted - a.isAccepted).map(a => (
                  <AnswerItem key={a._id} answer={a} postId={post._id}
                    isAuthor={isOwn} isDarkMode={isDarkMode}
                    currentUserId={currentUserId} onRefresh={handleRefresh} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Comments ── */}
        <CommentSection post={post} isDarkMode={isDarkMode} currentUserId={currentUserId} onRefresh={handleRefresh} />
      </div>
    </div>
  );
}
