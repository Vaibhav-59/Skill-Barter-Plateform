// client/src/components/contract/ContractSessionList.jsx
import { useState, useEffect } from "react";
import api from "../../utils/api";
import { showSuccess, showError } from "../../utils/toast";
import { useNavigate } from "react-router-dom";

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

export default function ContractSessionList({ contract, myId, onUpdate }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Form state
  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    meetingLink: "",
    notes: "",
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const openSchedule = (session) => {
    setSelectedSession(session);
    setFormData({
      date: session.date ? new Date(session.date).toISOString().split("T")[0] : "",
      startTime: session.startTime || "",
      endTime: session.endTime || "",
      meetingLink: session.meetingLink || "",
      notes: session.notes || "",
    });
    setShowModal(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/contracts/schedule-session/${contract._id}`, {
        sessionNumber: selectedSession.sessionNumber,
        ...formData,
      });
      showSuccess(`Session #${selectedSession.sessionNumber} scheduled!`);
      setShowModal(false);
      onUpdate?.();
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (sessionNumber) => {
    if (!window.confirm("Mark this session as completed?")) return;
    setLoading(true);
    try {
      await api.put(`/contracts/complete-session/${contract._id}`, { sessionNumber });
      showSuccess("Session completed!");
      onUpdate?.();
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to complete");
    } finally {
      setLoading(false);
    }
  };

  const canJoin = (date, startTime) => {
    if (!date || !startTime) return false;
    const sessionStart = new Date(date);
    const [hours, minutes] = startTime.split(":");
    sessionStart.setHours(parseInt(hours), parseInt(minutes), 0);
    // Allow joining 5 minutes early
    return currentTime >= new Date(sessionStart.getTime() - 5 * 60 * 1000);
  };

  const handleJoin = (link) => {
    if (!link) return;
    if (link.startsWith("http")) {
      window.open(link, "_blank");
    } else {
      navigate(`/meeting/${link}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
          Sessions ({contract.sessions?.length || 0})
        </h3>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {(contract.sessions || []).map((session, index) => {
          const isScheduled = session.status === "scheduled";
          const isCompleted = session.status === "completed";
          const isPending = session.status === "pending";
          const joinable = canJoin(session.date, session.startTime);

          return (
            <div key={index} className="bg-gray-800/40 border border-gray-700/40 rounded-2xl p-4 hover:border-emerald-500/20 transition-all group">
              <div className="flex items-center justify-between flex-wrap gap-4">
                {/* Session Info */}
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black transition-all ${isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700/60 text-white'}`}>
                    {session.sessionNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold text-white">Session {session.sessionNumber}</p>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${statusColor[session.status]}`}>
                        {session.status}
                      </span>
                    </div>
                    {session.date ? (
                      <p className="text-xs text-gray-400 flex items-center gap-1.5">
                        <span className="text-emerald-400">📅</span>
                        {new Date(session.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        <span className="text-gray-600">·</span>
                        <span className="text-teal-400">🕒</span>
                        {session.startTime}–{session.endTime}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 italic">Not scheduled yet</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Schedule / Reschedule */}
                  {!isCompleted && contract.status === "active" && (
                    <button
                      onClick={() => openSchedule(session)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        isScheduled 
                          ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20" 
                          : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                      }`}
                    >
                      {isScheduled ? "🔄 Reschedule" : "📅 Schedule"}
                    </button>
                  )}

                  {/* Complete */}
                  {isScheduled && !isCompleted && (
                    <button
                      onClick={() => handleComplete(session.sessionNumber)}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                    >
                      ✅ Complete
                    </button>
                  )}

                  {/* Join */}
                  {isScheduled && !isCompleted && session.meetingLink && (
                    <button
                      onClick={() => handleJoin(session.meetingLink)}
                      disabled={!joinable}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border shadow-lg ${
                        joinable 
                          ? "bg-indigo-500 text-white border-indigo-400 hover:bg-indigo-400 shadow-indigo-500/20" 
                          : "bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed"
                      }`}
                    >
                      {joinable ? "🚀 Join Meeting" : "⏳ Join at Start"}
                    </button>
                  )}

                  {isCompleted && (
                    <div className="p-2 bg-emerald-500/10 rounded-full">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-gray-900 border border-emerald-500/20 rounded-3xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
              <h4 className="text-lg font-black text-white">Schedule Session #{selectedSession?.sessionNumber}</h4>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-black text-emerald-400 uppercase tracking-widest mb-2">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-emerald-400 uppercase tracking-widest mb-2">Start</label>
                    <input
                      type="time"
                      required
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-emerald-400 uppercase tracking-widest mb-2">End</label>
                    <input
                      type="time"
                      required
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-emerald-400 uppercase tracking-widest mb-2">Meeting Link / ID (Optional)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Zoom link or meeting room ID"
                      value={formData.meetingLink}
                      onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const meetingId = Math.random().toString(36).slice(2, 7) + "-" + Math.random().toString(36).slice(2, 7);
                        const meetingUrl = `${window.location.origin}/meeting/${meetingId}`;
                        setFormData({ ...formData, meetingLink: meetingUrl });
                        showSuccess("Meeting link generated!");
                      }}
                      className="px-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold hover:bg-emerald-500/20 transition-all"
                    >
                      Auto-Generate
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-emerald-400 uppercase tracking-widest mb-2">Notes</label>
                  <textarea
                    rows="2"
                    placeholder="Session goals, topics..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all resize-none"
                  ></textarea>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black rounded-2xl hover:from-emerald-400 hover:to-teal-500 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50"
              >
                {loading ? "SAVING..." : "CONFIRM SCHEDULE"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
