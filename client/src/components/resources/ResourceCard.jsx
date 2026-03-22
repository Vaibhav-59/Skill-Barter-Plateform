// components/resources/ResourceCard.jsx
import { useState } from "react";
import {
  Heart, Bookmark, Eye, Star, ExternalLink, Clock,
  Video, FileText, BookOpen, Code, BookMarked, Globe,
  CheckCircle, Share2,
} from "lucide-react";
import { toast } from "react-toastify";

const TYPE_META = {
  Video:         { icon: <Video className="w-3.5 h-3.5" />,      color: "#ef4444", bg: "rgba(239,68,68,0.12)"    },
  Article:       { icon: <FileText className="w-3.5 h-3.5" />,   color: "#3b82f6", bg: "rgba(59,130,246,0.12)"  },
  Course:        { icon: <BookOpen className="w-3.5 h-3.5" />,   color: "#8b5cf6", bg: "rgba(139,92,246,0.12)"  },
  Documentation: { icon: <Code className="w-3.5 h-3.5" />,       color: "#10b981", bg: "rgba(16,185,129,0.12)"  },
  Book:          { icon: <BookMarked className="w-3.5 h-3.5" />, color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
  Tutorial:      { icon: <Globe className="w-3.5 h-3.5" />,      color: "#ec4899", bg: "rgba(236,72,153,0.12)"  },
};

const LEVEL_COLORS = {
  Beginner:     { text: "#10b981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.25)"  },
  Intermediate: { text: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.25)"  },
  Advanced:     { text: "#ef4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.25)"   },
};

const CAT_GRADIENTS = {
  "Web Development":       "from-blue-600 to-cyan-500",
  "Data Science":          "from-purple-600 to-violet-500",
  "UI/UX Design":          "from-pink-600 to-rose-500",
  "Mobile Development":    "from-amber-600 to-orange-500",
  "AI & Machine Learning": "from-emerald-600 to-teal-500",
  "DevOps":                "from-slate-500 to-gray-500",
  "Other":                 "from-indigo-600 to-blue-500",
};

const DEFAULT_THUMBNAILS = {
  "Web Development":       "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=220&fit=crop",
  "Data Science":          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=220&fit=crop",
  "UI/UX Design":          "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=220&fit=crop",
  "Mobile Development":    "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=220&fit=crop",
  "AI & Machine Learning": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=220&fit=crop",
  "DevOps":                "https://images.unsplash.com/photo-1667372393086-9d4001d51cf1?w=400&h=220&fit=crop",
  "Other":                 "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=220&fit=crop",
};

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star
          key={i}
          className="w-3 h-3"
          style={{ color: i <= Math.round(rating) ? "#f59e0b" : "rgba(255,255,255,0.15)", fill: i <= Math.round(rating) ? "#f59e0b" : "transparent" }}
        />
      ))}
    </div>
  );
}

export default function ResourceCard({ resource, isLiked, isBookmarked, onLike, onBookmark, onView, viewMode, isDarkMode }) {
  const [imgErr, setImgErr] = useState(false);
  const typeMeta  = TYPE_META[resource.resourceType]  || TYPE_META.Article;
  const levelMeta = LEVEL_COLORS[resource.difficultyLevel] || LEVEL_COLORS.Beginner;
  const catGrad   = CAT_GRADIENTS[resource.category]  || "from-emerald-600 to-teal-500";
  const thumb     = (!imgErr && resource.thumbnail) ? resource.thumbnail : DEFAULT_THUMBNAILS[resource.category] || DEFAULT_THUMBNAILS["Other"];

  const handleShare = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(resource.resourceLink);
      toast.success("Link copied!");
    } catch { toast.error("Could not copy link"); }
  };

  const card = isDarkMode
    ? "bg-gray-900/80 border-slate-700/40 hover:border-slate-500/60"
    : "bg-white border-gray-200 hover:border-emerald-300/60";

  if (viewMode === "list") {
    return (
      <div
        onClick={onView}
        className={`flex gap-4 rounded-2xl border cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-lg ${card}`}
        style={{ boxShadow: isDarkMode ? "0 2px 12px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.08)" }}
      >
        {/* Thumbnail */}
        <div className="w-40 h-28 flex-shrink-0 relative overflow-hidden">
          <img src={thumb} alt={resource.title} onError={() => setImgErr(true)}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
          <div className={`absolute inset-0 bg-gradient-to-r ${catGrad} opacity-30`} />
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-white"
            style={{ background: typeMeta.color }}>
            {typeMeta.icon} {resource.resourceType}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 py-4 pr-4 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className={`font-bold text-sm leading-snug line-clamp-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>{resource.title}</h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-lg flex-shrink-0"
                style={{ background: levelMeta.bg, border: `1px solid ${levelMeta.border}`, color: levelMeta.text }}>
                {resource.difficultyLevel}
              </span>
            </div>
            <p className={`text-xs mt-1 line-clamp-2 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>{resource.description}</p>
          </div>

          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <Stars rating={resource.averageRating} />
              <span className="text-xs text-slate-500 ml-1">({resource.totalRatings})</span>
            </div>
            <span className="flex items-center gap-1 text-xs text-slate-500"><Eye className="w-3 h-3" />{resource.views}</span>
            <span className="flex items-center gap-1 text-xs text-slate-500"><Heart className="w-3 h-3" />{resource.likes?.length || 0}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center justify-center gap-2 pr-4">
          <ActionBtn onClick={(e) => { e.stopPropagation(); onLike(); }} active={isLiked} color="#ef4444" tooltip="Like">
            <Heart className="w-4 h-4" style={{ fill: isLiked ? "#ef4444" : "transparent" }} />
          </ActionBtn>
          <ActionBtn onClick={(e) => { e.stopPropagation(); onBookmark(); }} active={isBookmarked} color="#f59e0b" tooltip="Bookmark">
            <Bookmark className="w-4 h-4" style={{ fill: isBookmarked ? "#f59e0b" : "transparent" }} />
          </ActionBtn>
          <ActionBtn onClick={handleShare} color="#3b82f6" tooltip="Share">
            <Share2 className="w-4 h-4" />
          </ActionBtn>
        </div>
      </div>
    );
  }

  /* ── GRID CARD ── */
  return (
    <div
      className={`flex flex-col rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 group ${card}`}
      style={{ boxShadow: isDarkMode ? "0 4px 20px rgba(0,0,0,0.35)" : "0 4px 20px rgba(0,0,0,0.08)" }}
      onClick={onView}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = isDarkMode ? "0 12px 40px rgba(0,0,0,0.55)" : "0 12px 40px rgba(0,0,0,0.15)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = isDarkMode ? "0 4px 20px rgba(0,0,0,0.35)" : "0 4px 20px rgba(0,0,0,0.08)"; }}
    >
      {/* Thumbnail */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={thumb} alt={resource.title}
          onError={() => setImgErr(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t ${catGrad} opacity-30 group-hover:opacity-40 transition-opacity`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Type badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-md"
          style={{ background: typeMeta.color, boxShadow: `0 2px 8px ${typeMeta.color}66` }}>
          {typeMeta.icon} {resource.resourceType}
        </div>

        {/* Level badge */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold shadow-md"
          style={{ background: levelMeta.bg, border: `1px solid ${levelMeta.border}`, color: levelMeta.text, backdropFilter: "blur(8px)" }}>
          {resource.difficultyLevel}
        </div>

        {/* Bottom meta overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-end justify-between">
          <div className="flex items-center gap-1">
            <Stars rating={resource.averageRating} />
            <span className="text-xs text-white/70 ml-1">({resource.totalRatings})</span>
          </div>
          {resource.duration && (
            <span className="flex items-center gap-1 text-xs text-white/70">
              <Clock className="w-3 h-3" /> {resource.duration}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-4">
        {/* Category */}
        <div className={`text-xs font-semibold mb-1 bg-gradient-to-r ${catGrad} bg-clip-text text-transparent`}>
          {resource.category}
        </div>

        {/* Title */}
        <h3 className={`font-bold text-base leading-snug mb-2 line-clamp-2 group-hover:text-emerald-400 transition-colors ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          {resource.title}
        </h3>

        {/* Description */}
        <p className={`text-sm line-clamp-2 mb-3 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
          {resource.description}
        </p>

        {/* Tags */}
        {resource.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {resource.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded-lg text-xs font-medium"
                style={{ background: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", color: isDarkMode ? "#94a3b8" : "#64748b" }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Author */}
        {resource.author && (
          <div className="flex items-center gap-2 mb-3">
            <img
              src={resource.author.profileImage || resource.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(resource.author.name || "U")}&background=10b981&color=fff&size=32`}
              alt={resource.author.name}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className={`text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>{resource.author.name}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={`px-4 py-3 flex items-center justify-between border-t ${isDarkMode ? "border-slate-700/40" : "border-gray-100"}`}>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{resource.views}</span>
          <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{resource.likes?.length || 0}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <ActionBtn onClick={(e) => { e.stopPropagation(); onLike(); }} active={isLiked} color="#ef4444" tooltip="Like">
            <Heart className="w-4 h-4" style={{ fill: isLiked ? "#ef4444" : "transparent" }} />
          </ActionBtn>
          <ActionBtn onClick={(e) => { e.stopPropagation(); onBookmark(); }} active={isBookmarked} color="#f59e0b" tooltip="Save">
            <Bookmark className="w-4 h-4" style={{ fill: isBookmarked ? "#f59e0b" : "transparent" }} />
          </ActionBtn>
          <ActionBtn onClick={handleShare} color="#3b82f6" tooltip="Share">
            <Share2 className="w-4 h-4" />
          </ActionBtn>
          <button
            onClick={(e) => { e.stopPropagation(); window.open(resource.resourceLink, "_blank", "noopener"); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Open resource"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ onClick, active, color, tooltip, children }) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className="p-1.5 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
      style={{ color: active ? color : "#64748b" }}
      onMouseEnter={e => e.currentTarget.style.color = color}
      onMouseLeave={e => e.currentTarget.style.color = active ? color : "#64748b"}
    >
      {children}
    </button>
  );
}
