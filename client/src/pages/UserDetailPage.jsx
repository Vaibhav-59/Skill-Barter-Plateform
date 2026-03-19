import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useTheme } from "../hooks/useTheme";
import VerificationBadge from "../components/verification/VerificationBadge";

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode, bgClass, textClass, cardClass, borderClass } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleFileDownload = async (url, defaultFilename) => {
    try {
      let filename = defaultFilename || "Document";
      if (!filename.toLowerCase().endsWith(".pdf")) {
        filename += ".pdf";
      }

      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error("Download failed via fetch, falling back to new tab:", err);
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/users/${id}`);
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, navigate]);

  const handleSendMessage = async () => {
    try {
      // First check if there's an existing match between users
      const matchRes = await api.get(`/matches/check/${user._id}`);

      if (matchRes.data.data?.exists && matchRes.data.data?.match) {
        const match = matchRes.data.data.match;

        // Check if match is accepted
        if (match.status !== "accepted") {
          alert("Please wait for match approval before messaging!");
          return;
        }

        // If match exists and is accepted, get or create conversation
        const conversationRes = await api.get(
          `/chats/conversations/match/${match._id}`
        );
        navigate("/chat", {
          state: {
            conversationId: conversationRes.data._id,
            userName: user.name,
          },
        });
      } else {
        alert("Please wait for match approval before messaging!");
      }
    } catch (err) {
      console.error("Failed to initiate chat:", err);
      alert("Failed to start conversation. Please try again.");
    }
  };

  const handleSendMatchRequest = async () => {
    try {
      // Get current user to determine skills
      const currentUserRes = await api.get("/users/me");
      const currentUser = currentUserRes.data;

      console.log("Current user:", currentUser._id);
      console.log("Target user:", user._id);

      // Check if match request already exists (any status)
      // Add cache busting with timestamp
      const existingMatchRes = await api.get(
        `/matches/check/${user._id}?t=${Date.now()}`
      );
      console.log("Existing match response:", existingMatchRes.data);

      // FIXED: Check the data structure properly
      if (
        existingMatchRes.data &&
        existingMatchRes.data.data &&
        existingMatchRes.data.data.exists
      ) {
        const { status } = existingMatchRes.data.data;

        console.log("Match exists");
        console.log("Match status:", status);

        switch (status) {
          case "pending":
            alert("Match request already sent! Please wait for confirmation.");
            return;
          case "accepted":
            alert("You are already matched with this user!");
            return;
          case "rejected":
            console.log("Previous match was rejected, allowing new request");
            break;
          default:
            console.log("Unknown status:", status);
        }
      }

      // Find matching skills between users
      const skillOffered =
        currentUser.teachSkills?.[0]?.name || "General Knowledge";
      const skillRequested = user.teachSkills?.[0]?.name || "General Knowledge";

      console.log("Sending match request with:", {
        receiverId: user._id,
        message: `I'd like to learn ${skillRequested} and can teach ${skillOffered}`,
        skillsInvolved: [skillOffered, skillRequested],
      });

      const matchResponse = await api.post("/matches", {
        receiverId: user._id,
        message: `I'd like to learn ${skillRequested} and can teach ${skillOffered}`,
        skillsInvolved: [skillOffered, skillRequested],
      });

      console.log("Match request sent successfully:", matchResponse.data);
      alert("Match request sent!");
    } catch (err) {
      console.error("Match request error:", err);
      console.error("Error response:", err.response?.data);

      if (err.response?.data?.error) {
        alert(err.response.data.error);
      } else {
        alert("Failed to send match request");
      }
    }
  };

  const handleViewReviews = () => {
    navigate(`/user/${user._id}/reviews`);
  };

  if (loading) {
    return (
      <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-gradient-to-br from-black via-gray-950 to-slate-950' : 'bg-gradient-to-br from-slate-50 via-white to-emerald-50/50'}`}>
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-green-500/4 rounded-full blur-3xl animate-pulse delay-1000"></div>
          
          {/* Floating particles */}
          <div className="absolute top-20 left-20 w-3 h-3 bg-emerald-400/30 rounded-full animate-ping shadow-lg shadow-emerald-400/15"></div>
          <div className="absolute top-40 right-32 w-2 h-2 bg-green-400/35 rounded-full animate-ping delay-1000 shadow-lg shadow-green-400/15"></div>
          <div className="absolute bottom-32 left-1/3 w-2.5 h-2.5 bg-teal-400/25 rounded-full animate-ping delay-2000 shadow-lg shadow-teal-400/15"></div>
        </div>

        <div className="relative z-10 flex justify-center items-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse shadow-2xl shadow-emerald-500/10">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
            <div className={`text-xl font-semibold bg-clip-text text-transparent pb-4 ${isDarkMode ? 'bg-gradient-to-r from-white via-gray-100 to-slate-200' : 'bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700'}`}>
              Loading user details...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-gradient-to-br from-black via-gray-950 to-slate-950' : 'bg-gradient-to-br from-slate-50 via-white to-emerald-50/50'}`}>
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-green-500/4 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 text-center py-12 px-4">
          <div className={`max-w-md mx-auto backdrop-blur-xl rounded-3xl p-12 shadow-2xl ${isDarkMode ? 'bg-gray-950/40 border border-gray-800/40' : 'bg-white/80 border border-gray-200'}`}>
            <div className="w-20 h-20 bg-gradient-to-r from-red-400/20 via-red-500/15 to-red-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className={`text-2xl font-bold bg-clip-text text-transparent mb-4 ${isDarkMode ? 'bg-gradient-to-r from-white to-slate-200' : 'bg-gradient-to-r from-gray-800 to-slate-900'}`}>User not found</div>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-500 hover:via-green-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-emerald-500/15"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-gradient-to-br from-black via-gray-950 to-slate-950' : 'bg-gradient-to-br from-slate-50 via-white to-emerald-50/50'}`}>
      {/* Enhanced Background Effects - Reduced Lighting */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-green-500/4 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-teal-600/3 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-3 h-3 bg-emerald-400/30 rounded-full animate-ping shadow-lg shadow-emerald-400/15"></div>
        <div className="absolute top-40 right-32 w-2 h-2 bg-green-400/35 rounded-full animate-ping delay-1000 shadow-lg shadow-green-400/15"></div>
        <div className="absolute bottom-32 left-1/3 w-2.5 h-2.5 bg-teal-400/25 rounded-full animate-ping delay-2000 shadow-lg shadow-teal-400/15"></div>
        <div className="absolute top-1/2 right-20 w-2 h-2 bg-emerald-300/20 rounded-full animate-ping delay-3000 shadow-lg shadow-emerald-300/10"></div>
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/2 to-transparent animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-gray-950/50"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Back Button */}
        {/* <button
          onClick={() => navigate("/dashboard")}
          className="group flex items-center gap-3 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 hover:from-emerald-500 hover:via-green-600 hover:to-teal-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-emerald-500/20"
        >
          <div className="w-6 h-6 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <span>Back to Discovery</span>
        </button> */}

        {/* User Profile Header */}
        <div className={`${isDarkMode ? 'bg-gray-950/25 border-gray-800/30' : 'bg-white/60 border-emerald-100'} backdrop-blur-xl border rounded-3xl shadow-2xl p-8 relative overflow-hidden transition-colors duration-300`}>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/2 via-green-500/1 to-teal-600/2 rounded-3xl opacity-40"></div>
          
          <div className="relative flex flex-col lg:flex-row items-center lg:items-start gap-8">
            {/* Profile Picture */}
            <div className="relative group">
              <div className="w-32 h-32 bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 rounded-3xl flex items-center justify-center text-white text-4xl font-bold shadow-2xl shadow-emerald-500/15 transform group-hover:scale-105 transition-all duration-300 overflow-hidden">
                {user.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.name?.charAt(0)?.toUpperCase() || "U"
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-400 rounded-2xl border-4 border-gray-950 animate-pulse shadow-lg shadow-emerald-400/20"></div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className={`text-4xl font-black bg-clip-text text-transparent mb-2 ${isDarkMode ? 'bg-gradient-to-r from-white via-gray-100 to-slate-200' : 'bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-950'}`}>
                {user.name || "Anonymous User"}
              </h1>
              
              {user.role && (
                <div className="text-xl font-medium text-emerald-400 mb-4 tracking-wide">
                  {user.role}
                </div>
              )}

              <div className={`flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm font-medium mb-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {user.location && (user.location.city || user.location.country || typeof user.location === 'string') && (
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm ${isDarkMode ? 'bg-gray-900/40 border-gray-800/50' : 'bg-emerald-50/80 border-emerald-200/50'}`}>
                    <span className="text-emerald-500">📍</span>
                    <span>
                      {typeof user.location === 'string' 
                        ? user.location 
                        : [user.location.city, user.location.country].filter(Boolean).join(", ")}
                    </span>
                  </div>
                )}
                
                {user.experienceLevel && (
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm capitalize ${isDarkMode ? 'bg-gray-900/40 border-gray-800/50' : 'bg-orange-50/80 border-orange-200/50'}`}>
                    <span className="text-orange-500">🏆</span>
                    <span>{user.experienceLevel} Level</span>
                  </div>
                )}
              </div>

              {user.bio && (
                <div className={`backdrop-blur-sm border rounded-2xl p-6 ${isDarkMode ? 'bg-gray-900/30 border-gray-800/25' : 'bg-emerald-50/40 border-emerald-100/50'}`}>
                  <p className={`leading-relaxed text-lg ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{user.bio}</p>
                </div>
              )}

              {/* Showcase Video Section */}
              {user.skillShowcaseVideo && (
                <div className={`mt-6 backdrop-blur-sm border rounded-2xl p-6 overflow-hidden ${isDarkMode ? 'bg-gray-900/30 border-emerald-500/30' : 'bg-emerald-50/40 border-emerald-500/30'}`}>
                  <h4 className={`text-sm font-semibold uppercase tracking-widest mb-4 flex items-center gap-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    <span>🎥</span> Showcase Video
                  </h4>
                  <div className="rounded-xl overflow-hidden bg-black/60 relative flex items-center justify-center">
                    <video 
                      src={user.skillShowcaseVideo} 
                      className="w-full h-auto max-h-[30rem] object-contain" 
                      controls
                    />
                  </div>
                </div>
              )}

              {/* Expertise Info */}
              <div className={`mt-6 backdrop-blur-sm border rounded-2xl p-6 ${isDarkMode ? 'bg-gray-900/30 border-gray-800/25' : 'bg-white/40 border-gray-200'}`}>
                <h4 className={`text-sm font-semibold uppercase tracking-widest mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Expertise Details</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                    <p className={`text-[10px] uppercase font-bold mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Teaching Style</p>
                    <p className="text-sm text-emerald-500 font-semibold">{user.teachingStyle || 'Not set'}</p>
                  </div>
                  <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                    <p className={`text-[10px] uppercase font-bold mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Learning Style</p>
                    <p className="text-sm text-teal-500 font-semibold">{user.learningStyle || 'Not set'}</p>
                  </div>
                  <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                    <p className={`text-[10px] uppercase font-bold mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Experience</p>
                    <p className="text-sm text-blue-500 font-semibold">{user.yearsOfExperience || 0} Years</p>
                  </div>
                  <div className={`p-4 rounded-xl border overflow-hidden ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                    <p className={`text-[10px] uppercase font-bold mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Languages</p>
                    <div className="flex flex-wrap gap-1.5">
                      {user.languages?.length > 0 ? user.languages.slice(0, 3).map(l => (
                        <span key={l} className={`text-[10px] px-2 py-1 rounded-md font-medium ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>{l}</span>
                      )) : <span className="text-sm text-slate-500">None</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              {(user.linkedinUrl || user.githubUrl || user.twitterUrl || user.portfolioUrl) && (
                <div className={`mt-6 backdrop-blur-sm border rounded-2xl p-6 ${isDarkMode ? 'bg-gray-900/30 border-gray-800/25' : 'bg-white/40 border-gray-200'}`}>
                  <h4 className={`text-sm font-semibold uppercase tracking-widest mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Public Profiles</h4>
                  <div className="flex flex-wrap gap-4">
                    {user.linkedinUrl && (
                      <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/30 rounded-xl text-blue-500 transition-all hover:scale-110 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.238 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                        <span className="text-sm font-medium">LinkedIn</span>
                      </a>
                    )}
                    {user.githubUrl && (
                      <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" className={`p-3 hover:bg-slate-600/20 border rounded-xl transition-all hover:scale-110 flex items-center gap-2 ${isDarkMode ? 'bg-slate-600/10 border-slate-600/30 text-slate-300' : 'bg-slate-200 border-slate-300 text-slate-700'}`}>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                        <span className="text-sm font-medium">GitHub</span>
                      </a>
                    )}
                    {user.twitterUrl && (
                      <a href={user.twitterUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-sky-400/10 hover:bg-sky-400/20 border border-sky-400/30 rounded-xl text-sky-500 transition-all hover:scale-110 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                        <span className="text-sm font-medium">Twitter / X</span>
                      </a>
                    )}
                    {user.portfolioUrl && (
                      <a href={user.portfolioUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-500 transition-all hover:scale-110 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                        <span className="text-sm font-medium">Portfolio</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Action Buttons */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
            <button
              onClick={handleSendMessage}
              className="group relative bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 hover:from-emerald-500 hover:via-green-600 hover:to-teal-700 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-emerald-500/15 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="relative flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Send Message
              </div>
            </button>

            <button
              onClick={handleSendMatchRequest}
              className={`group relative backdrop-blur-sm border text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg overflow-hidden ${
                isDarkMode 
                  ? 'bg-gray-900/50 border-gray-800/30 hover:border-emerald-400/20 hover:bg-gray-900/70' 
                  : 'bg-emerald-600/90 border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-700'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-emerald-400/5 to-emerald-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                </svg>
                Send Match Request
              </div>
            </button>

            <button
              onClick={handleViewReviews}
              className={`group relative backdrop-blur-sm border text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg overflow-hidden ${
                isDarkMode 
                  ? 'bg-gray-900/50 border-gray-800/30 hover:border-yellow-400/20 hover:bg-gray-900/70' 
                  : 'bg-yellow-500/90 border-yellow-400/30 hover:border-yellow-500/50 hover:bg-yellow-600'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/5 to-yellow-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                View Reviews
              </div>
            </button>
          </div>
        </div>

        {/* Skills Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Teaching Skills */}
          <div className={`group backdrop-blur-xl border rounded-3xl shadow-xl p-8 transition-all duration-300 relative overflow-hidden ${
            isDarkMode 
              ? 'bg-gray-950/25 border-gray-800/30 hover:bg-gray-950/40 hover:border-emerald-400/10' 
              : 'bg-white/60 border-emerald-100 hover:bg-white/80 hover:border-emerald-200'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-emerald-400/2 to-emerald-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Can Teach</h3>
              </div>

              {user.teachSkills && user.teachSkills.length > 0 ? (
                <div className="space-y-4">
                  {user.teachSkills.map((skill, index) => (
                    <div
                      key={index}
                      className={`group/skill flex justify-between items-center p-4 backdrop-blur-sm border rounded-2xl transition-all duration-300 transform hover:scale-102 ${
                        isDarkMode 
                          ? 'bg-gray-900/30 border-gray-800/25 hover:bg-gray-900/50 hover:border-emerald-400/15' 
                          : 'bg-emerald-50/50 border-emerald-100 hover:bg-emerald-100/50 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-lg transition-colors duration-300 ${isDarkMode ? 'text-white group-hover/skill:text-emerald-300' : 'text-slate-700 group-hover/skill:text-emerald-700'}`}>
                          {skill.name}
                        </span>
                        {user.verifiedSkills?.some((v) => v.toLowerCase() === skill.name.toLowerCase()) && <VerificationBadge size="sm" />}
                      </div>
                      <span className="px-4 py-2 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/10">
                        {skill.level}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg ${isDarkMode ? 'bg-gradient-to-r from-gray-700/50 via-gray-600/40 to-gray-700/50' : 'bg-gray-100'}`}>
                    <svg className={`w-8 h-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <p className={`text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>No teaching skills listed</p>
                </div>
              )}
            </div>
          </div>

          {/* Learning Skills */}
          <div className={`group backdrop-blur-xl border rounded-3xl shadow-xl p-8 transition-all duration-300 relative overflow-hidden ${
            isDarkMode 
              ? 'bg-gray-950/25 border-gray-800/30 hover:bg-gray-950/40 hover:border-blue-400/10' 
              : 'bg-white/60 border-blue-100 hover:bg-white/80 hover:border-blue-200'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/2 to-blue-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/10">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Wants to Learn</h3>
              </div>

              {user.learnSkills && user.learnSkills.length > 0 ? (
                <div className="space-y-4">
                  {user.learnSkills.map((skill, index) => (
                    <div
                      key={index}
                      className={`group/skill flex justify-between items-center p-4 backdrop-blur-sm border rounded-2xl transition-all duration-300 transform hover:scale-102 ${
                        isDarkMode 
                          ? 'bg-gray-900/30 border-gray-800/25 hover:bg-gray-900/50 hover:border-blue-400/15'
                          : 'bg-blue-50/50 border-blue-100 hover:bg-blue-100/50 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-lg transition-colors duration-300 ${isDarkMode ? 'text-white group-hover/skill:text-blue-300' : 'text-slate-700 group-hover/skill:text-blue-700'}`}>
                          {skill.name}
                        </span>
                        {user.verifiedSkills?.some((v) => v.toLowerCase() === skill.name.toLowerCase()) && <VerificationBadge size="sm" />}
                      </div>
                      <span className="px-4 py-2 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/10">
                        {skill.level}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg ${isDarkMode ? 'bg-gradient-to-r from-gray-700/50 via-gray-600/40 to-gray-700/50' : 'bg-gray-100'}`}>
                    <svg className={`w-8 h-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <p className={`text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>No learning goals listed</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Availability */}
        {user.availability && user.availability.length > 0 && (
          <div className={`${isDarkMode ? 'bg-gray-950/25 border-gray-800/30' : 'bg-white/60 border-purple-100'} backdrop-blur-xl border rounded-3xl shadow-xl p-8 relative overflow-hidden transition-colors duration-300`}>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-purple-400/2 to-purple-400/0 opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/10">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Availability</h3>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {user.availability.map((time, index) => (
                  <span
                    key={index}
                    className={`group px-4 py-3 backdrop-blur-sm border rounded-2xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                      isDarkMode 
                        ? 'bg-gray-900/30 border-gray-800/25 hover:border-purple-400/15 text-purple-300 hover:text-purple-200 hover:bg-gray-900/50' 
                        : 'bg-purple-50/80 border-purple-200 hover:border-purple-300 text-purple-700 hover:text-purple-800 hover:bg-purple-100/80'
                    }`}
                  >
                    {time}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Skill Certificates */}
        {(() => {
          // Gather certificates from both old and new format
          const newCerts = user?.certificates || [];
          const oldCerts = (user?.skillCertificates || []).filter(c => c && typeof c === 'string' && c.trim());
          // Normalize: convert old certs to objects
          const normalizedOld = oldCerts.map(url => ({
            fileUrl: url,
            fileType: /\.(jpg|jpeg|png|gif|webp)$/i.test(url) ? 'image' : 'pdf',
            fileName: url.split('/').pop() || 'Certificate',
          }));
          // Merge, preferring new format, deduplicated by URL
          const seen = new Set();
          const allCerts = [...newCerts, ...normalizedOld].filter(c => {
            if (!c?.fileUrl || seen.has(c.fileUrl)) return false;
            seen.add(c.fileUrl);
            return true;
          });

          if (allCerts.length === 0) return null;

          return (
          <div className={`${isDarkMode ? 'bg-gray-950/25 border-gray-800/30' : 'bg-white/60 border-amber-100'} backdrop-blur-xl border rounded-3xl shadow-xl p-8 relative overflow-hidden transition-colors duration-300`}>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-400/2 to-amber-400/0 opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/10">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Skill Certificates ({allCerts.length})</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {allCerts.map((cert, index) => {
                  const isPdf = cert.fileType === 'pdf' || cert.fileType === 'document';
                  const isImage = cert.fileType === 'image';
                  const fileName = cert.fileName || `Certificate ${index + 1}`;
                  
                  return (
                    <div
                      key={index}
                      className={`group relative backdrop-blur-sm border rounded-2xl overflow-hidden hover:border-amber-400/15 transition-all duration-300 transform hover:scale-105 ${
                        isDarkMode ? 'bg-gray-900/30 border-gray-800/25' : 'bg-amber-50/50 border-amber-200/50'
                      }`}
                    >
                      {isPdf ? (
                        <div
                          onClick={() => handleFileDownload(cert.fileUrl, fileName)}
                          role="button"
                          className="flex flex-col items-center justify-center h-32 cursor-pointer hover:bg-gray-800/40 transition-colors"
                        >
                          <svg className="w-16 h-16 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs text-slate-400 mt-2 hover:text-red-400 transition-colors flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download PDF
                          </span>
                        </div>
                      ) : isImage ? (
                        <a
                          href={cert.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block cursor-pointer"
                        >
                          <img
                            src={cert.fileUrl}
                            alt={fileName}
                            className="w-full h-32 object-cover"
                            loading="lazy"
                          />
                        </a>
                      ) : (
                        <a
                          href={cert.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center justify-center h-32 cursor-pointer hover:bg-gray-800/40 transition-colors"
                        >
                          <svg className="w-12 h-12 text-amber-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-xs text-slate-400">View File</span>
                        </a>
                      )}
                      <div className="p-2 text-center flex items-center justify-center gap-2">
                        <span className="text-xs text-slate-400 truncate max-w-[80%]">{fileName}</span>
                        {isPdf && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-red-900/50 text-red-300 rounded">PDF</span>
                        )}
                        {isImage && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-blue-900/50 text-blue-300 rounded">Image</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          );
        })()}
      </div>
    </div>
  );
}