import { useState, useEffect } from "react";
import api from "../../utils/api";
import { showError } from "../../utils/toast";

export default function SessionManagement() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/sessions");
      if (response.data.success) {
        setSessions(response.data.data);
      } else {
        showError("Failed to fetch sessions");
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to fetch sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const totalSessions = sessions.length;
  const pendingCount = sessions.filter(s => s.status === "pending").length;
  const acceptedCount = sessions.filter(s => s.status === "accepted").length;
  const completedCount = sessions.filter(s => s.status === "completed").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Session Management
          </h1>
          <button
            onClick={fetchSessions}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500/80 to-teal-500/80 text-white rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all font-medium border border-emerald-400/30 shadow-lg"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </button>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-gray-950/95 via-slate-950/90 to-black/95 rounded-2xl border border-slate-500/30 p-6 shadow-lg shadow-black/20">
            <h3 className="text-sm font-medium text-slate-400 mb-2">Total Sessions</h3>
            <div className="text-4xl font-bold text-white">{totalSessions}</div>
          </div>
          <div className="bg-gradient-to-br from-gray-950/95 via-slate-950/90 to-black/95 rounded-2xl border border-amber-400/30 p-6 shadow-lg shadow-amber-500/10">
            <h3 className="text-sm font-medium text-amber-400 mb-2">Pending</h3>
            <div className="text-4xl font-bold text-white">{pendingCount}</div>
          </div>
          <div className="bg-gradient-to-br from-gray-950/95 via-slate-950/90 to-black/95 rounded-2xl border border-emerald-400/30 p-6 shadow-lg shadow-emerald-500/10">
            <h3 className="text-sm font-medium text-emerald-400 mb-2">Accepted</h3>
            <div className="text-4xl font-bold text-white">{acceptedCount}</div>
          </div>
          <div className="bg-gradient-to-br from-gray-950/95 via-slate-950/90 to-black/95 rounded-2xl border border-blue-400/30 p-6 shadow-lg shadow-blue-500/10">
            <h3 className="text-sm font-medium text-blue-400 mb-2">Completed</h3>
            <div className="text-4xl font-bold text-white">{completedCount}</div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="bg-gradient-to-br from-gray-950/95 via-slate-950/90 to-black/95 rounded-3xl border border-slate-500/30 overflow-hidden backdrop-blur-sm shadow-2xl">
          {loading && sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-16 h-16 border-4 border-slate-600/30 border-t-emerald-400 rounded-full animate-spin mb-6"></div>
              <p className="text-slate-400 font-medium text-lg">Loading sessions data...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-500/30 to-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-400/30 shadow-lg">
                <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-slate-300 mb-3 text-2xl font-semibold">No Sessions Data</div>
              <p className="text-slate-500 text-lg">There are no individual sessions in the system.</p>
            </div>
          ) : (
            <div className="overflow-x-auto p-4 sm:p-6">
              <table className="min-w-full divide-y divide-slate-500/20">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Participants</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Skills Exchanged</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Schedule</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-500/20">
                  {sessions.map((session) => (
                    <tr key={session._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border
                          ${session.status === 'completed' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 
                            session.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                            session.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                            'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
                          {session.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-200">Host: {session.hostUser?.name || 'Unknown'}</div>
                        <div className="text-sm text-slate-500">Participant: {session.participantUser?.name || 'Unknown'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        <div>Teaching: <span className="font-semibold text-emerald-400">{session.skillTeach}</span></div>
                        <div>Learning: <span className="font-semibold text-teal-400">{session.skillLearn}</span></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {session.date ? (
                          <>
                            {new Date(session.date).toLocaleDateString()} 
                            <span className="block text-xs mt-1 text-slate-500">
                              {session.startTime} - {session.endTime}
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-500 italic">Not scheduled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
