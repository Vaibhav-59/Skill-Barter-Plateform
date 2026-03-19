import { useTheme } from "../../hooks/useTheme";

function Avatar({ user }) {
  const src = user?.profileImage || user?.avatar;
  if (src) {
    return (
      <img
        src={src.startsWith("http") ? src : `http://localhost:5000${src}`}
        alt={user?.name}
        className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
      />
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
      {user?.name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

export default function ParticipantsList({ participants = [], hostUserId, onClose }) {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`rounded-2xl border overflow-hidden ${
        isDarkMode
          ? "bg-gray-900 border-white/10"
          : "bg-white border-gray-200 shadow-xl"
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-5 py-4 border-b ${
          isDarkMode ? "border-white/10" : "border-gray-100"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">👥</span>
          <h3
            className={`font-bold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Participants
          </h3>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              isDarkMode
                ? "bg-white/10 text-slate-400"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {participants.length}
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
              isDarkMode
                ? "text-slate-400 hover:text-white hover:bg-white/10"
                : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            ✕
          </button>
        )}
      </div>

      {/* List */}
      <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
        {participants.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-4xl mb-3">🪑</div>
            <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
              No participants yet
            </p>
          </div>
        ) : (
          participants.map((p, i) => {
            const user = p.userId;
            const isHost =
              (user?._id || user) === (hostUserId?._id || hostUserId);
            return (
              <div
                key={i}
                className={`flex items-center gap-3 px-5 py-3 transition-colors ${
                  isDarkMode ? "hover:bg-white/5" : "hover:bg-gray-50"
                }`}
              >
                <Avatar user={user} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={`font-semibold text-sm truncate ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {user?.name || "Unknown"}
                    </p>
                    {isHost && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        HOST
                      </span>
                    )}
                  </div>
                  {user?.skills?.length > 0 && (
                    <p
                      className={`text-xs truncate mt-0.5 ${
                        isDarkMode ? "text-slate-500" : "text-gray-400"
                      }`}
                    >
                      {user.skills.slice(0, 3).map((s) => s.name || s).join(" · ")}
                    </p>
                  )}
                </div>
                <span
                  className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    p.status === "joined"
                      ? "bg-emerald-400/20 text-emerald-400 border border-emerald-400/30"
                      : "bg-amber-400/20 text-amber-400 border border-amber-400/30"
                  }`}
                >
                  {p.status || "joined"}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
