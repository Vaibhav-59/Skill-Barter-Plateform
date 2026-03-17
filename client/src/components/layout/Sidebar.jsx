import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTheme } from "../../hooks/useTheme";

const links = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: (
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
          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
        />
      </svg>
    ),
  },
  {
    path: "/profile",
    label: "Profile",
    icon: (
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
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
  {
    path: "/skills",
    label: "Skills",
    icon: (
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
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
  },
  {
    path: "/matches",
    label: "Matches",
    icon: (
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
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    ),
  },
  {
    path: "/chat",
    label: "Chat",
    icon: (
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
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
  },
  {
    path: "/meeting",
    label: "Meeting",
    icon: (
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
          d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    path: "/sessions",
    label: "Sessions",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    path: "/contracts",
    label: "Contracts",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    path: "/reviews",
    label: "Reviews",
    icon: (
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
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    ),
  },
];

const LogoutSuccess = ({ show }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-950/98 via-slate-950/98 to-black/98 backdrop-blur-2xl rounded-3xl p-10 max-w-lg w-full mx-4 shadow-2xl transform animate-in zoom-in-95 duration-300 border border-emerald-400/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/8 via-green-500/6 to-teal-600/8 animate-pulse"></div>
        <div className="text-center relative z-10">
          <div className="mx-auto w-24 h-24 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 rounded-full flex items-center justify-center mb-8 animate-pulse shadow-2xl shadow-emerald-500/30 relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 blur-xl opacity-40 animate-pulse"></div>
            <svg
              className="w-12 h-12 text-white relative z-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </div>

          <h3 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 bg-clip-text text-transparent mb-4">
            Logged Out Successfully! 👋
          </h3>
          <p className="text-slate-300 mb-10 text-xl font-medium">
            Thank you for using SkillBarter. Redirecting to home page...
          </p>

          <div className="w-full bg-gray-800/60 rounded-full h-3 mb-8 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 h-3 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"
              style={{ width: "100%" }}
            ></div>
          </div>

          <div className="flex justify-center space-x-3">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce shadow-lg shadow-emerald-400/50"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce delay-100 shadow-lg shadow-green-500/50"></div>
            <div className="w-3 h-3 bg-teal-600 rounded-full animate-bounce delay-200 shadow-lg shadow-teal-600/50"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Sidebar({ 
  isMobileMenuOpen: externalMobileMenuOpen = false, 
  setIsMobileMenuOpen: externalSetMobileMenuOpen = () => {},
  isMobile: externalIsMobile = false 
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);
  const [internalMobileMenuOpen, setInternalMobileMenuOpen] = useState(false);
  const [internalIsMobile, setInternalIsMobile] = useState(false);
  const { theme, toggleTheme, isDarkMode } = useTheme();

  // Use external props if provided, otherwise use internal state
  const isMobileMenuOpen = externalIsMobile ? externalMobileMenuOpen : internalMobileMenuOpen;
  const setIsMobileMenuOpen = externalIsMobile ? externalSetMobileMenuOpen : setInternalMobileMenuOpen;
  const isMobile = externalIsMobile || internalIsMobile;

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      const mobileCheck = window.innerWidth < 768;
      if (!externalIsMobile) {
        setInternalIsMobile(mobileCheck);
        if (mobileCheck) {
          setIsCollapsed(true);
          setInternalMobileMenuOpen(false);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [externalIsMobile]);

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Show success message
    setShowLogoutSuccess(true);
    
    // Redirect to home page after delay
    setTimeout(() => {
      window.location.href = "/";
    }, 2000);
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-3 bg-gray-800/90 backdrop-blur-sm border border-slate-600/30 rounded-xl text-slate-300 hover:text-emerald-400 hover:border-emerald-400/40 transition-all duration-300 shadow-lg"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isMobileMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      <aside
        className={`${
          isCollapsed ? "w-20" : "w-72"
        } h-screen backdrop-blur-xl border-r shadow-2xl transition-all duration-300 relative overflow-hidden ${
          isMobile && isMobileMenuOpen ? "translate-x-0" : isMobile ? "-translate-x-full" : "translate-x-0"
        } ${isMobile ? "fixed" : "relative"} z-50 ${
          isDarkMode
            ? "bg-gradient-to-br from-gray-950/95 via-slate-950/95 to-gray-900/95 border-slate-600/20"
            : "bg-white/95 border-emerald-100"
        }`}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-emerald-400/3 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-green-500/2 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-teal-400/2 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 flex flex-col h-full p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            {/* Mobile Close Button */}
            {isMobile && (
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="md:hidden p-2 bg-gray-800/50 backdrop-blur-sm border border-slate-600/30 rounded-xl text-slate-400 hover:text-red-400 hover:border-red-400/40 transition-all duration-300"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <svg
                      className="w-6 h-6 text-white relative z-10"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 rounded-xl blur opacity-20"></div>
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 bg-clip-text text-transparent">
                  SkillBarter
                </div>
              </div>
            )}

            {!isMobile && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`hidden md:flex p-2 backdrop-blur-sm border rounded-xl transition-all duration-300 ${
                  isDarkMode 
                    ? "bg-gray-800/50 border-slate-600/30 text-slate-400 hover:text-emerald-400 hover:border-emerald-400/40" 
                    : "bg-gray-50 border-gray-200 text-gray-500 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50"
                }`}
              >
                <svg
                  className={`w-5 h-5 transition-transform duration-300 ${
                    isCollapsed ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className={`flex-1 space-y-2 overflow-y-auto transition-colors duration-300 ${
            isCollapsed 
              ? "pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden" 
              : "pr-2 [scrollbar-width:thin] [scrollbar-color:#10b981_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-emerald-500/30 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-emerald-500/50"
          }`}>
            {links.map((link, index) => {
              const isActive = location.pathname === link.path;

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => {
                    if (isMobile) {
                      setIsMobileMenuOpen(false);
                    }
                  }}
                  className={`group relative flex items-center ${
                    isCollapsed ? "justify-center" : "justify-start"
                  } space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-400/20 via-green-500/20 to-teal-600/20 text-emerald-500 border border-emerald-400/30 shadow-lg shadow-emerald-500/20"
                      : isDarkMode
                        ? "text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-emerald-400/10 hover:via-green-500/10 hover:to-teal-600/10 border border-transparent hover:border-emerald-400/20"
                        : "text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-200"
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-emerald-400 via-green-500 to-teal-600 rounded-r-full shadow-lg shadow-emerald-500/50"></div>
                  )}

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-green-500/5 to-teal-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>

                  {/* Icon */}
                  <div
                    className={`relative z-10 transition-colors duration-300 ${
                      isActive
                        ? isDarkMode ? "text-emerald-300" : "text-emerald-600"
                        : isDarkMode ? "text-slate-400 group-hover:text-emerald-400" : "text-gray-500 group-hover:text-emerald-600"
                    }`}
                  >
                    {link.icon}
                  </div>

                  {/* Label */}
                  {!isCollapsed && (
                    <span
                      className={`relative z-10 font-medium transition-colors duration-300 ${
                        isActive 
                          ? isDarkMode ? "text-white" : "text-emerald-800" 
                          : isDarkMode ? "group-hover:text-white" : "group-hover:text-emerald-700"
                      }`}
                    >
                      {link.label}
                    </span>
                  )}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && !isMobileMenuOpen && (
                    <div className="absolute left-full ml-4 px-3 py-2 bg-gradient-to-r from-gray-950 to-slate-950 text-white text-sm rounded-lg border border-slate-600/20 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
                      {link.label}
                      <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-950 border-l border-t border-slate-600/20 rotate-45"></div>
                    </div>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Theme Toggle Button */}
          <div className="mt-6 mb-4">
            <button
              onClick={toggleTheme}
              className={`group relative flex items-center ${
                isCollapsed ? "justify-center" : "justify-start"
              } space-x-3 px-4 py-3 w-full rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                isDarkMode
                  ? "bg-gray-800/50 text-yellow-400 hover:bg-gray-700/60 border border-gray-600/30 hover:border-yellow-400/40"
                  : "bg-gray-100/50 text-gray-700 hover:bg-gray-200/60 border border-gray-300/30 hover:border-yellow-500/40"
              } backdrop-blur-sm`}
            >
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-amber-500/5 to-orange-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>

              {/* Icon */}
              <div className="relative z-10 transition-colors duration-300">
                {isDarkMode ? (
                  // Sun icon for light mode
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
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ) : (
                  // Moon icon for dark mode
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
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                )}
              </div>

              {/* Label */}
              {!isCollapsed && (
                <span className={`relative z-10 font-medium transition-colors duration-300 ${isDarkMode ? "text-slate-300 group-hover:text-white" : "text-gray-700"}`}>
                  {isDarkMode ? "Light Mode" : "Dark Mode"}
                </span>
              )}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && !isMobileMenuOpen && (
                    <div className="absolute left-full ml-4 px-3 py-2 bg-gradient-to-r from-gray-950 to-slate-950 text-white text-sm rounded-lg border border-slate-600/20 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
                      {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                      <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-950 border-l border-t border-slate-600/20 rotate-45"></div>
                    </div>
                  )}
            </button>
          </div>

          {/* Logout Button */}
          <div className="mt-6 pt-6 border-t border-slate-600/20">
            <button
              onClick={handleLogout}
              className={`group relative flex items-center ${
                isCollapsed ? "justify-center" : "justify-start"
              } space-x-3 px-4 py-3 w-full rounded-2xl transition-all duration-300 transform hover:scale-105 text-white hover:text-white bg-green-500 hover:bg-green-600 border border-green-400/30 hover:border-green-300/50 backdrop-blur-sm shadow-lg hover:shadow-xl`}
            >
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-green-500/5 to-teal-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>

              {/* Icon */}
              <div className="relative z-10 text-white group-hover:text-white transition-colors duration-300">
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
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </div>

              {/* Label */}
              {!isCollapsed && (
                <span className="relative z-10 font-medium text-white group-hover:text-white transition-colors duration-300">
                  Logout
                </span>
              )}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && !isMobileMenuOpen && (
                    <div className="absolute left-full ml-4 px-3 py-2 bg-gradient-to-r from-gray-950 to-slate-950 text-white text-sm rounded-lg border border-slate-600/20 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
                      Logout
                      <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-950 border-l border-t border-slate-600/20 rotate-45"></div>
                    </div>
                  )}
            </button>
          </div>
        </div>
      </aside>

      <LogoutSuccess show={showLogoutSuccess} />
    </>
  );
}