import React, { useEffect, useState } from "react";
import { useSocket } from "../../contexts/SocketContext";
import { toast } from "react-toastify";
import { LucideBellRing, LucideVideo } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

const SessionReminder = () => {
  const { socket } = useSocket();
  const { isDarkMode } = useTheme();
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handleReminder = (data) => {
      const { session, type } = data;
      const message = `Reminder: Session "${session.skillTeach} ↔ ${session.skillLearn}" starts in ${type}!`;
      
      toast.info(message, {
        icon: <LucideBellRing className="text-yellow-400" />,
        autoClose: false,
      });

      setReminders((prev) => [...prev, data]);
    };

    socket.on("session-reminder", handleReminder);

    return () => {
      socket.off("session-reminder", handleReminder);
    };
  }, [socket]);

  if (reminders.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
      {reminders.map((r, idx) => (
        <div 
          key={idx} 
          className={`${
            isDarkMode ? 'bg-gray-900 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
            : 'bg-white border-emerald-200 shadow-xl'
          } border p-4 rounded-2xl flex items-start gap-4 w-80 relative overflow-hidden transition-all duration-300`}
        >
          {/* Subtle bg glow */}
          <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none ${isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-200/40'}`} />

          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-100'}`}>
            <LucideBellRing className="w-5 h-5 text-emerald-500 animate-pulse" />
          </div>
          
          <div className="flex-1 relative z-10">
            <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Session in {r.type}
            </h4>
            <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <span className={isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}>{r.session.skillTeach}</span> ↔ <span className={isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}>{r.session.skillLearn}</span>
            </p>
            {r.session.meetingLink && (
              <a
                href={r.session.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center justify-center gap-1.5 w-full text-xs font-bold px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-400 hover:to-teal-400 transition-all shadow-md transform hover:-translate-y-0.5"
              >
                <LucideVideo className="w-3.5 h-3.5" />
                Join Now
              </a>
            )}
          </div>
          
          <button 
            onClick={() => setReminders(reminders.filter((_, i) => i !== idx))}
            className={`absolute top-2 right-3 p-1 rounded-full ${isDarkMode ? 'text-gray-500 hover:bg-gray-800 hover:text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'}`}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default SessionReminder;
