// client/src/components/contract/ContractDetails.jsx
import { useState } from "react";
import api from "../../utils/api";
import { showSuccess, showError } from "../../utils/toast";
import ContractProgress from "./ContractProgress";
import ContractSessionList from "./ContractSessionList";
import { useNavigate } from "react-router-dom";

const statusBadge = {
  pending:   "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  active:    "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  completed: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  cancelled: "bg-red-500/15 text-red-400 border border-red-500/30",
};

export default function ContractDetails({ contract, myId, onClose, onUpdate }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const isA = contract.userA._id === myId;
  const isB = contract.userB._id === myId;
  const partner = isA ? contract.userB : contract.userA;

  const myApproved = isA ? contract.approvedByA : contract.approvedByB;
  const needsMyApproval = !myApproved && contract.status === "pending";

  const displaySkillTeach = isA ? contract.skillTeach : contract.skillLearn;
  const displaySkillLearn = isA ? contract.skillLearn : contract.skillTeach;

  const handleApprove = async () => {
    setLoading(true);
    try {
      await api.put(`/contracts/accept/${contract._id}`);
      showSuccess("Contract approved!");
      onUpdate?.();
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to approve");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this contract?")) return;
    setLoading(true);
    try {
      await api.put(`/contracts/cancel/${contract._id}`);
      showSuccess("Contract cancelled.");
      onUpdate?.();
      onClose?.();
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to cancel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="w-full max-w-3xl bg-gradient-to-br from-gray-950 via-gray-900 to-slate-950 border border-emerald-500/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500/15 to-teal-500/10 border-b border-emerald-500/20 px-8 py-5 flex items-start justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h2 className="text-xl font-black text-white">{displaySkillTeach} ↔ {displaySkillLearn}</h2>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${statusBadge[contract.status]}`}>{contract.status.toUpperCase()}</span>
            </div>
            <p className="text-sm text-gray-400">with <span className="text-emerald-400 font-semibold">{partner.name}</span></p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors ml-4 flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-8 py-6 space-y-6">
          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "You Teach", value: displaySkillTeach, color: "text-emerald-400" },
              { label: "You Learn", value: displaySkillLearn, color: "text-teal-400" },
              { label: "Sessions", value: `${contract.totalSessions} sessions` },
              { label: "Duration", value: `${contract.sessionDuration} min each` },
            ].map((item) => (
              <div key={item.label} className="bg-gray-800/40 border border-gray-700/40 rounded-2xl p-4">
                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${item.color || "text-gray-400"}`}>{item.label}</p>
                <p className="text-white font-semibold">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Start Date & Partner */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/40 border border-gray-700/40 rounded-2xl p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Start Date</p>
              <p className="text-white font-semibold">{new Date(contract.startDate).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
            </div>
            <div className="bg-gray-800/40 border border-gray-700/40 rounded-2xl p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Approval Status</p>
              <p className="text-sm font-semibold">
                <span className={contract.approvedByA ? "text-emerald-400" : "text-gray-500"}>{contract.userA.name} {contract.approvedByA ? "✅" : "⏳"}</span>
                <span className="text-gray-600 mx-2">·</span>
                <span className={contract.approvedByB ? "text-emerald-400" : "text-gray-500"}>{contract.userB.name} {contract.approvedByB ? "✅" : "⏳"}</span>
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-gray-800/40 border border-gray-700/40 rounded-2xl p-5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <ContractProgress completed={contract.completedSessions} total={contract.totalSessions} />
          </div>

          {/* Notes */}
          {contract.notes && (
            <div className="bg-gray-800/40 border border-gray-700/40 rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Contract Notes</p>
              <p className="text-gray-300 text-sm leading-relaxed">{contract.notes}</p>
            </div>
          )}

          {/* Sessions */}
          <div className="bg-gray-800/40 border border-gray-700/40 rounded-2xl p-5">
            <ContractSessionList contract={contract} myId={myId} onUpdate={onUpdate} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            {needsMyApproval && (
              <button onClick={handleApprove} disabled={loading}
                className="flex-1 min-w-[160px] py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 text-sm">
                ✅ Approve Contract
              </button>
            )}
            {contract.status === "completed" && !contract.reviewLeft && (
              <button onClick={() => navigate(`/review/${contract._id}?type=contract`)}
                className="flex-1 min-w-[160px] py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all text-sm">
                ⭐ Leave a Review
              </button>
            )}
            {(contract.status === "pending" || contract.status === "active") && (
              <button onClick={handleCancel} disabled={loading}
                className="flex-1 min-w-[160px] py-3 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 font-bold rounded-xl transition-all disabled:opacity-50 text-sm">
                ❌ Cancel Contract
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
