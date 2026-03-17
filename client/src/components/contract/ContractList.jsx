// client/src/components/contract/ContractList.jsx
import ContractProgress from "./ContractProgress";

const statusBadge = {
  pending:   { bg: "bg-amber-500/15 text-amber-400 border border-amber-500/30", dot: "bg-amber-400" },
  active:    { bg: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30", dot: "bg-emerald-400" },
  completed: { bg: "bg-blue-500/15 text-blue-400 border border-blue-500/30", dot: "bg-blue-400" },
  cancelled: { bg: "bg-red-500/15 text-red-400 border border-red-500/30", dot: "bg-red-400" },
};

const statusEmoji = { pending: "⏳", active: "🔄", completed: "🎉", cancelled: "❌" };

export default function ContractList({ contracts, myId, onSelect, filterStatus }) {
  let filtered = contracts;
  if (filterStatus && filterStatus !== "all") {
    filtered = contracts.filter((c) => c.status === filterStatus);
  }

  if (filtered.length === 0)
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">🤝</div>
        <p className="text-gray-400 font-medium">No contracts in this category.</p>
        <p className="text-gray-600 text-sm mt-1">Create a new skill exchange contract to get started.</p>
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {filtered.map((c) => {
        const partner = c.userA._id === myId ? c.userB : c.userA;
        const badge = statusBadge[c.status] || statusBadge.pending;
        const myApproved = c.userA._id === myId ? c.approvedByA : c.approvedByB;
        const needsApproval = !myApproved && c.status === "pending";

        const isA = c.userA._id === myId;
        const displaySkillTeach = isA ? c.skillTeach : c.skillLearn;
        const displaySkillLearn = isA ? c.skillLearn : c.skillTeach;

        return (
          <div key={c._id}
            onClick={() => onSelect(c)}
            className="group bg-gray-900/60 border border-gray-700/40 hover:border-emerald-500/30 rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1 relative overflow-hidden">
            {/* Glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl pointer-events-none" />

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${badge.bg}`}>
                      {statusEmoji[c.status]} {c.status.toUpperCase()}
                    </span>
                    {needsApproval && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/30">
                        NEEDS YOUR APPROVAL
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-white mt-2">
                    {displaySkillTeach} <span className="text-emerald-400">↔</span> {displaySkillLearn}
                  </h3>
                </div>
                {/* Partner avatar */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg overflow-hidden">
                  {partner.profileImage ? (
                    <img 
                      src={partner.profileImage} 
                      alt={partner.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    partner.name?.[0]?.toUpperCase() || "?"
                  )}
                </div>
              </div>

              {/* Partner */}
              <p className="text-sm text-gray-400 mb-4">
                with <span className="text-white font-semibold">{partner.name}</span>
              </p>

              {/* Stats */}
              <div className="flex gap-4 mb-4 text-xs text-gray-500">
                <span>📅 {c.totalSessions} sessions</span>
                <span>⏱ {c.sessionDuration} min</span>
                <span>📆 {new Date(c.startDate).toLocaleDateString()}</span>
              </div>

              {/* Progress */}
              <ContractProgress completed={c.completedSessions} total={c.totalSessions} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
