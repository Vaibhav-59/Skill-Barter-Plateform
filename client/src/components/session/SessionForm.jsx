import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { toast } from "react-toastify";
import { LucideVideo, LucideCalendar, LucideUser, LucideClock, LucideBookOpen, LucideGraduationCap, LucideAlignLeft } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

const generateMeetingId = () =>
  Math.random().toString(36).slice(2, 7) +
  "-" +
  Math.random().toString(36).slice(2, 7);

const SessionForm = ({ onSessionCreated }) => {
  const { isDarkMode } = useTheme();
  const [partners, setPartners] = useState([]);
  const [formData, setFormData] = useState({
    participantUser: "",
    skillTeach: "",
    skillLearn: "",
    date: "",
    startTime: "",
    endTime: "",
    notes: "",
    meetingLink: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await api.get("/users/discover");
        setPartners(res.data.data || res.data);
      } catch (err) {
        console.error("Failed to load users", err);
      }
    };
    fetchPartners();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateMeeting = () => {
    const meetingId = generateMeetingId();
    const meetingUrl = `${window.location.origin}/meeting/${meetingId}`;
    setFormData({ ...formData, meetingLink: meetingUrl });
    toast.success("Meeting link generated!", {
      icon: <LucideVideo className="text-emerald-400" />
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.participantUser ||
      !formData.skillTeach ||
      !formData.skillLearn ||
      !formData.date ||
      !formData.startTime ||
      !formData.endTime
    ) {
      return toast.error("Please fill all required fields");
    }

    try {
      setLoading(true);
      const res = await api.post("/sessions", formData);
      toast.success("Session scheduled successfully!");
      onSessionCreated(res.data.data);
      setFormData({
        participantUser: "",
        skillTeach: "",
        skillLearn: "",
        date: "",
        startTime: "",
        endTime: "",
        notes: "",
        meetingLink: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to schedule session");
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = `w-full pl-10 pr-4 py-3 ${
    isDarkMode 
    ? 'bg-gray-800/60 border-gray-700/50 text-white placeholder-gray-500 focus:ring-emerald-500/50' 
    : 'bg-white/80 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-emerald-400/50 focus:border-emerald-400'
  } border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 shadow-sm`;

  const labelStyles = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${
    isDarkMode ? 'text-gray-400' : 'text-gray-600'
  }`;

  const iconStyles = `absolute left-3 top-3.5 w-4 h-4 ${
    isDarkMode ? 'text-gray-500' : 'text-gray-400'
  }`;

  return (
    <div className={`${isDarkMode ? 'bg-gray-900/40 border-gray-700/50' : 'bg-white/60 border-gray-200/50'} backdrop-blur-xl border rounded-3xl p-6 shadow-2xl relative overflow-hidden transition-all duration-300 hover:shadow-emerald-500/10`}>
      {/* Decorative Glow */}
      <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[60px] pointer-events-none transition-colors duration-500 ${isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-300/20'}`} />
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
          <LucideCalendar className="w-5 h-5" />
        </div>
        <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Schedule Session
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
        <div>
          <label className={labelStyles}>Partner</label>
          <div className="relative group">
            <LucideUser className={`${iconStyles} group-focus-within:text-emerald-500 transition-colors`} />
            <select
              name="participantUser"
              value={formData.participantUser}
              onChange={handleChange}
              className={inputStyles}
              required
            >
              <option value="">Select a partner to barter with...</option>
              {Array.isArray(partners) &&
                partners.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelStyles}>You Teach</label>
            <div className="relative group">
              <LucideGraduationCap className={`${iconStyles} group-focus-within:text-emerald-500 transition-colors`} />
              <input
                type="text"
                name="skillTeach"
                placeholder="e.g. React"
                value={formData.skillTeach}
                onChange={handleChange}
                className={inputStyles}
                required
              />
            </div>
          </div>
          <div>
            <label className={labelStyles}>They Teach</label>
            <div className="relative group">
              <LucideBookOpen className={`${iconStyles} group-focus-within:text-emerald-500 transition-colors`} />
              <input
                type="text"
                name="skillLearn"
                placeholder="e.g. Node.js"
                value={formData.skillLearn}
                onChange={handleChange}
                className={inputStyles}
                required
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className={labelStyles}>Date</label>
            <div className="relative group">
              <LucideCalendar className={`${iconStyles} group-focus-within:text-emerald-500 transition-colors`} />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`${inputStyles} custom-color-scheme [color-scheme:dark]`}
                style={{ colorScheme: isDarkMode ? 'dark' : 'light' }}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelStyles}>Start Time</label>
              <div className="relative group">
                <LucideClock className={`${iconStyles} group-focus-within:text-emerald-500 transition-colors`} />
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className={`${inputStyles} custom-color-scheme`}
                  style={{ colorScheme: isDarkMode ? 'dark' : 'light' }}
                  required
                />
              </div>
            </div>
            <div>
              <label className={labelStyles}>End Time</label>
              <div className="relative group">
                <LucideClock className={`${iconStyles} group-focus-within:text-emerald-500 transition-colors`} />
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className={`${inputStyles} custom-color-scheme`}
                  style={{ colorScheme: isDarkMode ? 'dark' : 'light' }}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className={labelStyles}>Meeting Link</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative group flex-1">
              <LucideVideo className={`${iconStyles} group-focus-within:text-emerald-500 transition-colors`} />
              <input
                type="text"
                name="meetingLink"
                placeholder="https://..."
                value={formData.meetingLink}
                onChange={handleChange}
                className={inputStyles}
              />
            </div>
            <button
              type="button"
              onClick={handleCreateMeeting}
              className={`px-5 py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-all duration-300 ${
                isDarkMode 
                ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20' 
                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <LucideVideo className="w-4 h-4" />
              <span>Auto-Generate</span>
            </button>
          </div>
        </div>

        <div>
          <label className={labelStyles}>Notes</label>
          <div className="relative group">
            <LucideAlignLeft className={`${iconStyles} group-focus-within:text-emerald-500 transition-colors`} />
            <textarea
              name="notes"
              rows="2"
              placeholder="Agenda or topics to discuss..."
              value={formData.notes}
              onChange={handleChange}
              className={`${inputStyles} resize-none`}
            ></textarea>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl shadow-[0_4px_15px_rgba(16,185,129,0.2)] hover:shadow-[0_6px_25px_rgba(16,185,129,0.3)] transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Scheduling...
            </span>
          ) : (
            <>
              <LucideCalendar className="w-5 h-5" />
              Confirm Session
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SessionForm;
