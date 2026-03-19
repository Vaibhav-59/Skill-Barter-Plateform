import { useState } from "react";
import { useTheme } from "../../hooks/useTheme";
import LiveSessionBadge from "./LiveSessionBadge";

const SKILL_COLORS = [
  "from-blue-500 to-cyan-500",
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-indigo-600",
];

function getColor(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash += str.charCodeAt(i);
  return SKILL_COLORS[hash % SKILL_COLORS.length];
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Avatar({ user, size = "w-8 h-8" }) {
  const src = user?.profileImage || user?.avatar;
  if (src) {
    return (
      <img
        src={src.startsWith("http") ? src : `http://localhost:5000${src}`}
        alt={user?.name}
        className={`${size} rounded-full object-cover ring-2 ring-white/10`}
      />
    );
  }
  return (
    <div
      className={`${size} rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs`}
    >
      {user?.name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

export default function SessionCard({
  session,
  currentUserId,
  onJoin,
  onLeave,
  onEdit,
  onCancel,
  onStart,
  onViewParticipants,
  onViewDetails,
  onJoinMeeting,
  variant = "upcoming", // upcoming | my | joined | live
}) {
  const { isDarkMode } = useTheme();
  const [actionLoading, setActionLoading] = useState(false);

  const cardBg = isDarkMode
    ? "bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.05]"
    : "bg-white border-gray-100 hover:shadow-xl";

  const isHost = session.hostUserId?._id === currentUserId || session.hostUserId === currentUserId;
  const isParticipant = session.participants?.some(
    (p) => (p.userId?._id || p.userId) === currentUserId
  );
  const participantCount = session.participants?.length || 0;
  const fillPct = Math.min(
    100,
    Math.round((participantCount / (session.maxParticipants || 1)) * 100)
  );
  const isFull = participantCount >= session.maxParticipants;
  const gradient = getColor(session.skill);

  const handleAction = async (fn) => {
    setActionLoading(true);
    try {
      await fn();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div
      className={`relative rounded-2xl border transition-all duration-300 overflow-hidden ${cardBg}`}
    >
      {/* Top accent bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${gradient}`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-2">
              {session.status === "live" && <LiveSessionBadge />}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r ${gradient} text-white`}
              >
                {session.skill}
              </span>
              {session.sessionType === "live" && session.status !== "live" && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-400/20 text-blue-300 border border-blue-400/30">
                  Live Session
                </span>
              )}
              {session.status === "completed" && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  Completed ✓
                </span>
              )}
              {session.status === "cancelled" && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-400/20 text-rose-300 border border-rose-400/30">
                  Cancelled
                </span>
              )}
            </div>

            <h3
              className={`font-bold text-base leading-tight truncate ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {session.title}
            </h3>
          </div>

          <div className="flex-shrink-0">
            <Avatar user={session.hostUserId} size="w-10 h-10" />
          </div>
        </div>

        {/* Host name */}
        <div className="flex items-center gap-1.5 mb-3">
          <svg
            className="w-3.5 h-3.5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span
            className={`text-xs ${
              isDarkMode ? "text-slate-400" : "text-gray-500"
            }`}
          >
            {isHost ? (
              <span className="text-blue-400 font-semibold">You (Host)</span>
            ) : (
              session.hostUserId?.name || "Unknown"
            )}
          </span>
        </div>

        {/* Date/Time */}
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span
              className={`text-xs font-medium ${
                isDarkMode ? "text-slate-300" : "text-gray-600"
              }`}
            >
              {formatDate(session.date)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span
              className={`text-xs ${
                isDarkMode ? "text-slate-400" : "text-gray-500"
              }`}
            >
              {session.startTime} – {session.endTime}
            </span>
          </div>
        </div>

        {/* Description */}
        {session.description && (
          <p
            className={`text-xs leading-relaxed mb-3 line-clamp-2 ${
              isDarkMode ? "text-slate-500" : "text-gray-400"
            }`}
          >
            {session.description}
          </p>
        )}

        {/* Participant progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span
              className={`text-xs font-semibold ${
                isDarkMode ? "text-slate-400" : "text-gray-500"
              }`}
            >
              Participants
            </span>
            <span
              className={`text-xs font-bold ${
                isFull ? "text-rose-400" : isDarkMode ? "text-white" : "text-gray-800"
              }`}
            >
              {participantCount}/{session.maxParticipants}
              {isFull && " · Full"}
            </span>
          </div>
          <div
            className={`w-full h-2 rounded-full ${
              isDarkMode ? "bg-white/10" : "bg-gray-100"
            }`}
          >
            <div
              className={`h-2 rounded-full bg-gradient-to-r ${gradient} transition-all duration-500`}
              style={{ width: `${fillPct}%` }}
            />
          </div>

          {/* Participant avatars */}
          {session.participants?.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <div className="flex -space-x-2">
                {session.participants.slice(0, 5).map((p, i) => (
                  <Avatar
                    key={i}
                    user={p.userId}
                    size="w-6 h-6"
                  />
                ))}
              </div>
              {session.participants.length > 5 && (
                <span
                  className={`text-[10px] ml-1 ${
                    isDarkMode ? "text-slate-500" : "text-gray-400"
                  }`}
                >
                  +{session.participants.length - 5} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {/* UPCOMING variant */}
          {variant === "upcoming" && !isHost && !isParticipant && (
            <button
              onClick={() => !isFull && handleAction(() => onJoin?.(session._id))}
              disabled={isFull || actionLoading}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                isFull
                  ? "bg-slate-700/50 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 hover:scale-105 shadow-lg shadow-blue-500/30"
              }`}
            >
              {actionLoading ? "Joining…" : isFull ? "Session Full" : "Join Session"}
            </button>
          )}

          {/* LIVE variant */}
          {variant === "live" && (
            <>
              {(isParticipant || isHost) && session.meetingLink && (
                <a
                  href={session.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-500 hover:to-rose-500 hover:scale-105 transition-all shadow-lg shadow-red-500/30 text-center"
                >
                  🔴 Join Now
                </a>
              )}
              {!isParticipant && !isHost && (
                <button
                  onClick={() => handleAction(() => onJoin?.(session._id))}
                  disabled={isFull || actionLoading}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:scale-105 transition-all"
                >
                  {actionLoading ? "Joining…" : "Join Live"}
                </button>
              )}
            </>
          )}

          {/* MY SESSION variant (host) */}
          {variant === "my" && (
            <>
              {session.status === "scheduled" && (
                <button
                  onClick={() => handleAction(() => onStart?.(session._id))}
                  disabled={actionLoading}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:scale-105 transition-all shadow-lg shadow-emerald-500/20"
                >
                  ▶ Start
                </button>
              )}
              {session.status === "live" && session.meetingLink && (
                <a
                  href={session.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-rose-600 text-white text-center hover:scale-105 transition-all"
                >
                  🔴 Open Room
                </a>
              )}
              <button
                onClick={() => onViewParticipants?.(session)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all hover:scale-105 ${
                  isDarkMode
                    ? "border-white/10 text-slate-300 hover:bg-white/5"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                👥 Participants
              </button>
              {session.status !== "completed" &&
                session.status !== "cancelled" && (
                  <button
                    onClick={() => onEdit?.(session)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all hover:scale-105 ${
                      isDarkMode
                        ? "border-white/10 text-slate-300 hover:bg-white/5"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    ✏️ Edit
                  </button>
                )}
              {session.status !== "completed" &&
                session.status !== "cancelled" && (
                  <button
                    onClick={() => handleAction(() => onCancel?.(session._id))}
                    disabled={actionLoading}
                    className="px-3 py-2 rounded-xl text-xs font-semibold border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-all hover:scale-105"
                  >
                    ✕ Cancel
                  </button>
                )}
            </>
          )}

          {/* JOINED variant */}
          {variant === "joined" && (
            <>
              {(session.status === "live" || session.status === "scheduled") &&
                session.meetingLink && (
                  <a
                    href={session.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-center hover:scale-105 transition-all"
                  >
                    Join Meeting
                  </a>
                )}
              <button
                onClick={() => onViewDetails?.(session)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all hover:scale-105 ${
                  isDarkMode
                    ? "border-white/10 text-slate-300 hover:bg-white/5"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                Details
              </button>
              {session.status !== "completed" &&
                session.status !== "cancelled" && (
                  <button
                    onClick={() =>
                      handleAction(() => onLeave?.(session._id))
                    }
                    disabled={actionLoading}
                    className="px-3 py-2 rounded-xl text-xs font-semibold border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-all hover:scale-105"
                  >
                    Leave
                  </button>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
