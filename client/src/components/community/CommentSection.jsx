// components/community/CommentSection.jsx
import { useState } from "react";
import {
  Heart, Reply, Trash2, Send, ChevronDown, ChevronUp,
  MessageSquare, CheckCircle, ThumbsUp, Loader,
} from "lucide-react";
import { toast } from "react-toastify";
import * as communityApi from "../../services/communityApi";

function timeAgo(dateStr) {
  const s = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (s < 60)    return `${s}s`;
  if (s < 3600)  return `${Math.floor(s/60)}m`;
  if (s < 86400) return `${Math.floor(s/3600)}h`;
  return `${Math.floor(s/86400)}d`;
}

function Avatar({ user, size = 8 }) {
  const src = user?.profileImage || user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=10b981&color=fff&size=32`;
  return <img src={src} alt={user?.name} className={`w-${size} h-${size} rounded-full object-cover flex-shrink-0`} />;
}

/* ── Single Reply ─────────────────────────────────────────────── */
function ReplyItem({ reply, postId, commentId, isDarkMode, currentUserId, onRefresh }) {
  const [liked,    setLiked]    = useState(() => reply.likes?.some(l => l.toString() === currentUserId));
  const [likeCount, setLikeCount] = useState(reply.likes?.length || 0);
  const isOwn = reply.user?._id === currentUserId;

  const bg = isDarkMode ? "bg-gray-800/40 border-slate-700/30" : "bg-gray-50 border-gray-100";

  return (
    <div className={`flex gap-2.5 p-3 rounded-xl border ${bg}`}>
      <Avatar user={reply.user} size={7} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-xs font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{reply.user?.name}</span>
          <span className={`text-[10px] ${isDarkMode ? "text-slate-600" : "text-gray-400"}`}>{timeAgo(reply.createdAt)}</span>
        </div>
        <p className={`text-sm leading-relaxed ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>{reply.content}</p>
        <button
          onClick={async () => {
            try {
              const r = await communityApi.likeComment(postId, commentId);
              setLiked(r.liked); setLikeCount(r.likeCount);
            } catch {}
          }}
          className="flex items-center gap-1 mt-1.5 text-xs transition-colors"
          style={{ color: liked ? "#ef4444" : "#64748b" }}
        >
          <Heart className="w-3 h-3" style={{ fill: liked ? "#ef4444" : "transparent" }} />
          {likeCount > 0 && likeCount}
        </button>
      </div>
    </div>
  );
}

/* ── Single Comment ───────────────────────────────────────────── */
function CommentItem({ comment, postId, isDarkMode, currentUserId, onRefresh }) {
  const [liked, setLiked] = useState(() => comment.likes?.some(l => l.toString() === currentUserId));
  const [likeCount, setLikeCount] = useState(comment.likes?.length || 0);
  const [showReplies, setShowReplies] = useState(false);
  const [replyOpen,   setReplyOpen]   = useState(false);
  const [replyText,   setReplyText]   = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const isOwn = comment.user?._id === currentUserId;

  const inputCls = isDarkMode
    ? "bg-gray-700/60 border-slate-600/40 text-white placeholder-slate-500 focus:border-emerald-500/60"
    : "bg-white border-gray-200 text-gray-900 focus:border-emerald-400";

  const handleLike = async () => {
    try {
      const r = await communityApi.likeComment(postId, comment._id);
      setLiked(r.liked); setLikeCount(r.likeCount);
    } catch {}
  };

  const handleDelete = async () => {
    try {
      await communityApi.deleteComment(postId, comment._id);
      onRefresh();
      toast.success("Comment deleted");
    } catch { toast.error("Could not delete"); }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await communityApi.addReply(postId, comment._id, replyText.trim());
      setReplyText(""); setReplyOpen(false); setShowReplies(true);
      onRefresh();
    } catch { toast.error("Could not reply"); }
    finally { setSubmitting(false); }
  };

  const bg = isDarkMode ? "bg-gray-800/30 border-slate-700/30" : "bg-white border-gray-100";

  return (
    <div className={`rounded-xl border p-4 ${bg}`}>
      <div className="flex gap-3">
        <Avatar user={comment.user} size={8} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{comment.user?.name}</span>
            <span className={`text-xs ${isDarkMode ? "text-slate-600" : "text-gray-400"}`}>{timeAgo(comment.createdAt)}</span>
          </div>
          <p className={`text-sm leading-relaxed ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>{comment.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-2.5">
            <button onClick={handleLike} className="flex items-center gap-1 text-xs transition-colors"
              style={{ color: liked ? "#ef4444" : "#64748b" }}>
              <Heart className="w-3.5 h-3.5" style={{ fill: liked ? "#ef4444" : "transparent" }} />
              {likeCount > 0 && <span>{likeCount}</span>}
            </button>
            <button onClick={() => { setReplyOpen(p => !p); }} className="flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-400 transition-colors">
              <Reply className="w-3.5 h-3.5" /> Reply
            </button>
            {comment.replies?.length > 0 && (
              <button onClick={() => setShowReplies(p => !p)} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors">
                {showReplies ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
              </button>
            )}
            {isOwn && (
              <button onClick={handleDelete} className="flex items-center gap-1 text-xs text-slate-600 hover:text-red-400 transition-colors ml-auto">
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Reply form */}
          {replyOpen && (
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                placeholder="Write a reply…"
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleReply()}
                className={`flex-1 px-3 py-2 rounded-xl border text-sm outline-none transition-colors ${inputCls}`}
                autoFocus
              />
              <button onClick={handleReply} disabled={submitting || !replyText.trim()}
                className="p-2 rounded-xl text-white transition-all active:scale-95 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          )}

          {/* Nested replies */}
          {showReplies && comment.replies?.length > 0 && (
            <div className="mt-3 space-y-2 pl-3 border-l-2 border-slate-700/30">
              {comment.replies.map(r => (
                <ReplyItem key={r._id} reply={r} postId={postId} commentId={comment._id}
                  isDarkMode={isDarkMode} currentUserId={currentUserId} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Comment Section ──────────────────────────────────────────── */
export default function CommentSection({ post, isDarkMode, currentUserId, onRefresh }) {
  const [text,       setText]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [show,       setShow]       = useState(false);

  const inputCls = isDarkMode
    ? "bg-gray-800/60 border-slate-600/40 text-white placeholder-slate-500 focus:border-emerald-500/60"
    : "bg-white border-gray-300 text-gray-900 focus:border-emerald-400";

  const handleComment = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await communityApi.addComment(post._id, text.trim());
      setText(""); setShow(true);
      onRefresh();
    } catch { toast.error("Could not post comment"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="pt-3">
      {/* Add comment */}
      <div className="flex gap-2.5 mb-4">
        <input
          type="text"
          placeholder="Add a comment…"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleComment()}
          className={`flex-1 px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${inputCls}`}
        />
        <button onClick={handleComment} disabled={submitting || !text.trim()}
          className="p-2.5 rounded-xl text-white transition-all active:scale-95 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
          {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>

      {/* Toggle comments */}
      {post.comments?.length > 0 && (
        <button onClick={() => setShow(p => !p)}
          className={`flex items-center gap-2 text-sm font-semibold mb-3 transition-colors ${
            isDarkMode ? "text-slate-400 hover:text-emerald-400" : "text-gray-500 hover:text-emerald-600"
          }`}>
          <MessageSquare className="w-4 h-4" />
          {show ? "Hide" : "View"} {post.comments.length} comment{post.comments.length !== 1 ? "s" : ""}
          {show ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      )}

      {/* Comments list */}
      {show && (
        <div className="space-y-3">
          {post.comments.map(c => (
            <CommentItem key={c._id} comment={c} postId={post._id}
              isDarkMode={isDarkMode} currentUserId={currentUserId} onRefresh={onRefresh} />
          ))}
        </div>
      )}
    </div>
  );
}
