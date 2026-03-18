import { useState } from "react";
import { useTheme } from "../../hooks/useTheme";
import { requestCredit } from "../../services/walletApi";
import { toast } from "react-toastify";

export default function CreditRequestModal({ walletBalance, onClose, onSuccess }) {
  const { isDarkMode } = useTheme();
  const [form, setForm] = useState({ skillName: "", message: "", requestedCredits: 1 });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.skillName.trim()) {
      toast.error("Please enter a skill name.");
      return;
    }
    setLoading(true);
    try {
      await requestCredit(form);
      toast.success("Credit request submitted! A pending debt has been created.");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className={`w-full max-w-md rounded-3xl border shadow-2xl ${
          isDarkMode ? "bg-gray-900 border-white/10" : "bg-white border-gray-100"
        }`}
      >
        {/* Header */}
        <div className="relative p-6 pb-0">
          <div
            className="absolute inset-0 rounded-t-3xl opacity-30"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
          />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Request Credit Exchange
              </h2>
              <p className={`text-sm mt-1 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                Current balance: <span className={walletBalance < 0 ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>{walletBalance} credits</span>
              </p>
            </div>
            <button onClick={onClose} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-600"}`}>
              ✕
            </button>
          </div>
        </div>

        {/* Banner */}
        <div className="mx-6 mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3">
          <span className="text-xl">⚠️</span>
          <p className="text-xs text-amber-400 leading-relaxed">
            You're requesting to learn a skill even though you may have low credits. This will create a <strong>credit debt</strong> that will be repaid when you teach sessions.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wide ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
              Skill You Want to Learn *
            </label>
            <input
              type="text"
              value={form.skillName}
              onChange={(e) => setForm({ ...form, skillName: e.target.value })}
              placeholder="e.g. Python, Graphic Design..."
              className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                isDarkMode
                  ? "bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-violet-500/60 focus:bg-white/8"
                  : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-violet-400 focus:bg-white"
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wide ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
              Credits Requested
            </label>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setForm({ ...form, requestedCredits: Math.max(1, form.requestedCredits - 1) })} className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold transition-colors ${isDarkMode ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}>
                −
              </button>
              <span className={`flex-1 text-center text-2xl font-black ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {form.requestedCredits}
              </span>
              <button type="button" onClick={() => setForm({ ...form, requestedCredits: Math.min(10, form.requestedCredits + 1) })} className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold transition-colors ${isDarkMode ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}>
                +
              </button>
            </div>
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wide ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
              Message (optional)
            </label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Why do you need this credit exchange?"
              rows={3}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all resize-none ${
                isDarkMode
                  ? "bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-violet-500/60"
                  : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-violet-400 focus:bg-white"
              }`}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                isDarkMode ? "border-white/10 text-slate-400 hover:text-white hover:border-white/20" : "border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-violet-500/30"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
