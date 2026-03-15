import React, { useState, useEffect } from "react";
import api from "../utils/api";
import CalendarView from "../components/session/CalendarView";
import SessionForm from "../components/session/SessionForm";
import UpcomingSessions from "../components/session/UpcomingSessions";
import { LucideVideo, LucideX, LucideUser, LucideCalendar, LucideMapPin, LucideClock, LucideAlertCircle } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

const SessionScheduler = () => {
  const { isDarkMode } = useTheme();
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  const fetchSessions = async () => {
    try {
      const res = await api.get("/sessions");
      setSessions(res.data.data);
    } catch (err) {
      console.error("Failed to load sessions", err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted": return "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]";
      case "pending": return "bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]";
      case "rejected": return "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]";
      case "completed": return "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]";
      default: return "bg-gray-500 text-white";
    }
  };

  let hasStarted = false;
  let hasEnded = false;
  
  if (selectedSession) {
    const now = new Date();
    const startTimeObj = new Date(selectedSession.date);
    if (selectedSession.startTime) {
      const [startHour, startMinute] = selectedSession.startTime.split(":");
      startTimeObj.setHours(parseInt(startHour, 10), parseInt(startMinute, 10), 0, 0);
    }
    const endTimeObj = new Date(selectedSession.date);
    if (selectedSession.endTime) {
      const [endHour, endMinute] = selectedSession.endTime.split(":");
      endTimeObj.setHours(parseInt(endHour, 10), parseInt(endMinute, 10), 0, 0);
    }
    hasStarted = now >= startTimeObj;
    hasEnded = now >= endTimeObj;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-black via-gray-950 to-slate-950' : 'bg-gradient-to-br from-gray-50 via-gray-100 to-slate-100'} relative overflow-hidden font-sans transition-colors duration-500`}>
      {/* Dynamic Background Glows */}
      <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] ${isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-300/20'} rounded-full blur-[120px] pointer-events-none transition-colors duration-500`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] ${isDarkMode ? 'bg-teal-500/10' : 'bg-teal-300/20'} rounded-full blur-[120px] pointer-events-none transition-colors duration-500`} />

      <div className="container mx-auto px-4 py-8 lg:px-8 relative z-10 w-full mb-20 max-w-7xl">
        <header className="mb-10 text-center lg:text-left flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-green-400 to-teal-500 mb-3 drop-shadow-sm tracking-tight">
              Session Calendar
            </h1>
            <p className={`text-lg max-w-2xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Effortlessly manage your skill-sharing schedule. Select dates to view details and coordinate meetings.
            </p>
          </div>
          
          <div className={`hidden md:flex items-center gap-4 px-6 py-4 rounded-2xl ${isDarkMode ? 'bg-gray-900/40 border border-gray-700/50' : 'bg-white/60 border border-gray-200'} backdrop-blur-xl shadow-xl`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-100'}`}>
               <LucideCalendar className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
               <p className={`text-xs uppercase tracking-wider font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Today is</p>
               <p className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                 {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric'})}
               </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Main Calendar Area */}
          <div className="xl:col-span-8 flex flex-col gap-8">
            <CalendarView sessions={sessions} onSelectSession={setSelectedSession} />
            
            {selectedSession && (
              <div className={`${isDarkMode ? 'bg-gray-900/60 border-emerald-500/30' : 'bg-white/80 border-emerald-300'} backdrop-blur-2xl border-2 p-6 md:p-8 rounded-3xl shadow-[0_0_40px_rgba(16,185,129,0.15)] relative transform transition-all duration-300 animate-in slide-in-from-bottom-5`}>
                <button
                  className={`absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                    isDarkMode ? 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-500 hover:text-gray-800 hover:bg-gray-200'
                  }`}
                  onClick={() => setSelectedSession(null)}
                >
                  <LucideX className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-100'}`}>
                    <LucideMapPin className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'} tracking-tight`}>
                      Session Details
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded-lg ${getStatusColor(selectedSession.status)}`}>
                        {selectedSession.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-2xl mb-6 ${isDarkMode ? 'bg-gray-800/40 border border-gray-700/50' : 'bg-gray-50 border border-gray-200/50'}`}>
                  <div className="flex items-start gap-3">
                    <LucideUser className={`w-5 h-5 mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <div>
                      <span className={`block text-xs uppercase font-bold tracking-wider mb-1 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Participants</span>
                      <p className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Host: <span className="font-normal opacity-80">{selectedSession.hostUser?.name}</span></p>
                      <p className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Guest: <span className="font-normal opacity-80">{selectedSession.participantUser?.name}</span></p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <LucideClock className={`w-5 h-5 mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <div>
                      <span className={`block text-xs uppercase font-bold tracking-wider mb-1 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Date & Time</span>
                      <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {new Date(selectedSession.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      <p className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {selectedSession.startTime} — {selectedSession.endTime}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedSession.notes && (
                  <div className="mb-6">
                    <span className={`block text-xs uppercase font-bold tracking-wider mb-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Notes / Agenda</span>
                    <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedSession.notes}</p>
                  </div>
                )}

                {selectedSession.meetingLink ? (
                  selectedSession.status === 'accepted' ? (
                    !hasStarted ? (
                      <div className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-all duration-300 ${isDarkMode ? 'bg-gray-800/80 text-gray-400 border border-gray-700' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                        <LucideClock className="w-5 h-5" />
                        Starts at {selectedSession.startTime}
                      </div>
                    ) : !hasEnded ? (
                      <a
                        href={selectedSession.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_25px_rgba(16,185,129,0.4)] transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 animate-pulse hover:animate-none"
                      >
                        <LucideVideo className="w-5 h-5" />
                        Join Video Meeting 
                      </a>
                    ) : (
                      <div className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-all duration-300 ${isDarkMode ? 'bg-gray-800/80 text-gray-400 border border-gray-700' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                        <LucideAlertCircle className="w-5 h-5" />
                        Meeting Ended
                      </div>
                    )
                  ) : (
                    <div className={`w-full py-3.5 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 font-semibold ${isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'}`}>
                      <LucideAlertCircle className="w-5 h-5" />
                      Link available when session is accepted
                    </div>
                  )
                ) : (
                  <div className={`w-full py-3.5 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 font-semibold ${isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'}`}>
                    No meeting link provided
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="xl:col-span-4 flex flex-col gap-8">
            <SessionForm onSessionCreated={fetchSessions} />
            <UpcomingSessions sessions={sessions} onUpdate={fetchSessions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionScheduler;
