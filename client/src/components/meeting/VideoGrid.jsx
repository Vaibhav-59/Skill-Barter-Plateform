import VideoCard from "./VideoCard";

/**
 * Returns CSS grid-template-columns for N tiles (mirrors Google Meet layout).
 */
function getGridStyle(total) {
  if (total === 1) return { gridTemplateColumns: "1fr" };
  if (total === 2) return { gridTemplateColumns: "1fr 1fr" };
  if (total <= 4)  return { gridTemplateColumns: "1fr 1fr" };
  if (total <= 6)  return { gridTemplateColumns: "1fr 1fr 1fr" };
  return { gridTemplateColumns: "1fr 1fr 1fr 1fr" };
}

/**
 * VideoGrid
 *
 * Props:
 *   localStream        – MediaStream from local camera/mic
 *   localName          – Display name for local user
 *   isMuted            – Local mic state
 *   isCamOff           – Local camera state
 *   isScreenSharing    – True when LOCAL user is sharing their screen
 *   screenStream       – The local screen-capture MediaStream (or null)
 *   remoteParticipants – Array of peer objects from MeetingRoom state
 *                        Each peer: { socketId, userName, stream, isMuted,
 *                                     isCamOff, isScreenSharing }
 */
export default function VideoGrid({
  localStream,
  localName,
  isMuted,
  isCamOff,
  isScreenSharing,
  screenStream,
  remoteParticipants,
}) {
  // ── Decide which layout variant to use ─────────────────────────────────────
  //
  // Priority:
  //   1. LOCAL screen share  → big main tile (screenStream) + side strip of cams
  //   2. REMOTE screen share → featured tile (remote's video) + side strip
  //   3. No screen share     → standard tiled grid

  const remoteSharer = remoteParticipants.find((p) => p.isScreenSharing);

  // ── Build "all cam tiles" list (used by side strips) ──────────────────────
  const allCamTiles = [
    {
      key: "local",
      stream: localStream,
      name: localName,
      isMuted,
      // When local is screen sharing, their cam tile shows cam (or avatar)
      isCamOff: isScreenSharing ? false : isCamOff,
      isLocal: true,
      isScreenShare: false,
    },
    ...remoteParticipants.map((p) => ({
      key: p.socketId,
      stream: p.stream || null,
      name: p.userName,
      isMuted: p.isMuted || false,
      /**
       * KEY FIX (Bug 2):
       * When a remote participant is screen sharing, their video track has been
       * replaced with the screen content via replaceTrack(). However, if their
       * isCamOff flag is still true (they had cam off before sharing), the
       * VideoCard would render the "Camera off" avatar instead of the video.
       *
       * Fix: override isCamOff to FALSE when isScreenSharing is true.
       * This ensures the <video> element renders and displays the screen share.
       */
      isCamOff: p.isScreenSharing ? false : (
        p.isCamOff !== undefined
          ? p.isCamOff
          : (!p.stream || p.stream.getVideoTracks().length === 0)
      ),
      isLocal: false,
      isScreenShare: p.isScreenSharing || false,
    })),
  ];

  // ── Layout 1: LOCAL user sharing screen ───────────────────────────────────
  if (isScreenSharing && screenStream) {
    return (
      <div className="w-full h-full flex gap-2 p-3 overflow-hidden">
        {/* Big screen share tile */}
        <div className="flex-[4] min-w-0 min-h-0">
          <VideoCard
            stream={screenStream}
            name={localName}
            isMuted={false}
            isCamOff={false}
            isLocal={false}
            isScreenShare
          />
        </div>

        {/* Side strip: all cam tiles (including local cam) */}
        <div
          className="flex flex-col gap-2 overflow-y-auto overflow-x-hidden flex-shrink-0"
          style={{ width: "13rem" }}
        >
          {allCamTiles.map((t) => (
            <div key={t.key} className="flex-shrink-0" style={{ aspectRatio: "16/9" }}>
              <VideoCard
                stream={t.stream}
                name={t.name}
                isMuted={t.isMuted}
                isCamOff={t.isCamOff}
                isLocal={t.isLocal}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Layout 2: REMOTE participant sharing screen ────────────────────────────
  if (remoteSharer) {
    // Remove the sharer from the side strip (they're the featured tile)
    const sideTiles = allCamTiles.filter((t) => t.key !== remoteSharer.socketId);

    return (
      <div className="w-full h-full flex gap-2 p-3 overflow-hidden">
        {/* Big featured tile – remote screen share */}
        <div className="flex-[4] min-w-0 min-h-0">
          {/* isCamOff forced false: screen sharer's video track is the screen content */}
          <VideoCard
            stream={remoteSharer.stream}
            name={remoteSharer.userName}
            isMuted={remoteSharer.isMuted || false}
            isCamOff={false}
            isLocal={false}
            isScreenShare
          />
        </div>

        {/* Side strip: everyone else */}
        <div
          className="flex flex-col gap-2 overflow-y-auto overflow-x-hidden flex-shrink-0"
          style={{ width: "13rem" }}
        >
          {sideTiles.map((t) => (
            <div key={t.key} className="flex-shrink-0" style={{ aspectRatio: "16/9" }}>
              <VideoCard
                stream={t.stream}
                name={t.name}
                isMuted={t.isMuted}
                isCamOff={t.isCamOff}
                isLocal={t.isLocal}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Layout 3: Normal tiled grid ───────────────────────────────────────────
  const total     = allCamTiles.length;
  const gridStyle = getGridStyle(total);

  return (
    <div
      className="w-full h-full p-3 overflow-hidden"
      style={{
        display: "grid",
        gap: "10px",
        alignContent: "stretch",
        ...gridStyle,
      }}
    >
      {allCamTiles.map((t) => (
        <VideoCard
          key={t.key}
          stream={t.stream}
          name={t.name}
          isMuted={t.isMuted}
          isCamOff={t.isCamOff}
          isLocal={t.isLocal}
          isScreenShare={t.isScreenShare}
        />
      ))}
    </div>
  );
}
