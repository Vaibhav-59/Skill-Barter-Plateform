import { useState, useEffect } from "react";
import api from "../../utils/api";
import { showError } from "../../utils/toast";

export default function ActiveMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/meetings");
      if (response.data.success) {
        setMeetings(response.data.data);
      } else {
        showError("Failed to fetch active meetings");
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to fetch active meetings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
    // Refresh every 15 seconds for live status
    const interval = setInterval(fetchMeetings, 15000);
    return () => clearInterval(interval);
  }, []);

  const totalMeetings = meetings.length;
  const activeCount = meetings.filter(m => m.status === "active").length;
  const endedCount = totalMeetings - activeCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Meetings Analysis
          </h1>
          <button
            onClick={fetchMeetings}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500/80 to-teal-500/80 text-white rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all font-medium border border-emerald-400/30 shadow-lg"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </button>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-gray-950/95 via-slate-950/90 to-black/95 rounded-2xl border border-slate-500/30 p-6 shadow-lg shadow-black/20">
            <h3 className="text-sm font-medium text-slate-400 mb-2">Total Meetings</h3>
            <div className="text-4xl font-bold text-white">{totalMeetings}</div>
          </div>
          <div className="bg-gradient-to-br from-gray-950/95 via-slate-950/90 to-black/95 rounded-2xl border border-emerald-400/30 p-6 shadow-lg shadow-emerald-500/10">
            <h3 className="text-sm font-medium text-emerald-400 mb-2">Live Now</h3>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-white">{activeCount}</div>
              {activeCount > 0 && (
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              )}
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-950/95 via-slate-950/90 to-black/95 rounded-2xl border border-slate-500/30 p-6 shadow-lg shadow-black/20">
            <h3 className="text-sm font-medium text-slate-400 mb-2">Completed Meetings</h3>
            <div className="text-4xl font-bold text-white">{endedCount}</div>
          </div>
        </div>

        {/* Meetings List */}
        <div className="bg-gradient-to-br from-gray-950/95 via-slate-950/90 to-black/95 rounded-3xl border border-slate-500/30 overflow-hidden backdrop-blur-sm shadow-2xl">
          {loading && meetings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-16 h-16 border-4 border-slate-600/30 border-t-emerald-400 rounded-full animate-spin mb-6"></div>
              <p className="text-slate-400 font-medium text-lg">Loading video meetings data...</p>
            </div>
          ) : meetings.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-500/30 to-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-400/30 shadow-lg">
                <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-slate-300 mb-3 text-2xl font-semibold">No Meeting Data</div>
              <p className="text-slate-500 text-lg">There is no historical or live meeting data available.</p>
            </div>
          ) : (
            <div className="overflow-x-auto p-4 sm:p-6">
              <table className="min-w-full divide-y divide-slate-500/20">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Meeting ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Host</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Participants</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-500/20">
                  {meetings.map((meeting) => (
                    <tr key={meeting._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {meeting.status === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Live
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-500/20 text-slate-400 border border-slate-500/30">
                            Ended
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-white">
                        {meeting.meetingId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {meeting.host ? (
                            <>
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                                {meeting.host.name?.[0]?.toUpperCase() || 'H'}
                              </div>
                              <div className="text-sm font-medium text-slate-200">{meeting.host.name}</div>
                            </>
                          ) : (
                            <div className="text-sm text-slate-500 italic">Unknown / Deleted</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {meeting.participants?.length || 0} Connected
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {new Date(meeting.startedAt).toLocaleString()} 
                        <span className="block text-xs mt-1 text-slate-500">
                          {meeting.endedAt ? `Ended: ${new Date(meeting.endedAt).toLocaleTimeString()}` : "Ongoing..."}
                        </span>
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
