import { useState } from "react";
import { useTheme } from "../../hooks/useTheme";

export default function ShareProfile({ userId }) {
  const { isDarkMode } = useTheme();
  const [copied, setCopied] = useState(false);

  // Generate public profile link
  const profileLink = `${window.location.origin}/user/${userId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform) => {
    let url = "";
    const text = "Check out my SkillBarter profile and verified skills!";
    
    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(profileLink)}&text=${encodeURIComponent(text)}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileLink)}`;
        break;
      case "whatsapp":
        url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + profileLink)}`;
        break;
      default:
        break;
    }

    if (url) {
      window.open(url, "_blank", "width=600,height=400");
    }
  };

  return (
    <div className={`mt-8 p-6 rounded-2xl border ${
      isDarkMode ? "bg-gray-800/40 border-slate-700/50" : "bg-white border-gray-200"
    } shadow-sm`}>
      <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
        Share Your Professional Profile
      </h3>
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* Link Input & Copy Button */}
        <div className="flex-1 flex bg-white/5 rounded-xl border border-slate-700/30 overflow-hidden shadow-inner">
          <input 
            type="text" 
            readOnly 
            value={profileLink}
            className={`flex-1 px-4 py-3 outline-none border-none text-sm transition-colors duration-300 ${
              isDarkMode ? "bg-transparent text-slate-300" : "bg-gray-50 text-gray-700"
            }`}
          />
          <button 
            onClick={handleCopyLink}
            className={`px-5 py-3 font-medium transition-colors duration-300 flex items-center ${
              copied 
                ? isDarkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700" 
                : isDarkMode ? "bg-slate-700/50 hover:bg-slate-700 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
          >
            {copied ? (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                Copy Link
              </>
            )}
          </button>
        </div>

        {/* Social Share Buttons */}
        <div className="flex space-x-2">
          <button 
            onClick={() => handleShare("twitter")}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#1DA1F2] hover:bg-[#1A91DA] text-white transition-colors duration-300 shadow-md hover:shadow-lg"
          >
             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
          </button>
          <button 
            onClick={() => handleShare("linkedin")}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#0077B5] hover:bg-[#0069A0] text-white transition-colors duration-300 shadow-md hover:shadow-lg"
          >
             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
