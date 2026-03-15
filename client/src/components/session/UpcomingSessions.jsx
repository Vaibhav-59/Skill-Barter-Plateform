import React from "react";
import api from "../../utils/api";
import { toast } from "react-toastify";
import { LucideVideo, LucideCheckCircle, LucideXCircle, LucideCalendarCheck, LucideClock, LucideUserCircle } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

const UpcomingSessions = ({ sessions, onUpdate }) => {
  const { isDarkMode } = useTheme();
  const currentUserId = JSON.parse(localStorage.getItem("user"))?._id;

  const handleUpdateStatus = async (sessionId, status) => {
    try {
      if (status === "deleted") {
        await api.delete(`/sessions/${sessionId}`);
      } else {
        await api.put(`/sessions/${sessionId}/${status}`);
      }
      toast.success(`Session ${status} successfully`);
      onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to update to ${status}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted": return isDarkMode ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" : "border-emerald-200 text-emerald-600 bg-emerald-50";
      case "pending": return isDarkMode ? "border-amber-500/30 text-amber-400 bg-amber-500/10" : "border-amber-200 text-amber-600 bg-amber-50";
      default: return isDarkMode ? "border-gray-500/30 text-gray-400 bg-gray-500/10" : "border-gray-300 text-gray-500 bg-gray-100";
    }
  };

  if (!sessions || sessions.length === 0) {
    return (
      <div className={`${isDarkMode ? 'bg-gray-900/40 border-gray-700/50' : 'bg-white/60 border-gray-200/50'} backdrop-blur-xl border rounded-3xl p-8 shadow-2xl text-center flex flex-col items-center justify-center py-16`}>
        <div className={`p-4 rounded-full mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <LucideCalendarCheck className={`w-10 h-10 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
        </div>
        <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>No upcoming sessions yet.</p>
        <p className={`text-sm mt-2 max-w-[200px] mx-auto ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          Schedule a session to start sharing skills!
        </p>
      </div>
    );
  }

  // Filter out completed/rejected ones if we just want "Upcoming" or pending
  const activeSessions = sessions.filter(s => s.status !== "completed" && s.status !== "rejected");

  return (
    <div className={`${isDarkMode ? 'bg-gray-900/40 border-gray-700/50' : 'bg-white/60 border-gray-200/50'} backdrop-blur-xl border rounded-3xl p-6 shadow-2xl relative overflow-hidden transition-all duration-300`}>
      <div className="flex z-10 relative items-center justify-between mb-5">
        <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Active Requests
        </h3>
        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-bold rounded-full border border-emerald-500/20">
          {activeSessions.length} active
        </span>
      </div>

      {activeSessions.length === 0 && (
        <div className="text-center py-6 mt-4 opacity-70">
           <LucideCalendarCheck className="w-8 h-8 mx-auto mb-2 text-gray-400" />
           <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>No active sessions right now.</p>
        </div>
      )}

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar z-10 relative">
        {activeSessions.map((session) => {
          {/* Session Logic Processing */}
          const isHost = session.hostUser?._id === currentUserId;
          const partner = isHost ? session.participantUser : session.hostUser;
          const isPending = session.status === "pending";

          // Calculate time logic for buttons
          const now = new Date();
          const sessionDate = new Date(session.date);

          // Build start time object
          const startTimeObj = new Date(session.date);
          if (session.startTime) {
            const [startHour, startMinute] = session.startTime.split(":");
            startTimeObj.setHours(parseInt(startHour, 10), parseInt(startMinute, 10), 0, 0);
          }

          // Build end time object
          const endTimeObj = new Date(session.date);
          if (session.endTime) {
            const [endHour, endMinute] = session.endTime.split(":");
            endTimeObj.setHours(parseInt(endHour, 10), parseInt(endMinute, 10), 0, 0);
          }

          const hasStarted = now >= startTimeObj;
          const hasEnded = now >= endTimeObj;
          const isMeetingActive = hasStarted && !hasEnded;

          return (
            <div 
              key={session._id} 
              className={`${isDarkMode ? 'bg-gray-800/60 border-gray-700/50 hover:bg-gray-800/80' : 'bg-white border-gray-100 hover:shadow-md'} border p-5 rounded-2xl relative group transition-all duration-300`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                     <LucideUserCircle className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className={`font-semibold text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                      {partner?.name || "Unknown User"}
                    </h4>
                    <div className="flex items-center gap-1 mt-0.5">
                      <LucideClock className="w-3 h-3 text-emerald-400" />
                      <p className={`text-[11px] font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(session.date).toLocaleDateString()} • {session.startTime} - {session.endTime}
                      </p>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded flex items-center gap-1 ${getStatusColor(session.status)}`}>
                  {session.status === 'pending' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
                  {session.status === 'accepted' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                  {session.status}
                </span>
              </div>

              <div className={`p-3 rounded-xl mb-4 text-xs ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>I teach:</span>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{isHost ? session.skillTeach : session.skillLearn}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>They teach:</span>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{isHost ? session.skillLearn : session.skillTeach}</span>
                </div>
              </div>

              {/* Show meeting link disabled if it's not time yet, or active if it is time */}
              {session.meetingLink && session.status === "accepted" && (
                !hasStarted ? (
                  <div className="w-full inline-flex items-center justify-center gap-2 py-2 mb-4 bg-gray-500/10 text-gray-500 text-sm font-semibold border border-gray-500/30 rounded-xl cursor-not-allowed opacity-70">
                    <LucideClock className="w-4 h-4" />
                    Starts at {session.startTime}
                  </div>
                ) : !hasEnded ? (
                  <a
                    href={session.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-2 mb-4 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 text-sm font-semibold hover:text-white border border-emerald-500/30 rounded-xl transition-all duration-300 animate-pulse hover:animate-none shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  >
                    <LucideVideo className="w-4 h-4" />
                    Join Video Call
                  </a>
                ) : (
                  <div className="w-full inline-flex items-center justify-center gap-2 py-2 mb-4 bg-gray-500/10 text-gray-400 text-sm font-semibold border border-gray-500/20 rounded-xl cursor-not-allowed">
                    <LucideCheckCircle className="w-4 h-4" />
                    Meeting Ended
                  </div>
                )
              )}

              <div className="flex gap-2">
                {isPending && !isHost && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(session._id, "accept")}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg flex justify-center items-center gap-1.5 transition-all
                      ${isDarkMode ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                    >
                      <LucideCheckCircle className="w-3.5 h-3.5" /> Accept
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(session._id, "reject")}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg flex justify-center items-center gap-1.5 transition-all
                      ${isDarkMode ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20' : 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100'}`}
                    >
                      <LucideXCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </>
                )}
                
                {session.status === "accepted" && hasEnded && (
                  <button
                    onClick={() => handleUpdateStatus(session._id, "complete")}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg flex justify-center items-center gap-1 transition-all
                    ${isDarkMode ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20' : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'}`}
                  >
                    <LucideCheckCircle className="w-3.5 h-3.5" /> Mark Completed
                  </button>
                )}
                
                {session.status === "accepted" && !hasEnded && hasStarted && (
                   <div className="flex-1 py-2 text-xs font-bold rounded-lg flex justify-center items-center gap-1 bg-gray-500/10 text-gray-500 border border-gray-500/20 cursor-not-allowed">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse border border-emerald-500"></span> Meeting in progress
                   </div>
                )}
                
                {isHost && isPending && (
                  <button
                    onClick={() => handleUpdateStatus(session._id, "deleted")}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg flex justify-center items-center gap-1 transition-all
                    ${isDarkMode ? 'bg-gray-700/50 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    Withdraw Invite
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingSessions;
