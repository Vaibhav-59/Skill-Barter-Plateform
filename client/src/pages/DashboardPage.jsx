import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import api, { BASE_URL } from "../utils/api";

export default function DashboardPage() {
  const { isDarkMode, bgClass, textClass, borderClass, cardClass, inputClass } = useTheme();
  const [allUsers, setAllUsers] = useState([]);
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeNotifTab, setActiveNotifTab] = useState('all');
  const notifRef = useRef(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data);
        setUnreadCount(res.data.filter(n => !n.isRead).length);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };
    fetchNotifications();
  }, []);

  const notifTabs = [
    { id: 'all', label: 'All' },
    { id: 'match_request', label: 'Match Requests' },
    { id: 'session', label: 'Sessions' },
    { id: 'time_banking', label: 'Time Banking' },
    { id: 'contract', label: 'Contracts' },
    { id: 'chat', label: 'Chats' },
    { id: 'review', label: 'Reviews' },
    { id: 'group_session', label: 'Group Sessions' },
    { id: 'gamification', label: 'Gamification' }
  ];

  const filteredNotifications = notifications.filter(n => {
    if (activeNotifTab === 'all') return true;
    
    // Some backend components might use specific types
    if (activeNotifTab === 'match_request' && n.type === 'match_request') return true;
    if (activeNotifTab === 'chat' && (n.type === 'message' || n.type === 'chat')) return true;
    if (activeNotifTab === 'gamification' && n.type === 'gamification') return true;
    
    // Fallback: match based on textual content
    const content = ((n.title || '') + ' ' + (n.message || '') + ' ' + (n.content || '')).toLowerCase();
    
    if (activeNotifTab === 'match_request' && (content.includes('match') && !content.includes('group'))) return true;
    if (activeNotifTab === 'session' && (content.includes('session') && !content.includes('group'))) return true;
    if (activeNotifTab === 'time_banking' && (content.includes('time bank') || content.includes('wallet') || content.includes('credit'))) return true;
    if (activeNotifTab === 'contract' && content.includes('contract')) return true;
    if (activeNotifTab === 'review' && (content.includes('review') || content.includes('rating'))) return true;
    if (activeNotifTab === 'group_session' && (content.includes('group session') || content.includes('group'))) return true;
    
    return false;
  });

  const handleMarkAsRead = async (notifId) => {
    try {
      await api.put(`/notifications/${notifId}/read`);
      setNotifications(notifications.map(n => n._id === notifId ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch(err) {
      console.error(err);
    }
  };

  const handleDeleteNotification = async (notifId) => {
    try {
      await api.delete(`/notifications/${notifId}`);
      const deletedNotif = notifications.find(n => n._id === notifId);
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setNotifications(notifications.filter(n => n._id !== notifId));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get(`/users/discover?t=${Date.now()}`);
        console.log("API Response:", res.data);
        setAllUsers(res.data);
        setDisplayedUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const handleProfileUpdate = () => {
      api.get(`/users/discover?t=${Date.now()}`)
        .then(res => {
          setAllUsers(res.data);
          setDisplayedUsers(res.data);
        })
        .catch(err => console.error("Failed to refresh users:", err));
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    const handleStorageChange = (e) => {
      if (e.key === 'profileUpdated') {
        handleProfileUpdate();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    let result = [...allUsers];

    // Search
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase().trim();
      result = result.filter((user) => {
        if (user.name?.toLowerCase().includes(searchLower)) return true;
        const locStr = typeof user.location === 'object' && user.location !== null 
          ? `${user.location.city || ''} ${user.location.country || ''}` : (user.location || '');
        if (locStr.toLowerCase().includes(searchLower)) return true;
        if (user.bio?.toLowerCase().includes(searchLower)) return true;
        if (
          user.teachSkills?.some((skill) =>
            skill.name?.toLowerCase().includes(searchLower)
          )
        )
          return true;
        if (
          user.learnSkills?.some((skill) =>
            skill.name?.toLowerCase().includes(searchLower)
          )
        )
          return true;

        return false;
      });
    }

    // Filter
    if (filterBy === "teaching") {
      result = result.filter(u => u.teachSkills && u.teachSkills.length > 0);
    } else if (filterBy === "learning") {
      result = result.filter(u => u.learnSkills && u.learnSkills.length > 0);
    }

    // Sort
    if (sortBy === "nameAsc") {
      result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortBy === "nameDesc") {
      result.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    }

    setDisplayedUsers(result);
  }, [allUsers, searchQuery, sortBy, filterBy]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const handleViewDetails = (userId) => {
    navigate(`/user/${userId}`);
  };

  const getTopSkills = (teachSkills = [], learnSkills = []) => {
    const allSkills = [...teachSkills, ...learnSkills];
    return allSkills.slice(0, 3);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-96 -right-96 w-[600px] h-[600px] bg-emerald-400/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-96 -left-96 w-[600px] h-[600px] bg-green-500/4 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-teal-400/3 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 flex justify-center items-center h-screen">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 rounded-full mb-6 shadow-2xl shadow-emerald-500/30">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-white border-t-transparent"></div>
            </div>
            <p className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 bg-clip-text text-transparent">
              Discovering Amazing People...
            </p>
            <p className="text-slate-400 mt-2">
              Finding skilled professionals just for you
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* Background Effects */}
      <div className={`fixed inset-0 overflow-hidden pointer-events-none transition-all duration-500 ${
        isDarkMode ? '' : 'opacity-10'
      }`}>
        {isDarkMode && (
          <>
            <div className="absolute -top-96 -right-96 w-[600px] h-[600px] bg-emerald-400/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-96 -left-96 w-[600px] h-[600px] bg-green-500/4 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-teal-400/3 rounded-full blur-2xl animate-pulse delay-500"></div>

            <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-emerald-500/4 rounded-full blur-xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-green-400/3 rounded-full blur-xl"></div>

            <div className="absolute top-20 left-20 w-2 h-2 bg-emerald-400/30 rounded-full animate-ping"></div>
            <div className="absolute top-40 right-32 w-1.5 h-1.5 bg-green-400/20 rounded-full animate-ping delay-300"></div>
            <div className="absolute bottom-32 left-1/3 w-2 h-2 bg-teal-500/25 rounded-full animate-ping delay-700"></div>
            <div className="absolute top-60 right-1/4 w-1 h-1 bg-emerald-300/20 rounded-full animate-ping delay-1000"></div>

            <div className="absolute inset-0 opacity-10">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, rgba(52, 211, 153, 0.08) 1px, transparent 0)`,
                  backgroundSize: "50px 50px",
                }}
              ></div>
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 lg:p-8">
        {/* Header Options & Search Bar */}
        <div className="max-w-7xl mx-auto mb-12 flex flex-col items-center gap-6">
          <div className="flex flex-col lg:flex-row items-center w-full gap-4">
            {/* Search Bar */}
            <div className="relative group flex-1 w-full">
              <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-emerald-400 transition-colors duration-300">
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-emerald-400 transition-colors duration-300"
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

              <input
                type="text"
                placeholder="Search for skills, people, or opportunities..."
                value={searchQuery}
                onChange={handleSearchChange}
                className={`w-full pl-12 ${
                  searchQuery ? "pr-12" : "pr-4"
                } py-3 ${inputClass} backdrop-blur-sm border border-slate-600/30 rounded-2xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400/50 transition-all duration-300 hover:bg-opacity-70 text-center`}
              />
            </div>

            {/* Filter and Sort options on the right */}
            <div className="flex flex-wrap items-center justify-center gap-3 w-full lg:w-auto">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className={`py-3 px-4 ${inputClass} backdrop-blur-sm border border-slate-600/30 rounded-xl focus:outline-none focus:border-emerald-400/50 hover:bg-opacity-70 flex-1 lg:flex-none cursor-pointer`}
              >
                <option value="all">All Members</option>
                <option value="teaching">Mentors (Teaching)</option>
                <option value="learning">Learners</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`py-3 px-4 ${inputClass} backdrop-blur-sm border border-slate-600/30 rounded-xl focus:outline-none focus:border-emerald-400/50 hover:bg-opacity-70 flex-1 lg:flex-none cursor-pointer`}
              >
                <option value="default">Default Sort</option>
                <option value="nameAsc">Name (A-Z)</option>
                <option value="nameDesc">Name (Z-A)</option>
              </select>

              <Link 
                to="/skill-hub/time-banking" 
                className={`flex items-center justify-center w-[50px] h-[50px] rounded-xl backdrop-blur-sm border border-slate-600/30 hover:border-emerald-400/50 transition-all duration-300 group ${isDarkMode ? 'bg-slate-800/50 text-emerald-400' : 'bg-white text-emerald-600 shadow-sm'}`}
                title="Time Banking"
              >
                <div className="relative transform group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
                </div>
              </Link>

              {/* Notification Icon */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative flex items-center justify-center w-[50px] h-[50px] rounded-xl backdrop-blur-sm border border-slate-600/30 hover:border-emerald-400/50 transition-all duration-300 ${isDarkMode ? 'bg-slate-800/50 text-emerald-400' : 'bg-white text-emerald-600 shadow-sm'}`}
                  title="Notifications"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md z-10">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className={`absolute right-0 mt-3 w-80 md:w-96 rounded-2xl shadow-2xl border backdrop-blur-xl z-50 ${isDarkMode ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-gray-200'} overflow-hidden`}>
                    <div className={`p-4 border-b font-semibold flex items-center justify-between ${isDarkMode ? 'border-slate-800 text-white' : 'border-gray-100 text-gray-800'}`}>
                      <span>Notifications</span>
                    </div>
                    
                    {/* Notification Tabs */}
                    <div className={`flex overflow-x-auto p-2 border-b ${isDarkMode ? 'border-slate-800' : 'border-gray-100'} scrollbar-hide`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      {notifTabs.map(tab => (
                        <button
                          key={tab.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveNotifTab(tab.id);
                          }}
                          className={`flex-shrink-0 px-3 py-1.5 mx-1 text-xs font-medium rounded-full transition-colors ${activeNotifTab === tab.id
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div className="max-h-[350px] overflow-y-auto">
                      {filteredNotifications.length === 0 ? (
                        <div className="p-8 text-center text-sm text-slate-500 flex flex-col items-center">
                          <svg className="w-10 h-10 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                          No notifications found.
                        </div>
                      ) : (
                        filteredNotifications.map((notif) => (
                          <div
                            key={notif._id}
                            className={`p-4 border-b last:border-0 transition-colors cursor-pointer ${
                              notif.isRead 
                                ? (isDarkMode ? 'border-slate-800 hover:bg-slate-800/50 text-slate-400' : 'border-gray-100 hover:bg-gray-50 text-gray-500')
                                : (isDarkMode ? 'border-slate-800 bg-emerald-500/10 hover:bg-emerald-500/20 text-slate-200' : 'border-gray-100 bg-emerald-50 hover:bg-emerald-100 text-gray-800')
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              !notif.isRead && handleMarkAsRead(notif._id);
                            }}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex-1">
                                <div className="font-medium text-sm mb-1">{notif?.title || notif?.type || "System Notification"}</div>
                                <div className="text-xs opacity-80">{notif?.message || notif?.content}</div>
                                <div className="text-[10px] mt-2 opacity-50">
                                  {new Date(notif?.createdAt).toLocaleString()}
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notif._id);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 group/delete"
                                title="Delete notification"
                              >
                                <svg className="w-4 h-4 transform group-hover/delete:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Header Section */}
        {/* <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 rounded-2xl mb-6 shadow-2xl shadow-emerald-500/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <svg
              className="w-8 h-8 text-white relative z-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              />
            </svg>
          </div>

          <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 bg-clip-text text-transparent mb-4">
            Discover Talent
          </h1>
          <p className="text-xl text-slate-300 mb-6 max-w-2xl mx-auto leading-relaxed">
            Connect with amazing professionals, learn new skills, and share your
            expertise with the world
          </p>

          <div className="flex items-center justify-center space-x-4 mb-8 flex-wrap">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-400/10 via-green-500/10 to-teal-600/10 backdrop-blur-sm rounded-full px-4 py-2 border border-emerald-400/20">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
              <span className="text-emerald-400 font-semibold">
                {displayedUsers.length}{" "}
                {displayedUsers.length === allUsers.length
                  ? "Active Members"
                  : "Results Found"}
              </span>
            </div>
            <div className="flex items-center space-x-2 bg-gradient-to-r from-green-400/10 via-teal-500/10 to-emerald-600/10 backdrop-blur-sm rounded-full px-4 py-2 border border-green-400/20">
              <svg
                className="w-4 h-4 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span className="text-green-400 font-semibold">Live Network</span>
            </div>
          </div>
        </div> */}

        {/* Users Grid */}
        <div className="max-w-7xl mx-auto">
          {displayedUsers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {displayedUsers.map((user, index) => {
                const topSkills = getTopSkills(
                  user.teachSkills,
                  user.learnSkills
                );

                return (
                  <div
                    key={user._id}
                    className={`group relative ${cardClass} backdrop-blur-xl rounded-3xl border border-slate-600/20 p-8 hover:border-emerald-400/30 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-emerald-500/10 overflow-hidden animate-fadeInUp min-h-[450px] ${!isDarkMode ? 'shadow-lg' : ''}`}
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-green-500/3 to-teal-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

                    <div className="flex justify-center mb-8">
                      <div className="relative">
                        <div className="w-28 h-28 bg-gradient-to-br from-emerald-400/90 via-green-500/90 to-teal-600/90 rounded-full flex items-center justify-center text-white text-3xl font-bold relative overflow-hidden group-hover:scale-110 transition-transform duration-300">
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                          {user.profileImage ? (
                            <img 
                              src={user.profileImage} 
                              alt={user.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="relative z-10">
                              {user.name?.charAt(0)?.toUpperCase() || "U"}
                            </span>
                          )}
                        </div>
                        {/* Online indicator */}
                        <div className="absolute bottom-2 right-2 w-4 h-4 bg-emerald-400 rounded-full border-2 border-gray-950"></div>
                        {/* <div className="absolute -inset-3 bg-gradient-to-r from-emerald-400/20 via-green-500/20 to-teal-600/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div> */}
                      </div>
                    </div>

                    <h3 className={`text-2xl font-bold ${textClass} text-center mb-3 group-hover:text-emerald-300 transition-colors duration-300`}>
                      {user.name || "Anonymous User"}
                    </h3>

                    {user.role && (
                      <div className="flex items-center justify-center space-x-2 mb-4">
                        <span className="px-3 py-1 bg-gradient-to-r from-emerald-400/15 via-green-500/15 to-teal-600/15 backdrop-blur-sm text-emerald-300 text-xs font-semibold rounded-full border border-emerald-400/20">
                          {user.role}
                        </span>
                      </div>
                    )}

                    {user.location && (
                      <div className="flex items-center justify-center space-x-2 mb-6">
                        <svg
                          className="w-5 h-5 text-emerald-400/80"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <p className={`text-base ${textClass} font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                          {typeof user.location === 'object' && user.location !== null 
                            ? [user.location.city, user.location.country].filter(Boolean).join(', ') 
                            : user.location}
                        </p>
                      </div>
                    )}

                    <div className="space-y-4 mb-8">
                      {topSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-3 justify-center">
                          {topSkills.map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="px-4 py-2 bg-gradient-to-r from-emerald-400/15 via-green-500/15 to-teal-600/15 backdrop-blur-sm text-emerald-300 text-sm font-semibold rounded-full border border-emerald-400/20 hover:border-emerald-400/40 hover:bg-emerald-400/20 transition-all duration-300 shadow-md"
                            >
                              {skill.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'} text-center ${isDarkMode ? 'bg-slate-800/20' : 'bg-gray-100/50'} rounded-xl py-3 px-4 border ${borderClass}`}>
                          No skills listed yet
                        </p>
                      )}
                    </div>

                    {user.bio && (
                      <p className={`text-base ${textClass} text-center mb-4 leading-relaxed ${isDarkMode ? 'bg-gradient-to-r from-gray-800/20 to-slate-800/20' : 'bg-gradient-to-r from-gray-100/50 to-gray-200/50'} rounded-xl p-4 border ${borderClass} min-h-[80px] flex items-center justify-center`}>
                        {user.bio.length > 80
                          ? `${user.bio.substring(0, 80)}...`
                          : user.bio}
                    </p>
                    )}

                    {(() => {
                      // Gather certificates from both old and new format
                      const newCerts = user?.certificates || [];
                      const oldCerts = (user?.skillCertificates || []).filter(c => c && typeof c === 'string' && c.trim());
                      const normalizedOld = oldCerts.map(url => ({
                        fileUrl: url,
                        fileType: /\.(jpg|jpeg|png|gif|webp)$/i.test(url) ? 'image' : 'pdf',
                        fileName: url.split('/').pop() || 'Certificate',
                      }));
                      const seen = new Set();
                      const allCerts = [...newCerts, ...normalizedOld].filter(c => {
                        if (!c?.fileUrl || seen.has(c.fileUrl)) return false;
                        seen.add(c.fileUrl);
                        return true;
                      });

                      if (allCerts.length === 0) return null;

                      return (
                      <div className="mb-4">
                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'} mb-2 font-medium`}>Skill Certificates ({allCerts.length})</p>
                        <div className="space-y-2">
                          {allCerts.slice(0, 3).map((cert, index) => {
                            const isPdf = cert.fileType === 'pdf' || cert.fileType === 'document';
                            return (
                              <a
                                key={index}
                                href={cert.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-400/20 via-purple-500/20 to-blue-600/20 backdrop-blur-sm rounded-xl border border-blue-400/30 hover:border-blue-400/50 transition-all duration-300"
                              >
                                {isPdf ? (
                                  <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                )}
                                <span className="text-blue-400 text-xs font-semibold truncate">
                                  {cert.fileName || `Certificate ${index + 1}`}
                                </span>
                              </a>
                            );
                          })}
                          {allCerts.length > 3 && (
                            <p className="text-xs text-slate-400 text-center">+{allCerts.length - 3} more</p>
                          )}
                        </div>
                      </div>
                      );
                    })()}

                    <div className="mt-auto">
                      <button
                        onClick={() => handleViewDetails(user._id)}
                        className="relative w-full py-4 px-8 bg-gradient-to-r from-emerald-400/90 via-green-500/90 to-teal-600/90 hover:from-emerald-500 hover:via-green-600 hover:to-teal-700 text-white font-bold text-base rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl overflow-hidden group/btn"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
                        <div className="relative flex items-center justify-center space-x-3">
                          <span>View Profile</span>
                          <svg
                            className="w-5 h-5 transform group-hover/btn:translate-x-1 transition-transform duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        </div>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-emerald-400/20 via-green-500/20 to-teal-600/20 backdrop-blur-sm rounded-full mb-8 border border-emerald-400/30">
                <svg
                  className="w-12 h-12 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 bg-clip-text text-transparent mb-4">
                No Results Found
              </h3>
              <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
                Try searching for different skills, names, or locations to find
                the perfect match.
              </p>
            </div>
          )}
        </div>

        {allUsers.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-emerald-400/20 via-green-500/20 to-teal-600/20 backdrop-blur-sm rounded-full mb-8 border border-emerald-400/30">
              <svg
                className="w-12 h-12 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 616 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 bg-clip-text text-transparent mb-4">
              No Users Found
            </h3>
            <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
              Be the pioneer! Add your skills and start building the community.
            </p>
            <button className="px-8 py-3 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 hover:from-emerald-500 hover:via-green-600 hover:to-teal-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              Add Your Skills
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
