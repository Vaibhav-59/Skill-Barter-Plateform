import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useTheme } from "../hooks/useTheme";
import { 
  getSocialData, 
  connectSocial, 
  removeSocial, 
  fetchGithubData 
} from "../services/socialApi";

import SocialCard from "../components/social/SocialCard";
import ConnectForm from "../components/social/ConnectForm";
import GitHubStats from "../components/social/GitHubStats";
import SocialProof from "../components/social/SocialProof";
import ShareProfile from "../components/social/ShareProfile";
import InviteFriends from "../components/social/InviteFriends";
import ReferralStats from "../components/social/ReferralStats";
import ReferralCard from "../components/social/ReferralCard";
import { 
  getReferralStats, 
  getReferralList, 
  rewardReferralCredits 
} from "../services/referralApi";

export default function SocialIntegration() {
  const { isDarkMode } = useTheme();
  
  const [socialData, setSocialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeForm, setActiveForm] = useState(null);
  const [syncingGithub, setSyncingGithub] = useState(false);
  
  // Referral states
  const [referralStats, setReferralStats] = useState(null);
  const [referralList, setReferralList] = useState([]);
  const [loadingReferrals, setLoadingReferrals] = useState(true);

  // Platform definitions
  const PLATFORMS = {
    github: {
      id: "github",
      name: "GitHub",
      color: "bg-[#2b3137]",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      )
    },
    linkedin: {
      id: "linkedin",
      name: "LinkedIn",
      color: "bg-[#0077b5]",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )
    },
    twitter: {
      id: "twitter",
      name: "Twitter Profile",
      color: "bg-[#1DA1F2]",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" clipRule="evenodd" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    portfolio: {
      id: "portfolio",
      name: "Portfolio Website",
      color: "bg-teal-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      )
    }
  };

  useEffect(() => {
    fetchSocialData();
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const [statsRes, listRes] = await Promise.all([
        getReferralStats(),
        getReferralList()
      ]);
      
      if (statsRes.success) setReferralStats(statsRes.data);
      if (listRes.success) setReferralList(listRes.data);
    } catch (error) {
      console.error("Failed to load referral data", error);
    } finally {
      setLoadingReferrals(false);
    }
  };

  const fetchSocialData = async () => {
    try {
      const dbRes = await getSocialData();
      if (dbRes.success) {
        setSocialData(dbRes.data);
      }
    } catch (error) {
      toast.error("Failed to load social accounts");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (platformId) => {
    setActiveForm(platformId);
  };

  const handleSaveConnection = async (platformId, url) => {
    try {
      const res = await connectSocial(platformId, url);
      if (res.success) {
        setSocialData(res.data);
        setActiveForm(null);
        toast.success(`${PLATFORMS[platformId].name} connected successfully!`);
        
        // Auto-fetch github if it was a github connection
        if (platformId === 'github') {
          handleSyncGithub();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.error || `Failed to connect ${PLATFORMS[platformId].name}`);
    }
  };

  const handleRemoveConnection = async (platformId) => {
    if (window.confirm(`Are you sure you want to disconnect ${PLATFORMS[platformId].name}?`)) {
      try {
        const res = await removeSocial(platformId);
        if (res.success) {
          setSocialData(res.data);
          toast.info(`${PLATFORMS[platformId].name} disconnected.`);
        }
      } catch (error) {
        toast.error(`Failed to completely detach ${PLATFORMS[platformId].name}`);
      }
    }
  };

  const handleSyncGithub = async () => {
    try {
      setSyncingGithub(true);
      const res = await fetchGithubData();
      if (res.success) {
        toast.success("GitHub data successfully retrieved and processed");
        // Refresh local data logic immediately to reflect new stats
        setSocialData((prev) => ({
          ...prev,
          githubData: res.data,
        }));
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to sync GitHub analytics");
    } finally {
      setSyncingGithub(false);
    }
  };

  const handleSimulateReward = async (referralId, action) => {
    try {
      const res = await rewardReferralCredits(referralId, action);
      if (res.success) {
        toast.success(res.message);
        // Refresh data
        fetchReferralData();
        fetchSocialData();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to process reward");
    }
  };

  const countConnected = () => {
    if (!socialData) return 0;
    return [
      socialData.isGithubConnected,
      socialData.isLinkedinConnected,
      socialData.isTwitterConnected,
      socialData.isPortfolioConnected
    ].filter(Boolean).length;
  };

  if (loading) {
    return (
      <div className={`min-h-[60vh] flex items-center justify-center ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
         <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Extract urls logic to be easy to read
  const platformUrls = {
    github: socialData?.githubUrl || "",
    linkedin: socialData?.linkedinUrl || "",
    twitter: socialData?.twitterUrl || "",
    portfolio: socialData?.portfolioUrl || ""
  };

  const platformConnections = {
    github: socialData?.isGithubConnected || false,
    linkedin: socialData?.isLinkedinConnected || false,
    twitter: socialData?.isTwitterConnected || false,
    portfolio: socialData?.isPortfolioConnected || false
  };

  return (
    <div className={`min-h-screen pb-12 transition-colors duration-300 ${
      isDarkMode ? "bg-gradient-to-br from-gray-950 via-slate-950 to-gray-900 text-white" : "bg-gray-50 text-gray-900"
    }`}>
      {/* Decorative background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] transform -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-semibold text-indigo-500 uppercase tracking-widest">
              Integration Hub
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Social <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Integration</span>
          </h1>
          <p className={`text-lg max-w-2xl mx-auto ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
            Connect your professional profiles, build instant credibility with peers, and make your account stand out automatically!
          </p>
        </div>

        <SocialProof connectedCount={countConnected()} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold flex items-center">
              <svg className="w-6 h-6 mr-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Connected Accounts
            </h2>

            {/* List Platforms */}
            {Object.values(PLATFORMS).map(platform => (
              <div key={platform.id} className="relative transition-all duration-300">
                <SocialCard 
                  platform={platform}
                  isConnected={platformConnections[platform.id]}
                  url={platformUrls[platform.id]}
                  icon={platform.icon}
                  onConnect={handleConnect}
                  onRemove={handleRemoveConnection}
                />
                
                {/* Expand Form if active */}
                {activeForm === platform.id && (
                  <div className="transform origin-top animate-in slide-in-from-top-4 duration-300">
                    <ConnectForm 
                      platform={platform}
                      defaultUrl={platformUrls[platform.id]}
                      onSave={handleSaveConnection}
                      onCancel={() => setActiveForm(null)}
                    />
                  </div>
                )}
              </div>
            ))}

            {/* Display Stats if GitHub is connected */}
            {platformConnections.github && socialData?.githubData && (
              <div className="relative pt-4">
                <GitHubStats
                  githubData={socialData.githubData}
                  username={platformUrls.github.split("/").pop()}
                />
                <button
                  onClick={handleSyncGithub}
                  disabled={syncingGithub}
                  className={`absolute top-10 right-6 p-2 rounded-xl transition-all duration-300 ${
                    isDarkMode
                      ? "bg-slate-800 text-indigo-400 hover:bg-slate-700"
                      : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                  } ${
                    syncingGithub ? "animate-spin opacity-50 cursor-not-allowed" : ""
                  }`}
                  title="Resync Data"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>
            )}
            
            {/* Referral Section */}
            <div className="pt-8 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8">
               <h2 className="text-2xl font-bold flex items-center mb-2">
                <svg className="w-6 h-6 mr-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Invite Friends & Rewards
              </h2>
              <p className={`mb-6 text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                Earn skill credits by inviting your friends to join the platform and start learning.
              </p>
              
              <InviteFriends />
              <ReferralStats stats={referralStats} />
              <ReferralCard users={referralList} onSimulateReward={handleSimulateReward} />
            </div>
          </div>

          <div className="space-y-8">
            <ShareProfile userId={socialData?._id} />
             
            <div className={`p-6 rounded-2xl border ${isDarkMode ? "bg-gray-800/40 border-slate-700/50" : "bg-white border-gray-200"}`}>
               <h3 className={`font-bold text-lg mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                 Why Connect?
               </h3>
               <ul className="space-y-4">
                 <li className="flex items-start text-sm">
                   <svg className="w-5 h-5 text-emerald-500 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                   <span className={isDarkMode ? "text-slate-300" : "text-gray-600"}>Prove your verifiable expertise to the community immediately and effortlessly.</span>
                 </li>
                 <li className="flex items-start text-sm">
                   <svg className="w-5 h-5 text-emerald-500 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                   <span className={isDarkMode ? "text-slate-300" : "text-gray-600"}>Automatically reflect your GitHub contributions dynamically to your profile.</span>
                 </li>
                 <li className="flex items-start text-sm">
                   <svg className="w-5 h-5 text-emerald-500 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                   <span className={isDarkMode ? "text-slate-300" : "text-gray-600"}>Stand out and easily increase match rates with highly verifiable details.</span>
                 </li>
               </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
