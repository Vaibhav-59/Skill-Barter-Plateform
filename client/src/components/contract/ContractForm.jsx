// client/src/components/contract/ContractForm.jsx
import { useState, useEffect } from "react";
import api from "../../utils/api";
import { showSuccess, showError } from "../../utils/toast";

export default function ContractForm({ onCreated, onClose }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    userBId: "",
    skillTeach: "",
    skillLearn: "",
    totalSessions: 4,
    sessionDuration: 60,
    startDate: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch matched users as potential contract partners
    api.get("/matches?status=accepted").then((r) => {
      const myId = JSON.parse(localStorage.getItem("user") || "{}")._id;
      const partners = (r.data.data || []).map((m) =>
        m.requester._id === myId ? m.receiver : m.requester
      );
      // Deduplicate
      const seen = new Set();
      setUsers(partners.filter((u) => { if (seen.has(u._id)) return false; seen.add(u._id); return true; }));
    }).catch(() => {});
  }, []);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.userBId || !form.skillTeach || !form.skillLearn || !form.startDate) {
      showError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/contracts/create", form);
      showSuccess("Contract created! Waiting for partner approval.");
      onCreated?.();
      onClose?.();
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to create contract");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="w-full max-w-xl bg-gradient-to-br from-gray-950 via-gray-900 to-slate-950 border border-emerald-500/20 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500/15 to-teal-500/10 border-b border-emerald-500/20 px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">New Skill Contract</h2>
            <p className="text-sm text-emerald-400 mt-1">Define your skill exchange agreement</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Partner */}
          <div>
            <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Partner User *</label>
            <select value={form.userBId} onChange={(e) => set("userBId", e.target.value)} required
              className="w-full bg-gray-800/60 border border-gray-600/50 focus:border-emerald-500/60 text-white rounded-xl px-4 py-3 text-sm outline-none transition-colors">
              <option value="">Select a matched partner...</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
              ))}
            </select>
            {users.length === 0 && <p className="text-xs text-gray-500 mt-1">You need accepted matches to create a contract.</p>}
          </div>

          {/* Skills */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">You Will Teach *</label>
              <input type="text" value={form.skillTeach} onChange={(e) => set("skillTeach", e.target.value)} required placeholder="e.g. Python"
                className="w-full bg-gray-800/60 border border-gray-600/50 focus:border-emerald-500/60 text-white rounded-xl px-4 py-3 text-sm outline-none transition-colors placeholder-gray-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-teal-400 uppercase tracking-wider mb-2">You Will Learn *</label>
              <input type="text" value={form.skillLearn} onChange={(e) => set("skillLearn", e.target.value)} required placeholder="e.g. UI Design"
                className="w-full bg-gray-800/60 border border-gray-600/50 focus:border-teal-500/60 text-white rounded-xl px-4 py-3 text-sm outline-none transition-colors placeholder-gray-500" />
            </div>
          </div>

          {/* Sessions & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Total Sessions *</label>
              <input type="number" min={1} max={100} value={form.totalSessions} onChange={(e) => set("totalSessions", e.target.value)} required
                className="w-full bg-gray-800/60 border border-gray-600/50 focus:border-emerald-500/60 text-white rounded-xl px-4 py-3 text-sm outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Duration (min) *</label>
              <select value={form.sessionDuration} onChange={(e) => set("sessionDuration", e.target.value)}
                className="w-full bg-gray-800/60 border border-gray-600/50 focus:border-emerald-500/60 text-white rounded-xl px-4 py-3 text-sm outline-none transition-colors">
                {[30, 45, 60, 90, 120].map((d) => <option key={d} value={d}>{d} min</option>)}
              </select>
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Start Date *</label>
            <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} required
              min={new Date().toISOString().split("T")[0]}
              className="w-full bg-gray-800/60 border border-gray-600/50 focus:border-emerald-500/60 text-white rounded-xl px-4 py-3 text-sm outline-none transition-colors" />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Notes (optional)</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} placeholder="Any terms, goals, or expectations..."
              className="w-full bg-gray-800/60 border border-gray-600/50 focus:border-emerald-500/60 text-white rounded-xl px-4 py-3 text-sm outline-none transition-colors resize-none placeholder-gray-500" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none">
            {loading ? "Creating..." : "🤝 Create Contract"}
          </button>
        </form>
      </div>
    </div>
  );
}
