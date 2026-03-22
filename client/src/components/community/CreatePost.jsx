// components/community/CreatePost.jsx
import { useState, useRef } from "react";
import {
  Image, Link, Tag, X, Loader, MessageSquare,
  HelpCircle, Hash, ChevronDown, Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";
import * as communityApi from "../../services/communityApi";

const POST_TYPES = [
  { value: "post",       label: "💬 Post",       desc: "Share an idea, update or resource" },
  { value: "question",   label: "❓ Question",    desc: "Ask the community for help"         },
  { value: "discussion", label: "🗣️ Discussion", desc: "Start a meaningful conversation"     },
];

const SUGGESTED_TAGS = ["React","Python","JavaScript","AI","UI/UX","Node.js","MongoDB","TypeScript","DevOps","Machine Learning","CSS","Next.js"];

export default function CreatePost({ isDarkMode, currentUser, onPosted }) {
  const [open,     setOpen]     = useState(false);
  const [content,  setContent]  = useState("");
  const [title,    setTitle]    = useState("");
  const [tags,     setTags]     = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [postType, setPostType] = useState("post");
  const [resLink,  setResLink]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showType, setShowType] = useState(false);
  const textRef = useRef();

  const card = isDarkMode
    ? "bg-gray-900/90 border-slate-700/50 shadow-xl shadow-black/20"
    : "bg-white border-gray-200 shadow-lg";

  const inputCls = isDarkMode
    ? "bg-gray-800/60 border-slate-600/40 text-white placeholder-slate-500 focus:border-emerald-500/70"
    : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-emerald-400";

  const addTag = (t) => {
    const tag = t.trim();
    if (tag && !tags.includes(tag) && tags.length < 8) {
      setTags(p => [...p, tag]);
    }
    setTagInput("");
  };

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput);
    }
    if (e.key === "Backspace" && !tagInput && tags.length) {
      setTags(p => p.slice(0, -1));
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) { toast.warning("Write something first!"); return; }
    if (postType === "question" && !title.trim()) { toast.warning("Questions need a title"); return; }
    setLoading(true);
    try {
      const res = await communityApi.createPost({ content, title, tags, postType, resourceLink: resLink });
      onPosted(res.data);
      setContent(""); setTitle(""); setTags([]); setTagInput(""); setResLink(""); setOpen(false);
      toast.success("Posted! 🎉");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not post");
    } finally {
      setLoading(false);
    }
  };

  const selectedType = POST_TYPES.find(t => t.value === postType);

  const avatar = currentUser?.profileImage || currentUser?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || "U")}&background=10b981&color=fff&size=64`;

  return (
    <div className={`rounded-2xl border p-5 transition-all duration-300 ${card}`}>
      {/* ── Collapsed trigger ── */}
      {!open ? (
        <div className="flex items-center gap-3" onClick={() => { setOpen(true); setTimeout(() => textRef.current?.focus(), 50); }}>
          <img src={avatar} alt="you" className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-500/30 flex-shrink-0" />
          <div className={`flex-1 rounded-xl px-4 py-3 cursor-text text-sm transition-colors ${
            isDarkMode ? "bg-gray-800/50 text-slate-500 hover:bg-gray-800 border border-slate-700/40" : "bg-gray-50 text-gray-400 hover:bg-gray-100 border border-gray-200"
          }`}>
            What's on your mind? Share knowledge, ask questions…
          </div>
          <button
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 3px 14px rgba(16,185,129,0.35)" }}
          >
            Create Post
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={avatar} alt="you" className="w-9 h-9 rounded-xl object-cover ring-2 ring-emerald-500/30" />
              <div>
                <div className={`font-bold text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>{currentUser?.name}</div>
                {/* Post type picker */}
                <div className="relative">
                  <button
                    onClick={() => setShowType(p => !p)}
                    className={`flex items-center gap-1 text-xs font-semibold rounded-lg px-2 py-0.5 mt-0.5 transition-colors ${
                      isDarkMode ? "bg-gray-700/60 text-slate-300 hover:bg-gray-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {selectedType?.label} <ChevronDown className="w-3 h-3" />
                  </button>
                  {showType && (
                    <div className={`absolute top-full left-0 mt-1 z-20 rounded-2xl border shadow-xl overflow-hidden ${
                      isDarkMode ? "bg-gray-800 border-slate-700/50" : "bg-white border-gray-200"
                    }`} style={{ minWidth: 220 }}>
                      {POST_TYPES.map(t => (
                        <button key={t.value} onClick={() => { setPostType(t.value); setShowType(false); }}
                          className={`w-full flex flex-col items-start px-4 py-3 text-left transition-colors ${
                            postType === t.value
                              ? isDarkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-700"
                              : isDarkMode ? "text-slate-300 hover:bg-gray-700/60" : "text-gray-700 hover:bg-gray-50"
                          }`}>
                          <span className="font-semibold text-sm">{t.label}</span>
                          <span className="text-xs opacity-60 mt-0.5">{t.desc}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Question title (only for questions) */}
          {postType === "question" && (
            <input
              type="text" placeholder="Question title (be specific and clear)…"
              value={title} onChange={e => setTitle(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors font-semibold ${inputCls}`}
            />
          )}

          {/* Main text area */}
          <textarea
            ref={textRef}
            placeholder={
              postType === "question"
                ? "Describe your problem in detail. Include what you've tried…"
                : postType === "discussion"
                ? "Start an interesting conversation — share your thoughts…"
                : "Share knowledge, tips, resources, or updates…"
            }
            rows={4}
            value={content}
            onChange={e => setContent(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none transition-colors leading-relaxed ${inputCls}`}
          />

          {/* Tags input */}
          <div>
            <div className={`flex flex-wrap gap-1.5 min-h-[38px] px-3 py-2 rounded-xl border transition-colors ${inputCls}`}
              onClick={() => document.getElementById("tag-input")?.focus()}>
              <Hash className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
              {tags.map(t => (
                <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold text-emerald-300"
                  style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.25)" }}>
                  #{t}
                  <button onClick={() => setTags(p => p.filter(x => x !== t))} className="opacity-60 hover:opacity-100 ml-0.5">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              <input id="tag-input" type="text" placeholder={tags.length === 0 ? "Add tags (React, Python…) press Enter" : ""}
                value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleKeyDown}
                className="flex-1 min-w-[100px] bg-transparent outline-none text-sm text-white placeholder-slate-500" />
            </div>
            {/* Suggested tags */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {SUGGESTED_TAGS.filter(t => !tags.includes(t)).slice(0, 8).map(t => (
                <button key={t} onClick={() => addTag(t)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-colors ${
                    isDarkMode ? "text-slate-400 bg-gray-800/50 hover:bg-emerald-500/15 hover:text-emerald-400 border border-slate-600/30" : "text-gray-500 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200"
                  }`}>
                  #{t}
                </button>
              ))}
            </div>
          </div>

          {/* Resource link */}
          <div className="relative">
            <Link className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input type="url" placeholder="Attach a resource link (optional)"
              value={resLink} onChange={e => setResLink(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${inputCls}`} />
          </div>

          {/* Action bar */}
          <div className="flex items-center justify-between pt-1">
            <p className={`text-xs ${isDarkMode ? "text-slate-600" : "text-gray-400"}`}>
              {content.length}/2000 characters
            </p>
            <div className="flex gap-2">
              <button onClick={() => setOpen(false)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                  isDarkMode ? "border-slate-600/40 text-slate-400 hover:text-white" : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}>
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={loading || !content.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 3px 14px rgba(16,185,129,0.35)" }}>
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : null}
                {loading ? "Posting…" : selectedType?.label.split(" ")[0] === "❓" ? "Post Question" : "Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
