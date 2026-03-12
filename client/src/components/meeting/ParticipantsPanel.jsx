export default function ParticipantsPanel({ participants, onClose }) {
  return (
    <div className="flex flex-col h-full w-80 bg-gray-950/95 backdrop-blur-xl border-l border-white/10">
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
        <h3 className="text-white font-semibold text-sm">
          Participants ({participants.length})
        </h3>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {participants.map((p, i) => (
          <div 
            key={p.id || i} 
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-800/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {p.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {p.isLocal ? `${p.name} (You)` : p.name}
              </p>
              {p.isHost && (
                <p className="text-slate-500 text-xs">Host</p>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {p.isMuted && (
                <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </div>
              )}
              {p.isCamOff && (
                <div className="w-6 h-6 bg-gray-700/50 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8M3 8v8a2 2 0 002 2h8" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 2px; }
      `}</style>
    </div>
  );
}
