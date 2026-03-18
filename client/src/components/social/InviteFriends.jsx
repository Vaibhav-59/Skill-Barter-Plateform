import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useTheme } from "../../hooks/useTheme";
import { getReferralLink } from "../../services/referralApi";

export default function InviteFriends() {
  const { isDarkMode } = useTheme();
  const [referralData, setReferralData] = useState({ code: "", link: "" });
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLink();
  }, []);

  const fetchLink = async () => {
    try {
      const res = await getReferralLink();
      if (res.success) {
        setReferralData({ code: res.data.referralCode, link: res.data.referralLink });
      }
    } catch (err) {
      toast.error("Failed to generate referral link");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralData.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getShareUrl = (platform) => {
    const text = "Join me on SkillBarter and let's exchange skills! Use my invite link:";
    const url = encodeURIComponent(referralData.link);
    
    switch (platform) {
      case "whatsapp":
        return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}%20${url}`;
      case "twitter":
        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`;
      case "email":
        return `mailto:?subject=Join me on SkillBarter!&body=${encodeURIComponent(text + "\n\n" + referralData.link)}`;
      default:
        return "";
    }
  };

  if (loading) return null;

  return (
    <div className={`p-8 rounded-3xl mt-6 shadow-xl relative overflow-hidden ${
      isDarkMode 
        ? "bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900 border border-indigo-500/30" 
        : "bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100"
    }`}>
      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className={`text-2xl font-bold flex items-center mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              <svg className="w-7 h-7 mr-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              Invite Friends & Earn Rewards
            </h2>
            <p className={isDarkMode ? "text-indigo-200" : "text-indigo-800"}>
              Give your friends the gift of learning and earn time credits directly to your wallet!
            </p>
          </div>
          
          <div className={`px-4 py-3 rounded-2xl flex items-center shadow-inner ${isDarkMode ? "bg-black/20" : "bg-white/60"}`}>
            <div className="mx-2">
              <span className="block text-xs font-semibold uppercase tracking-wider text-emerald-500">Sign Up Reward</span>
              <span className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>+5 Credits</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className={`flex-1 flex items-center px-4 py-3 rounded-xl border ${
            isDarkMode ? "bg-slate-800/80 border-indigo-500/30 text-white" : "bg-white border-indigo-200 text-gray-800"
          }`}>
            <span className={`text-sm font-semibold mr-3 select-none ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`}>
              Link:
            </span>
            <input 
              readOnly 
              value={referralData.link}
              className="bg-transparent flex-1 text-sm outline-none w-full"
            />
          </div>
          
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className={`px-6 py-3 rounded-xl font-bold flex items-center transition-all duration-300 shadow-lg ${
                copied 
                  ? "bg-emerald-500 text-white shadow-emerald-500/30" 
                  : "bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/30"
              }`}
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
            
            <a href={getShareUrl("whatsapp")} target="_blank" rel="noreferrer" className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#25D366] hover:bg-[#20BE5A] text-white shadow-lg transition-transform hover:scale-105">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12.004 2c-5.5 0-9.972 4.47-9.974 9.972-.001 1.758.46 3.473 1.336 4.985L2.001 22l5.176-1.357A9.917 9.917 0 0012.004 22c5.5 0 9.972-4.47 9.972-9.971C21.976 6.47 17.504 2 12.004 2zm5.542 14.342c-.234.654-1.353 1.258-1.898 1.346-.5.081-1.144.137-3.238-.732-2.527-1.048-4.143-3.615-4.269-3.784-.131-.17-1.018-1.353-1.018-2.583 0-1.23.639-1.829.866-2.072.228-.242.496-.303.655-.303.165 0 .324.004.472.012.158.007.369-.06.578.438.22.518.736 1.795.8 1.921.066.126.11.272.023.443-.082.166-.129.274-.25.419-.117.142-.25.309-.355.418-.117.117-.238.246-.104.479.131.233.585.972 1.256 1.571.865.772 1.597.986 1.83 1.111.232.126.368.106.5-.043.136-.153.583-.679.742-.913.153-.234.307-.197.518-.117.214.079 1.346.634 1.575.748.232.115.385.172.441.267.056.096.056.554-.178 1.208z" /></svg>
            </a>
            
            <a href={getShareUrl("email")} target="_blank" rel="noreferrer" className={`w-12 h-12 flex items-center justify-center rounded-xl shadow-lg transition-transform hover:scale-105 ${
              isDarkMode ? "bg-slate-700 text-white hover:bg-slate-600" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </a>
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="flex items-center">
            <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold mr-3 shadow-inner">1</span>
            <span className={isDarkMode ? "text-indigo-100" : "text-indigo-900"}>Your friend signs up using your unique link</span>
          </div>
          <div className="flex items-center">
            <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold mr-3 shadow-inner">2</span>
            <span className={isDarkMode ? "text-indigo-100" : "text-indigo-900"}>Your wallet gets <b className="text-emerald-500">5 credits</b> automatically</span>
          </div>
          <div className="flex items-center">
            <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold mr-3 shadow-inner">3</span>
            <span className={isDarkMode ? "text-indigo-100" : "text-indigo-900"}>Earn up to <b className="text-emerald-500">15 more</b> when they complete skill sessions!</span>
          </div>
        </div>

      </div>
    </div>
  );
}
