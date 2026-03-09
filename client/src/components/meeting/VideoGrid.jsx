import { useEffect, useRef } from "react";

/**
 * ParticipantTile
 * Renders a single video tile for one meeting participant.
 * stream  – MediaStream (or null for remote tiles that haven't connected yet)
 * name    – display name
 * isMuted – show muted mic badge
 * isCamOff – show camera-off placeholder
 * isLocal – mirror the video for the local user
 * isScreenShare – wider badge style
 */
function ParticipantTile({ stream, name, isMuted, isCamOff, isLocal, isScreenShare }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center aspect-video shadow-xl border border-white/5 group transition-all duration-300 hover:border-emerald-500/30 hover:shadow-emerald-500/10">
      {/* Video element */}
      {stream && !isCamOff ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={`w-full h-full object-cover ${isLocal ? "scale-x-[-1]" : ""}`}
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 w-full h-full bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg text-white font-bold text-2xl">
            {name?.[0]?.toUpperCase() || "?"}
          </div>
          <span className="text-slate-400 text-sm font-medium">
            {isCamOff ? "Camera off" : "Connecting..."}
          </span>
        </div>
      )}

      {/* Bottom gradient overlay */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent" />

      {/* Name badge */}
      <div className="absolute bottom-2 left-3 flex items-center gap-2">
        <span className="text-white text-xs font-semibold drop-shadow-lg">
          {isLocal ? `${name} (You)` : name}
        </span>
        {isScreenShare && (
          <span className="text-xs bg-blue-500/80 text-white px-1.5 py-0.5 rounded-full font-medium">
            Screen
          </span>
        )}
      </div>

      {/* Muted badge */}
      {isMuted && (
        <div className="absolute top-2 right-2 w-7 h-7 bg-red-500/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow">
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        </div>
      )}

      {/* Speaking indicator ring */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-[:has(video:not([muted])):focus-within]:border-emerald-400/60 transition-colors duration-300 pointer-events-none" />
    </div>
  );
}

/**
 * VideoGrid
 * Responsive grid that adapts columns based on participant count.
 */
export default function VideoGrid({
  localStream,
  localName,
  isMuted,
  isCamOff,
  screenStream,
  remoteParticipants, // [{ socketId, userId, userName, stream }]
}) {
  const total = 1 + (screenStream ? 1 : 0) + remoteParticipants.length;

  // Responsive column count
  const gridCols =
    total === 1 ? "grid-cols-1" :
    total === 2 ? "grid-cols-1 md:grid-cols-2" :
    total <= 4  ? "grid-cols-2" :
    total <= 6  ? "grid-cols-2 lg:grid-cols-3" :
                  "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  return (
    <div className={`grid ${gridCols} gap-3 w-full h-full p-3 auto-rows-fr`}>
      {/* Screen share tile (spans full width if it exists) */}
      {screenStream && (
        <div className={total > 2 ? "col-span-2 lg:col-span-3" : ""}>
          <ParticipantTile
            stream={screenStream}
            name={localName}
            isMuted={false}
            isCamOff={false}
            isLocal={false}
            isScreenShare
          />
        </div>
      )}

      {/* Local tile */}
      <ParticipantTile
        stream={localStream}
        name={localName}
        isMuted={isMuted}
        isCamOff={isCamOff}
        isLocal
      />

      {/* Remote tiles */}
      {remoteParticipants.map((p) => (
        <ParticipantTile
          key={p.socketId}
          stream={p.stream || null}
          name={p.userName}
          isMuted={false}
          isCamOff={!p.stream}
          isLocal={false}
        />
      ))}
    </div>
  );
}
