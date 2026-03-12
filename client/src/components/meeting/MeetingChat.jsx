import { useState, useEffect, useRef } from "react";

const STORAGE_KEY_PREFIX = "meetingChat_";

export default function MeetingChat({ socket, meetingId, userName, onClose }) {
  const [messages, setMessages] = useState(() => {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${meetingId}`);
    return stored ? JSON.parse(stored) : [];
  });
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${meetingId}`, JSON.stringify(messages));
  }, [messages, meetingId]);

  useEffect(() => {
    if (!socket) return;

    const handler = ({ from, text, timestamp }) => {
      const newMessage = { from, text, timestamp, own: false };
      setMessages((prev) => [...prev, newMessage]);
    };

    socket.on("meetingChat", handler);
    return () => socket.off("meetingChat", handler);
  }, [socket]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const msg = { from: userName, text: input.trim(), timestamp: Date.now(), own: true };
    setMessages((prev) => [...prev, msg]);
    socket?.emit("meetingChat", { meetingId, from: userName, text: input.trim(), timestamp: msg.timestamp });
    setInput("");
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full w-80 bg-gray-950/95 backdrop-blur-xl border-l border-white/10">
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
        <h3 className="text-white font-semibold text-sm">Meeting Chat</h3>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {messages.length === 0 && (
          <p className="text-slate-500 text-xs text-center mt-8">
            No messages yet. Say hello!
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.own ? "items-end" : "items-start"}`}>
            {!m.own && (
              <span className="text-xs text-emerald-400 font-medium mb-1">{m.from}</span>
            )}
            <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
              m.own
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-br-sm"
                : "bg-gray-800/80 text-white rounded-bl-sm"
            }`}>
              {m.text}
            </div>
            <span className="text-xs text-slate-600 mt-0.5">
              {formatTime(m.timestamp)}
            </span>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="p-3 border-t border-white/10">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-800/60 border border-gray-700/40 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-9 h-9 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 shadow-lg shadow-emerald-500/20 flex-shrink-0"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 2px; }
      `}</style>
    </div>
  );
}
