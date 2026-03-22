// pages/ExpertProfile.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { skillsApi } from "../services/skillsApi";
import api from "../utils/api";
import ExpertProfileHeader from "../components/ExpertProfileHeader";
import ExpertSkills from "../components/ExpertSkills";
import ExpertReviews from "../components/ExpertReviews";

const TABS = ["Overview", "Skills", "Reviews", "Portfolio"];

export default function ExpertProfile() {
  const { skillName, expertId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [actionLoading, setActionLoading] = useState("");

  const decoded = skillName ? decodeURIComponent(skillName) : null;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await skillsApi.getExpertProfile(expertId);
        setExpert(res.data?.data || null);
      } catch {
        setError("Failed to load expert profile.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [expertId]);

  const handleSendMessage = async () => {
    if (!expert) return;
    setActionLoading("message");
    try {
      const matchRes = await api.get(`/matches/check/${expert._id}`);
      if (matchRes.data.data?.exists && matchRes.data.data?.match?.status === "accepted") {
        const conversationRes = await api.get(
          `/chats/conversations/match/${matchRes.data.data.match._id}`
        );
        navigate("/chat", {
          state: {
            conversationId: conversationRes.data._id,
            userName: expert.name,
          },
        });
      } else {
        alert("Please wait for match approval before messaging!");
      }
    } catch {
      alert("Failed to start conversation. Please try again.");
    } finally {
      setActionLoading("");
    }
  };

  const handleSendMatch = async () => {
    if (!expert) return;
    setActionLoading("match");
    try {
      const currentUserRes = await api.get("/users/me");
      const currentUser = currentUserRes.data;

      const existingMatchRes = await api.get(`/matches/check/${expert._id}?t=${Date.now()}`);
      if (existingMatchRes.data?.data?.exists) {
        const { status } = existingMatchRes.data.data;
        if (status === "pending") { alert("Match request already sent!"); return; }
        if (status === "accepted") { alert("You are already matched with this user!"); return; }
      }

      const skillOffered = currentUser.teachSkills?.[0]?.name || "General Knowledge";
      const skillRequested = expert.teachSkills?.[0]?.name || decoded || "General Knowledge";

      await api.post("/matches", {
        receiverId: expert._id,
        message: `I'd like to learn ${skillRequested} and can teach ${skillOffered}`,
        skillsInvolved: [skillOffered, skillRequested],
      });

      alert("Match request sent successfully! 🎉");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to send match request");
    } finally {
      setActionLoading("");
    }
  };

  const handleViewReviews = () => {
    if (expert) navigate(`/user/${expert._id}/reviews`);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-gradient-to-br from-black via-gray-950 to-slate-950" : "bg-gradient-to-br from-slate-50 to-violet-50/30"}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse shadow-2xl shadow-violet-500/20">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
          <p className={`font-semibold ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
            Loading expert profile...
          </p>
        </div>
      </div>
    );
  }

  if (error || !expert) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-gradient-to-br from-black via-gray-950 to-slate-950" : "bg-gradient-to-br from-slate-50 to-violet-50/30"}`}>
        <div className={`text-center p-10 rounded-3xl border max-w-md ${isDarkMode ? "bg-gray-900/60 border-gray-800/60" : "bg-white shadow-xl border-gray-200"}`}>
          <div className="text-5xl mb-4">😕</div>
          <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Expert Not Found</h2>
          <p className={`text-sm mb-5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>{error || "The expert you're looking for doesn't exist."}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all duration-300"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const hasCertificates = expert.certificates && expert.certificates.length > 0;

  return (
    <div
      className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${
        isDarkMode
          ? "bg-gradient-to-br from-black via-gray-950 to-slate-950"
          : "bg-gradient-to-br from-slate-50 via-white to-violet-50/30"
      }`}
    >
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-60 -right-60 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-60 -left-60 w-[500px] h-[500px] bg-indigo-500/4 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Navigation breadcrumb */}
        <nav className="flex items-center gap-2 text-sm">
          <button
            onClick={() => navigate("/skills/explore")}
            className={`hover:text-violet-400 transition-colors ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
          >
            Skills & Experts
          </button>
          {decoded && (
            <>
              <svg className={`w-4 h-4 ${isDarkMode ? "text-slate-600" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <button
                onClick={() => navigate(-1)}
                className={`hover:text-violet-400 transition-colors ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
              >
                {decoded}
              </button>
            </>
          )}
          <svg className={`w-4 h-4 ${isDarkMode ? "text-slate-600" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className={`font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            {expert.name}
          </span>
        </nav>

        {/* Profile Header */}
        <ExpertProfileHeader
          expert={expert}
          onMessage={handleSendMessage}
          onMatch={handleSendMatch}
          skillName={decoded}
        />

        {/* Tab Navigation */}
        <div className={`flex gap-1 p-1 rounded-2xl border ${isDarkMode ? "bg-gray-900/60 border-gray-800/60 backdrop-blur-xl" : "bg-white/80 border-gray-200 shadow-sm backdrop-blur-xl"}`}>
          {TABS.filter(t => t !== "Portfolio" || hasCertificates).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === tab
                  ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/20"
                  : isDarkMode
                  ? "text-slate-400 hover:text-white hover:bg-gray-800/50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-gray-100/80"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "Overview" && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Rating", value: expert.rating > 0 ? expert.rating.toFixed(1) : "New", icon: "⭐", color: "from-amber-400 to-yellow-500" },
                { label: "Reviews", value: expert.reviewCount || 0, icon: "💬", color: "from-blue-400 to-cyan-500" },
                { label: "Skills", value: expert.teachSkills?.length || 0, icon: "🎓", color: "from-emerald-400 to-teal-500" },
                { label: "Available", value: expert.availability?.length > 0 ? "Yes" : "Ask", icon: "🕐", color: "from-violet-400 to-purple-500" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`rounded-2xl border p-5 text-center transition-all duration-300 hover:scale-105 ${
                    isDarkMode
                      ? "bg-gray-900/50 border-gray-800/60 backdrop-blur-xl"
                      : "bg-white/80 border-gray-200 shadow-md backdrop-blur-xl"
                  }`}
                >
                  <div className={`w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-lg shadow-lg`}>
                    {stat.icon}
                  </div>
                  <div className={`text-xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                  <div className={`text-xs font-medium mt-0.5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Bio Section */}
            {expert.bio && (
              <div className={`rounded-2xl border p-6 ${isDarkMode ? "bg-gray-900/50 backdrop-blur-xl border-gray-800/60" : "bg-white/80 backdrop-blur-xl border-gray-200 shadow-md"}`}>
                <h3 className={`font-bold text-lg mb-3 ${isDarkMode ? "text-white" : "text-slate-900"}`}>About</h3>
                <p className={`leading-relaxed ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>{expert.bio}</p>
              </div>
            )}

            {/* Expertise Info */}
            <div className={`rounded-2xl border p-6 ${isDarkMode ? "bg-gray-900/50 backdrop-blur-xl border-gray-800/60" : "bg-white/80 backdrop-blur-xl border-gray-200 shadow-md"}`}>
              <h3 className={`font-bold text-lg mb-4 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Expertise Details</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                  <p className={`text-[10px] uppercase font-bold mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Teaching Style</p>
                  <p className="text-sm text-emerald-500 font-semibold">{expert.teachingStyle || 'Not set'}</p>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                  <p className={`text-[10px] uppercase font-bold mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Learning Style</p>
                  <p className="text-sm text-teal-500 font-semibold">{expert.learningStyle || 'Not set'}</p>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                  <p className={`text-[10px] uppercase font-bold mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Experience</p>
                  <p className="text-sm text-blue-500 font-semibold">{expert.yearsOfExperience || 0} Years</p>
                </div>
                <div className={`p-4 rounded-xl border overflow-hidden ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                  <p className={`text-[10px] uppercase font-bold mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Languages</p>
                  <div className="flex flex-wrap gap-1.5">
                    {expert.languages?.length > 0 ? expert.languages.slice(0, 3).map(l => (
                      <span key={l} className={`text-[10px] px-2 py-1 rounded-md font-medium ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>{l}</span>
                    )) : <span className="text-sm text-slate-500">None</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Top Teaching Skills preview */}
            {expert.teachSkills && expert.teachSkills.length > 0 && (
              <div className={`rounded-2xl border p-6 ${isDarkMode ? "bg-gray-900/50 backdrop-blur-xl border-gray-800/60" : "bg-white/80 backdrop-blur-xl border-gray-200 shadow-md"}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-slate-900"}`}>Top Skills</h3>
                  <button
                    onClick={() => setActiveTab("Skills")}
                    className="text-violet-400 hover:text-violet-300 text-sm font-semibold transition-colors"
                  >
                    View All →
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {expert.teachSkills.slice(0, 6).map((sk, i) => (
                    <span
                      key={i}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                        sk.name.toLowerCase() === decoded?.toLowerCase()
                          ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                          : isDarkMode
                          ? "bg-gray-800/80 text-slate-300 border border-gray-700/50"
                          : "bg-gray-100 text-slate-700 border border-gray-200"
                      }`}
                    >
                      {sk.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Earned Badges Section */}
            {expert.gamificationBadges && expert.gamificationBadges.length > 0 && (
              <div className={`rounded-2xl border p-6 ${isDarkMode ? "bg-gray-900/50 backdrop-blur-xl border-gray-800/60" : "bg-white/80 backdrop-blur-xl border-gray-200 shadow-md"}`}>
                <div className="flex items-center gap-2 mb-4">
                   <span className="text-xl">🏅</span>
                   <h3 className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                    Earned Badges ({expert.gamificationBadges.length})
                  </h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {expert.gamificationBadges.map((badge, index) => (
                    <div
                      key={index}
                      title={badge.description}
                      className={`group flex items-center gap-3 px-4 py-2.5 backdrop-blur-sm border rounded-xl transition-all duration-300 hover:scale-105 ${
                        isDarkMode 
                          ? 'bg-gray-900/30 border-gray-800/25 hover:border-amber-500/30 hover:bg-gray-900/50' 
                          : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 hover:border-amber-400'
                      }`}
                    >
                      <span className="text-2xl filter drop-shadow-sm group-hover:scale-110 transition-transform">
                        {badge.icon}
                      </span>
                      <div>
                        <p className={`text-[11px] font-bold leading-none ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                          {badge.badgeName}
                        </p>
                        <p className={`text-[9px] uppercase font-semibold tracking-wider mt-0.5 ${isDarkMode ? 'text-amber-500/80' : 'text-amber-600'}`}>
                          {badge.category}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action CTA */}
            <div className={`rounded-2xl border p-6 bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-indigo-500/10 ${isDarkMode ? "border-violet-500/20" : "border-violet-200"}`}>
              <h3 className={`font-bold text-lg mb-1 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Ready to start learning?</h3>
              <p className={`text-sm mb-5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                Send a match request to {expert.name} and begin your skill exchange journey
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  id="btn-request-exchange"
                  onClick={handleSendMatch}
                  disabled={actionLoading === "match"}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-violet-500/25 disabled:opacity-50"
                >
                  {actionLoading === "match" ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : <span>🤝</span>}
                  Request Skill Exchange
                </button>
                <button
                  id="btn-start-chat"
                  onClick={handleSendMessage}
                  disabled={actionLoading === "message"}
                  className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 border disabled:opacity-50 ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700 text-white hover:border-violet-500/50"
                      : "bg-white border-gray-200 text-slate-700 hover:border-violet-400 shadow-sm"
                  }`}
                >
                  {actionLoading === "message" ? (
                    <div className={`w-4 h-4 border-2 border-t-violet-400 rounded-full animate-spin ${isDarkMode ? "border-gray-600" : "border-gray-200"}`} />
                  ) : <span>💬</span>}
                  Start Chat
                </button>
                <button
                  id="btn-view-reviews"
                  onClick={handleViewReviews}
                  className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 border ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700 text-slate-300 hover:border-amber-500/50 hover:text-amber-400"
                      : "bg-white border-gray-200 text-slate-700 hover:border-amber-400 shadow-sm"
                  }`}
                >
                  ⭐ View All Reviews
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Skills" && (
          <ExpertSkills expert={expert} highlightSkill={decoded} />
        )}

        {activeTab === "Reviews" && (
          <ExpertReviews
            reviews={expert.reviews || []}
            rating={expert.rating || 0}
            reviewCount={expert.reviewCount || 0}
          />
        )}

        {activeTab === "Portfolio" && hasCertificates && (
          <div className={`rounded-2xl border p-6 ${isDarkMode ? "bg-gray-900/50 backdrop-blur-xl border-gray-800/60" : "bg-white/80 backdrop-blur-xl border-gray-200 shadow-md"}`}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-lg">🏆</span>
              </div>
              <h3 className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                Portfolio & Certificates
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {expert.certificates.map((cert, i) => (
                <a
                  key={i}
                  href={cert.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative aspect-video rounded-xl overflow-hidden border transition-all duration-300 hover:scale-105 ${
                    isDarkMode ? "border-gray-700 hover:border-amber-500/40" : "border-gray-200 hover:border-amber-400"
                  }`}
                >
                  {cert.fileType === "image" ? (
                    <img src={cert.fileUrl} alt={cert.fileName} className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full flex flex-col items-center justify-center gap-1 ${isDarkMode ? "bg-gray-800" : "bg-amber-50"}`}>
                      <span className="text-3xl">📄</span>
                      <span className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                        {cert.fileName || "Document"}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">Open ↗</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
