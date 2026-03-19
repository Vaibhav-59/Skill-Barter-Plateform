import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../hooks/useTheme";
import { getSession, sendChatMessage } from "../../services/groupSessionApi";
import { toast } from "react-toastify";

function Avatar({ user, size = "w-7 h-7" }) {
  const src = user?.profileImage || user?.avatar;
  if (src) {
    return (
      <img
        src={src.startsWith("http") ? src : `http://localhost:5000${src}`}
        alt={user?.name}
        className={`${size} rounded-full object-cover flex-shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${size} rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-[11px] flex-shrink-0`}
    >
      {user?.name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

export default function SessionChat({ sessionId, currentUserId, onClose }) {
  const { isDarkMode } = useTheme();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!sessionId) return;
    const load = async () => {
      try {
        const data = await getSession(sessionId);
        setMessages(data.data?.chat || []);
      } catch (_) {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      const res = await sendChatMessage(sessionId, newMessage.trim());
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`rounded-2xl border flex flex-col overflow-hidden ${
        isDarkMode
          ? "bg-gray-900 border-white/10"
          : "bg-white border-gray-200 shadow-xl"
      }`}
      style={{ height: 480 }}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-5 py-4 border-b flex-shrink-0 ${
          isDarkMode ? "border-white/10" : "border-gray-100"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">💬</span>
          <h3
            className={`font-bold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Session Chat
          </h3>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              isDarkMode ? "bg-white/10 text-slate-400" : "bg-gray-100 text-gray-500"
            }`}
          >
            {messages.length}
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isDarkMode
                ? "text-slate-400 hover:text-white hover:bg-white/10"
                : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            ✕
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="text-4xl">💬</div>
            <p
              className={`text-sm ${
                isDarkMode ? "text-slate-400" : "text-gray-500"
              }`}
            >
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe =
              (msg.userId?._id || msg.userId) === currentUserId;
            return (
              <div
                key={msg._id || i}
                className={`flex gap-2.5 ${isMe ? "flex-row-reverse" : ""}`}
              >
                {!isMe && <Avatar user={msg.userId} />}
                <div
                  className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-0.5`}
                >
                  {!isMe && (
                    <span
                      className={`text-[10px] font-semibold ${
                        isDarkMode ? "text-slate-500" : "text-gray-400"
                      }`}
                    >
                      {msg.userId?.name || "User"}
                    </span>
                  )}
                  <div
                    className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? "rounded-tr-sm bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                        : isDarkMode
                        ? "rounded-tl-sm bg-white/10 text-slate-200"
                        : "rounded-tl-sm bg-gray-100 text-gray-800"
                    }`}
                  >
                    {msg.message}
                  </div>
                  <span
                    className={`text-[9px] ${
                      isDarkMode ? "text-slate-600" : "text-gray-300"
                    }`}
                  >
                    {formatTime(msg.sentAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className={`flex items-center gap-2 px-4 py-3 border-t flex-shrink-0 ${
          isDarkMode ? "border-white/10" : "border-gray-100"
        }`}
      >
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message…"
          disabled={sending}
          className={`flex-1 px-4 py-2 rounded-xl text-sm outline-none border transition-all ${
            isDarkMode
              ? "bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-blue-500/40"
              : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-300"
          }`}
          maxLength={500}
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-600 text-white disabled:opacity-50 hover:from-blue-500 hover:to-cyan-500 transition-all hover:scale-105"
        >
          {sending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}
