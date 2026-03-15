// client/src/components/contract/ContractSessionList.jsx

const statusColor = {
  pending: "bg-gray-700/50 text-gray-400 border border-gray-600/30",
  scheduled: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  completed: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  cancelled: "bg-red-500/15 text-red-400 border border-red-500/30",
};

const statusIcon = {
  pending: "⏳",
  scheduled: "📅",
  completed: "✅",
  cancelled: "❌",
};

export default function ContractSessionList({ contract }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
        Sessions ({contract.sessions?.length || 0})
      </h3>

      {(contract.sessions || []).map((session, index) => (
        <div key={index}
          className="bg-gray-800/40 border border-gray-700/40 rounded-2xl p-4 transition-all">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-700/60 flex items-center justify-center text-sm font-black text-white">
                {session.sessionNumber}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Session {session.sessionNumber}</p>
                {session.date && (
                  <p className="text-xs text-gray-400">
                    {new Date(session.date).toLocaleDateString()} {session.startTime && `· ${session.startTime}–${session.endTime}`}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-bold px-3 py-1 rounded-lg ${statusColor[session.status] || ""}`}>
                {statusIcon[session.status]} {session.status}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
