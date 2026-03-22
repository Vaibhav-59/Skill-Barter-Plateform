const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:5000";

const COLORS = ["from-cyan-500 to-blue-600", "from-violet-500 to-purple-600", "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600", "from-amber-500 to-orange-600"];

function ExpertAvatar({ expert, index }) {
  const imgSrc = expert.profileImage
    ? expert.profileImage.startsWith("http") ? expert.profileImage : `${BASE_URL}${expert.profileImage}`
    : null;
  const grad = COLORS[index % COLORS.length];
  return (
    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center flex-shrink-0 shadow-lg`}>
      {imgSrc ? (
        <img src={imgSrc} alt={expert.name} className="w-full h-full rounded-2xl object-cover" />
      ) : (
        <span className="text-white font-bold text-lg">{expert.name?.charAt(0)?.toUpperCase() || "?"}</span>
      )}
    </div>
  );
}

export default function SuggestedExperts({ experts, pathSkills }) {
  if (!experts || experts.length === 0) return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-10 text-center">
      <div className="relative inline-block mb-4">
        <div className="text-5xl">👥</div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs">🔍</div>
      </div>
      <h3 className="text-white font-bold mb-1">No experts found yet</h3>
      <p className="text-slate-400 text-sm max-w-xs mx-auto">
        As more users join and list their skills, suggested mentors will appear here.
      </p>
    </div>
  );

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-white/[0.06] bg-gradient-to-r from-cyan-500/8 to-blue-500/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-white">Suggested Experts</h3>
            <p className="text-xs text-slate-400">{experts.length} experts matching your path skills</p>
          </div>
        </div>
      </div>

      {/* Expert cards */}
      <div className="divide-y divide-white/[0.04]">
        {experts.map((expert, index) => {
          const matchedSkills = (expert.skillsOffered || [])
            .filter((s) => pathSkills.some((ps) =>
              ps.toLowerCase().includes(s.name?.toLowerCase()) ||
              s.name?.toLowerCase().includes(ps.toLowerCase())
            )).slice(0, 3);

          return (
            <div key={expert._id}
              className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition-all group/expert"
            >
              <ExpertAvatar expert={expert} index={index} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold text-sm truncate">{expert.name}</p>
                  {expert.rating && (
                    <span className="flex-shrink-0 text-xs text-amber-400 flex items-center gap-0.5">
                      ⭐ {Number(expert.rating).toFixed(1)}
                    </span>
                  )}
                </div>
                {matchedSkills.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-1">
                    {matchedSkills.map((s, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                        {s.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button className="flex-shrink-0 w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-500 group-hover/expert:bg-cyan-500/10 group-hover/expert:border-cyan-500/20 group-hover/expert:text-cyan-400 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/[0.05] text-center">
        <p className="text-xs text-slate-500">Connect with these experts to learn faster through skill exchange</p>
      </div>
    </div>
  );
}
