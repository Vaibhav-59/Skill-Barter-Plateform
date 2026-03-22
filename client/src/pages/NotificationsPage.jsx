import { useEffect, useState } from "react";
import api from "../utils/api";
import { showError, showSuccess } from "../utils/toast";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data || []);
    } catch {
      showError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      showSuccess("Marked as read");
    } catch {
      showError("Failed to mark as read");
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      showSuccess("Notification deleted");
    } catch {
      showError("Failed to delete notification");
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "match_request":
        return "🤝";
      case "message":
        return "💬";
      case "reminder":
        return "⏰";
      case "system":
        return "⚙️";
      case "gamification":
        return "🎮";
      default:
        return "🔔";
    }
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin shadow-lg shadow-emerald-400/20"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
            Your Notifications
          </h2>
          <p className="text-gray-400 font-medium mt-1">Stay updated with your SkillBarter activity</p>
        </div>
      </div>

      <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-800/10 to-transparent pointer-events-none"></div>

        {!notifications.length ? (
          <div className="p-16 text-center relative z-10">
            <div className="w-20 h-20 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-gray-400 text-lg font-medium">You're all caught up!</p>
            <p className="text-gray-500 text-sm mt-1">No new notifications right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700/50 relative z-10">
            {notifications.map((note) => (
              <div
                key={note._id}
                className={`p-5 sm:p-6 transition-all duration-300 hover:bg-gray-700/30 flex gap-4 ${
                  !note.isRead ? "bg-emerald-900/10 border-l-4 border-l-emerald-500" : "border-l-4 border-l-transparent"
                }`}
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gray-700/50 rounded-xl flex items-center justify-center text-xl shadow-inner border border-gray-600/30 shadow-black/20">
                  {getIcon(note.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4 mb-2">
                    <p className={`text-base leading-relaxed ${!note.isRead ? "text-white font-semibold" : "text-gray-300"}`}>
                      {note.content}
                    </p>
                    <span className="text-xs font-semibold tracking-wide text-gray-400 bg-gray-800/50 px-2 py-1 rounded-md whitespace-nowrap self-start">
                      {formatTime(note.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-2">
                    {!note.isRead && (
                      <button
                        onClick={() => markAsRead(note._id)}
                        className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Mark as read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(note._id)}
                      className="text-sm font-semibold text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1.5"
                      title="Remove notification"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
