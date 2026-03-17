import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import { clearAdminData } from "../../redux/slices/adminSlice";
import { showSuccess, showError } from "../../utils/toast";
import { useTheme } from "../../hooks/useTheme";

const menuItems = [
  {
    path: "dashboard",
    label: "Dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    path: "users",
    label: "Users",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
  },
  {
    path: "skills",
    label: "Skills",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    path: "stats",
    label: "Statistics",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    path: "data-analysis",
    label: "Data Analysis",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    path: "meetings",
    label: "Meetings",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    path: "sessions",
    label: "Sessions",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    path: "contracts",
    label: "Contracts",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    path: "reviews",
    label: "Reviews",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
];

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      dispatch(clearAdminData());
      dispatch(logout());
      showSuccess("Logged out successfully");
      navigate("/");
    } catch (err) {
      showError("Failed to logout");
    }
    setShowLogoutModal(false);
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDarkMode 
        ? "bg-gradient-to-br from-black via-gray-950 to-slate-950" 
        : "bg-gradient-to-br from-slate-50 via-white to-emerald-50/50"
    }`}>
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ${
          sidebarOpen ? "w-72" : "w-20"
        }`}
      >
        <div className={`h-full border-r flex flex-col transition-colors duration-500 ${
          isDarkMode 
            ? "bg-gradient-to-b from-gray-950 via-slate-950 to-black border-slate-500/30" 
            : "bg-white border-green-200"
        }`}>
          {/* Logo */}
          <div className={`p-6 border-b ${isDarkMode ? "border-slate-500/30" : "border-gray-200"}`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30">
                <svg
                  className="w-6 h-6 text-white"
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
              {sidebarOpen && (
                <div className="overflow-hidden">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 bg-clip-text text-transparent whitespace-nowrap">
                    SkillBarter
                  </h1>
                  <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>Admin Panel</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-500 border border-emerald-400/30"
                      : isDarkMode 
                        ? "text-slate-400 hover:bg-slate-800/50 hover:text-white border border-transparent hover:border-slate-500/30"
                        : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 border border-transparent hover:border-emerald-200"
                  }`
                }
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {sidebarOpen && (
                  <span className="font-medium whitespace-nowrap">{item.label}</span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User Profile - Admin Panel */}
          <div className={`p-4 border-t ${isDarkMode ? "border-slate-500/30" : "border-gray-200"}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">A</span>
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    Admin
                  </p>
                </div>
              )}
              {sidebarOpen && (
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className={`p-2 rounded-lg transition-all duration-300 ${isDarkMode ? "text-slate-400 hover:text-red-400 hover:bg-red-500/10" : "text-gray-500 hover:text-red-600 hover:bg-red-50"}`}
                  title="Logout"
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
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -right-3 top-20 w-6 h-6 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
          >
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${
                sidebarOpen ? "" : "rotate-180"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "ml-72" : "ml-20"
        }`}
      >
        {/* Header */}
        <header className={`sticky top-0 z-30 backdrop-blur-sm border-b transition-colors duration-500 ${
          isDarkMode 
            ? "bg-gradient-to-b from-gray-950/95 via-slate-950/90 to-black/95 border-slate-500/30" 
            : "bg-white/80 border-gray-200"
        }`}>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <h2 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}>Admin Panel</h2>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  isDarkMode 
                    ? "text-yellow-400 hover:bg-slate-800/50" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                title="Toggle Theme"
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => navigate("/")}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all duration-300 ${
                  isDarkMode 
                    ? "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    : "text-gray-600 hover:text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                View Site
              </button>
              <button
                onClick={() => setShowLogoutModal(true)}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all duration-300 ${
                  isDarkMode
                    ? "text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                    : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                }`}
              >
                <svg
                  className="w-4 h-4"
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
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className={`border rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl transition-colors duration-300 ${
            isDarkMode 
              ? "bg-gradient-to-br from-gray-950 via-slate-950 to-black border-slate-500/50" 
              : "bg-white border-green-200"
          }`}>
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border ${
                isDarkMode 
                  ? "bg-gradient-to-br from-red-500/25 to-red-600/25 border-red-400/30" 
                  : "bg-red-100 border-red-200"
              }`}>
                <svg
                  className="w-8 h-8 text-red-400"
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
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Confirm Logout
              </h3>
              <p className={`mb-6 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                Are you sure you want to logout from the admin panel?
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className={`px-6 py-2 rounded-xl transition-all duration-300 ${
                    isDarkMode 
                      ? "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300"
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
