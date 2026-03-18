// client/src/pages/ProfilePage.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import api, { BASE_URL } from "../utils/api";
import { showSuccess, showError } from "../utils/toast";
import { loginUser, updateUser } from "../redux/slices/authSlice";
import { setProfile, updateProfile } from "../redux/slices/userSlice";
import { fetchReviewStatsAsync } from "../redux/slices/reviewSlice";
import { fetchSmartMatches } from "../redux/slices/smartMatchSlice";
import EditProfile from "../components/profile/EditProfile";
import ProfileCard from "../components/profile/ProfileCard";
import SkillList from "../components/profile/SkillList";
import { useTheme } from "../hooks/useTheme";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const reviewStats = useSelector((state) => state.review.reviewStats);
  const { isDarkMode, bgClass, textClass, borderClass, cardClass } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const [form, setForm] = useState({
    name: "",
    email: "",
    bio: "",
    location: { city: "", country: "" },
    role: "",
    experienceLevel: "",
    availability: [],
    skillCertificates: [],
    certificates: [],
    certificatePreviews: [],
    skillShowcaseVideo: "",
    learningStyle: "",
    teachingStyle: "",
    linkedinUrl: "",
    twitterUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    languages: [],
    yearsOfExperience: 0,
  });

  const [videoFile, setVideoFile] = useState(null);
  const [removeVideo, setRemoveVideo] = useState(false);

  const [certificateFiles, setCertificateFiles] = useState([]);
  const [certificatePreviews, setCertificatePreviews] = useState([]);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    bio: "",
    location: { city: "", country: "" },
    role: "",
    experienceLevel: "",
    availability: [],
    skillCertificates: [],
    certificates: [],
    skillShowcaseVideo: "",
    learningStyle: "",
    teachingStyle: "",
    linkedinUrl: "",
    twitterUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    languages: [],
    yearsOfExperience: 0,
    createdAt: null,
  });
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({ matches: 0, completed: 0, receivedReviews: 0 });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const statsRes = await api.get("/users/dashboard-stats");
        setDashboardStats(statsRes.data);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };
    
    const loadData = () => {
      fetchDashboardStats();
      dispatch(fetchReviewStatsAsync());
    };
    
    loadData();
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showImageMenu && !e.target.closest('.image-menu-container')) {
        setShowImageMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showImageMenu]);
 
  useEffect(() => {
    if (isEditing) {
      setForm(prev => ({
        ...prev,
        certificates: profileData.certificates || [],
        skillCertificates: profileData.skillCertificates || [],
      }));
    }
  }, [isEditing, profileData.certificates, profileData.skillCertificates]);

  const openEditModal = () => {
    setForm(prev => ({
      ...prev,
      name: profileData.name || "",
      email: profileData.email || "",
      bio: profileData.bio || "",
      location: profileData.location || { city: "", country: "" },
      role: profileData.role || "",
      experienceLevel: profileData.experienceLevel || "",
      availability: profileData.availability || [],
      certificates: profileData.certificates || [],
      skillCertificates: profileData.skillCertificates || [],
      skillShowcaseVideo: profileData.skillShowcaseVideo || "",
      learningStyle: profileData.learningStyle || "",
      teachingStyle: profileData.teachingStyle || "",
      linkedinUrl: profileData.linkedinUrl || "",
      twitterUrl: profileData.twitterUrl || "",
      githubUrl: profileData.githubUrl || "",
      portfolioUrl: profileData.portfolioUrl || "",
      languages: profileData.languages || [],
      yearsOfExperience: profileData.yearsOfExperience || 0,
    }));
    setCertificateFiles([]);
    setCertificatePreviews([]);
    setVideoFile(null);
    setRemoveVideo(false);
    setIsEditing(true);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me");
        const userData = res.data;

        setForm({
          name: userData.name || "",
          email: userData.email || "",
          bio: userData.bio || "",
          location: userData.location || { city: "", country: "" },
          role: userData.role || "",
          experienceLevel: userData.experienceLevel || "",
          availability: userData.availability || [],
          certificates: userData.certificates || [],
          skillCertificates: userData.skillCertificates || [],
          skillShowcaseVideo: userData.skillShowcaseVideo || "",
          learningStyle: userData.learningStyle || "",
          teachingStyle: userData.teachingStyle || "",
          linkedinUrl: userData.linkedinUrl || "",
          twitterUrl: userData.twitterUrl || "",
          githubUrl: userData.githubUrl || "",
          portfolioUrl: userData.portfolioUrl || "",
          languages: userData.languages || [],
          yearsOfExperience: userData.yearsOfExperience || 0,
        });

        setProfileData({
          name: userData.name || "",
          email: userData.email || "",
          bio: userData.bio || "",
          location: userData.location || { city: "", country: "" },
          role: userData.role || "",
          experienceLevel: userData.experienceLevel || "",
          availability: userData.availability || [],
          certificates: userData.certificates || [],
          skillCertificates: userData.skillCertificates || [],
          skillShowcaseVideo: userData.skillShowcaseVideo || "",
          learningStyle: userData.learningStyle || "",
          teachingStyle: userData.teachingStyle || "",
          linkedinUrl: userData.linkedinUrl || "",
          twitterUrl: userData.twitterUrl || "",
          githubUrl: userData.githubUrl || "",
          portfolioUrl: userData.portfolioUrl || "",
          languages: userData.languages || [],
          yearsOfExperience: userData.yearsOfExperience || 0,
          createdAt: userData.createdAt || null,
        });

        dispatch(setProfile(userData));

        setSkills([
          ...(userData.teachSkills || []).map((s) => ({
            name: s.name,
            level: s.level,
            type: "teach",
          })),
          ...(userData.learnSkills || []).map((s) => ({
            name: s.name,
            level: s.level,
            type: "learn",
          })),
        ]);
      } catch (err) {
        showError("Failed to load user profile");
      }
    };

    fetchUser();
  }, [dispatch]);

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showError("Image size should be less than 5MB");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("profileImage", file);

      // We use the same /profile endpoint which now handles profileImage field
      const res = await api.put("/users/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      showSuccess("Profile picture updated");
      dispatch(updateUser(res.data));
      dispatch(updateProfile(res.data));
      dispatch(setProfile(res.data));
      
      // Update local state if needed
      setProfileData(prev => ({
        ...prev,
        profileImage: res.data.profileImage
      }));
      
      // Close modal if open
      setShowImageModal(false);
    } catch (err) {
      showError(err.response?.data?.message || "Failed to upload image");
    } finally {
      setLoading(false);
      // Reset file inputs
      const inputs = document.querySelectorAll('input[type="file"]');
      inputs.forEach(input => input.value = '');
    }
  };

  const handleRemoveProfileImage = async () => {
    setLoading(true);
    try {
      const res = await api.delete("/users/profile-image");
      showSuccess("Profile picture removed");
      dispatch(updateUser(res.data));
      dispatch(updateProfile(res.data));
      dispatch(setProfile(res.data));
      setProfileData(prev => ({
        ...prev,
        profileImage: res.data.profileImage
      }));
      setShowImageMenu(false);
    } catch (err) {
      showError(err.response?.data?.message || "Failed to remove image");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("bio", form.bio);
      // location is an object — send as JSON (backend will parse it)
      formData.append("location", JSON.stringify(form.location || {}));
      formData.append("role", form.role);
      formData.append("experienceLevel", form.experienceLevel || "");
      formData.append("learningStyle", form.learningStyle || "");
      formData.append("teachingStyle", form.teachingStyle || "");
      formData.append("linkedinUrl", form.linkedinUrl || "");
      formData.append("twitterUrl", form.twitterUrl || "");
      formData.append("githubUrl", form.githubUrl || "");
      formData.append("portfolioUrl", form.portfolioUrl || "");
      formData.append("yearsOfExperience", form.yearsOfExperience || 0);
      (form.availability || []).forEach((slot) => formData.append("availability", slot));
      (form.languages || []).forEach((lang) => formData.append("languages", lang));
      
      if (certificateFiles && certificateFiles.length > 0) {
        certificateFiles.forEach((file) => {
          formData.append("skillCertificates", file);
        });
      }
      if (videoFile) {
        formData.append("skillShowcaseVideo", videoFile);
      } else if (removeVideo) {
        formData.append("removeVideo", "true");
      }

      const res = await api.put("/users/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      showSuccess("Profile updated successfully");
      
      const userRes = await api.get("/users/me");
      const userData = userRes.data;
      console.log("Updated user data certificates:", userData.skillCertificates);
      
      setProfileData({
        name: userData.name || "",
        email: userData.email || "",
        bio: userData.bio || "",
        location: userData.location || { city: "", country: "" },
        role: userData.role || "",
        experienceLevel: userData.experienceLevel || "",
        availability: userData.availability || [],
        certificates: userData.certificates || [],
        skillCertificates: userData.skillCertificates || [],
        skillShowcaseVideo: userData.skillShowcaseVideo || "",
        learningStyle: userData.learningStyle || "",
        teachingStyle: userData.teachingStyle || "",
        linkedinUrl: userData.linkedinUrl || "",
        twitterUrl: userData.twitterUrl || "",
        githubUrl: userData.githubUrl || "",
        portfolioUrl: userData.portfolioUrl || "",
        languages: userData.languages || [],
        yearsOfExperience: userData.yearsOfExperience || 0,
        createdAt: userData.createdAt || null,
      });
      
      setForm({
        name: userData.name || "",
        email: userData.email || "",
        bio: userData.bio || "",
        location: userData.location || { city: "", country: "" },
        role: userData.role || "",
        experienceLevel: userData.experienceLevel || "",
        availability: userData.availability || [],
        certificates: userData.certificates || [],
        skillCertificates: userData.skillCertificates || [],
        skillShowcaseVideo: userData.skillShowcaseVideo || "",
        learningStyle: userData.learningStyle || "",
        teachingStyle: userData.teachingStyle || "",
        linkedinUrl: userData.linkedinUrl || "",
        twitterUrl: userData.twitterUrl || "",
        githubUrl: userData.githubUrl || "",
        portfolioUrl: userData.portfolioUrl || "",
        languages: userData.languages || [],
        yearsOfExperience: userData.yearsOfExperience || 0,
      });
      
      dispatch(updateProfile(userData));
      dispatch(setProfile(userData));
      dispatch(fetchSmartMatches({ refresh: true }));
      
      setCertificateFiles([]);
      setCertificatePreviews([]);
      setVideoFile(null);
      setRemoveVideo(false);
      setIsEditing(false);
      
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (err) {
      showError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCertificate = async (index) => {
    try {
      await api.delete(`/users/certificate/${index}`);
      const updatedCertificates = (profileData.certificates || []).filter((_, i) => i !== index);
      setProfileData({ ...profileData, certificates: updatedCertificates });
      setForm({ ...form, certificates: updatedCertificates });
      dispatch(setProfile({ ...user, certificates: updatedCertificates }));
      showSuccess("Certificate deleted successfully");
      
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (err) {
      showError("Failed to delete certificate");
    }
  };

  const handleRemoveCertificateFromForm = (index) => {
    const updatedCertificates = (form.certificates || []).filter((_, i) => i !== index);
    setForm({ ...form, certificates: updatedCertificates });
  };

  // teachSkills / learnSkills from local state (loaded on mount)
  const teachSkills = skills.filter(skill => skill.type === 'teach');
  const learnSkills = skills.filter(skill => skill.type === 'learn');

  // Also read directly from Redux user — SkillsPage dispatches updateProfile
  // after every add/remove, so these values are always fresh even cross-page.
  const reduxTeachSkills = user?.teachSkills || [];
  const reduxLearnSkills = user?.learnSkills || [];

  // Use whichever source has more data (handles both on-page and cross-page updates)
  const effectiveTeachCount = Math.max(teachSkills.length, reduxTeachSkills.length);
  const effectiveLearnCount = Math.max(learnSkills.length, reduxLearnSkills.length);

  // ── Star rating helpers ──────────────────────────────────────────────────────
  // 3 stars → Beginner (1) · Intermediate (2) · Advanced (3)
  const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
  const levelToStars = (level) => {
    if (!level) return 0;
    const idx = LEVELS.findIndex(l => l.toLowerCase() === level.toLowerCase());
    return idx === -1 ? 1 : idx + 1;  // default to 1 if unknown
  };

  // [skillName → hoverStar] so each card tracks its own hover independently
  const [hoverStars, setHoverStars] = useState({});

  // Update a skill's level via the new PATCH endpoint
  const updateSkillLevel = useCallback(async (skillName, newStars, type) => {
    const newLevel = LEVELS[newStars - 1];
    // Optimistic update
    setSkills(prev => prev.map(s =>
      s.name === skillName && s.type === type ? { ...s, level: newLevel } : s
    ));
    dispatch(updateProfile({
      ...(type === 'teach'
        ? { teachSkills: (user?.teachSkills || []).map(s => s.name === skillName ? { ...s, level: newLevel } : s) }
        : { learnSkills: (user?.learnSkills || []).map(s => s.name === skillName ? { ...s, level: newLevel } : s) }
      )
    }));
    try {
      await api.patch(`/skills/${type}/level?name=${encodeURIComponent(skillName)}`, { level: newLevel });
      showSuccess(`${skillName} updated to ${newLevel}`);
    } catch (err) {
      showError('Failed to update skill level');
      // Revert on error by re-fetching
      const res = await api.get('/users/me');
      setSkills([
        ...(res.data.teachSkills || []).map(s => ({ ...s, type: 'teach' })),
        ...(res.data.learnSkills || []).map(s => ({ ...s, type: 'learn' })),
      ]);
    }
  }, [dispatch, user]);

  // Star rater sub-component (defined inline to access updateSkillLevel)
  const StarRater = ({ skill, type, accentColor }) => {
    const currentStars = levelToStars(skill.level);
    const hovered = hoverStars[skill.name] ?? 0;
    const display = hovered || currentStars;
    const levelLabel = LEVELS[display - 1] || skill.level;
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-1">
          {[1, 2, 3].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => updateSkillLevel(skill.name, star, type)}
              onMouseEnter={() => setHoverStars(h => ({ ...h, [skill.name]: star }))}
              onMouseLeave={() => setHoverStars(h => ({ ...h, [skill.name]: 0 }))}
              className="relative p-0.5 rounded transition-transform duration-150 hover:scale-125 active:scale-95 focus:outline-none"
              title={LEVELS[star - 1]}
            >
              <svg
                className={`w-6 h-6 transition-all duration-150 drop-shadow ${
                  star <= display
                    ? 'text-yellow-400'
                    : 'text-gray-600/40'
                } ${star === display && hovered === 0 ? 'scale-110' : ''}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {star <= currentStars && hovered === 0 && (
                <span className="absolute inset-0 rounded-full bg-yellow-400/20 animate-ping pointer-events-none" />
              )}
            </button>
          ))}
        </div>
        <span className={`text-xs font-semibold ${accentColor} transition-all duration-200`}>
          {levelLabel}
        </span>
      </div>
    );
  };

  // ── Profile Completion ── dynamically computed from actual fields
  // Each filled field contributes equally; total = 11 checkpoints
  const profileCompletion = (() => {
    const checkpoints = [
      !!(profileData.name || user?.name),                          // name
      !!(profileData.bio || user?.bio),                            // bio
      !!(profileData.location || user?.location),                  // location
      !!(profileData.role || user?.role),                          // role
      effectiveTeachCount > 0,                                     // at least 1 teach skill
      effectiveLearnCount > 0,                                     // at least 1 learn skill
      (profileData.certificates?.length || profileData.skillCertificates?.length || 0) > 0,           // certificates
      !!(profileData.skillShowcaseVideo || user?.skillShowcaseVideo), // video
      !!(profileData.learningStyle || user?.learningStyle),        // learning style
      !!(profileData.teachingStyle || user?.teachingStyle),        // teaching style
      (profileData.languages?.length || user?.languages?.length || 0) > 0, // languages
    ];
    const filled = checkpoints.filter(Boolean).length;
    return Math.round((filled / checkpoints.length) * 100);
  })();

  // ── Member Since ── formatted from real createdAt
  const memberSince = (() => {
    const date = profileData.createdAt || user?.createdAt;
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  })();

  const tabs = [
    { id: 'overview', name: 'Overview', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
    { id: 'skills', name: 'Skills', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    )}
  ];

  const stats = [
    { 
      label: 'Skills to Teach', 
      value: teachSkills.length, 
      color: 'from-emerald-400 via-green-500 to-teal-600', 
      icon: '🎓',
      bgGlow: 'bg-emerald-500/15 border-emerald-400/25 shadow-emerald-500/20'
    },
    { 
      label: 'Skills to Learn', 
      value: learnSkills.length, 
      color: 'from-green-400 via-teal-500 to-emerald-600', 
      icon: '📚',
      bgGlow: 'bg-green-500/15 border-green-400/25 shadow-green-500/20'
    },
    { 
      label: 'Connections', 
      value: dashboardStats.completed || 0, 
      color: 'from-teal-400 via-emerald-500 to-green-600', 
      icon: '🤝',
      bgGlow: 'bg-teal-500/15 border-teal-400/25 shadow-teal-500/20'
    },
    { 
      label: 'Reviews', 
      value: reviewStats?.received?.totalReviews || dashboardStats.receivedReviews || 0, 
      color: 'from-emerald-300 via-green-400 to-teal-400', 
      icon: '⭐',
      bgGlow: 'bg-yellow-400/15 border-yellow-400/25 shadow-yellow-400/20'
    }
  ];

  return (
    <div className={`min-h-screen relative overflow-hidden transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-black via-gray-950 to-slate-950' 
        : 'bg-gradient-to-br from-slate-50 via-white to-emerald-50/50'
    }`}>
      {/* Enhanced Background Effects */}
      <div className={`fixed inset-0 overflow-hidden pointer-events-none transition-all duration-500 ${
        isDarkMode ? '' : 'opacity-0'
      }`}>
        {isDarkMode && (
          <>
            {/* Primary Orbs */}
            <div className="absolute -top-96 -right-96 w-[800px] h-[800px] bg-gradient-to-br from-emerald-400/3 via-green-500/2 to-teal-600/1 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-96 -left-96 w-[800px] h-[800px] bg-gradient-to-tr from-green-400/2 via-teal-500/2 to-emerald-600/1 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-teal-400/2 via-emerald-500/1 to-green-600/1 rounded-full blur-2xl animate-pulse delay-500"></div>
            
            {/* Secondary Accent Orbs */}
            <div className="absolute top-20 right-20 w-[300px] h-[300px] bg-gradient-to-bl from-emerald-300/2 via-green-400/2 to-teal-400/1 rounded-full blur-2xl animate-pulse delay-2000"></div>
            <div className="absolute bottom-40 left-40 w-[200px] h-[200px] bg-gradient-to-tr from-green-300/2 via-emerald-400/1 to-teal-300/1 rounded-full blur-xl animate-pulse delay-3000"></div>
            
            {/* Floating Particles */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-ping opacity-20"
                style={{
                  background: `linear-gradient(45deg, 
                    ${i % 3 === 0 ? 'rgba(52, 211, 153, 0.15)' : 
                      i % 3 === 1 ? 'rgba(34, 197, 94, 0.15)' : 
                      'rgba(20, 184, 166, 0.15)'}
                  )`,
                  top: `${10 + (i * 6)}%`,
                  left: `${5 + (i * 6.5)}%`,
                  animationDelay: `${i * 0.8}s`,
                  animationDuration: '4s'
                }}
              />
            ))}

            {/* Animated Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.01]" style={{
              backgroundImage: `
                linear-gradient(rgba(52, 211, 153, 0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(52, 211, 153, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
              animation: 'gridMove 15s linear infinite'
            }}></div>
          </>
        )}
      </div>

      <div className="relative z-10 p-5 lg:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Main Profile Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {/* Enhanced Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-gray-800/70 via-slate-800/60 to-gray-900/70 backdrop-blur-xl rounded-2xl border border-emerald-500/20 p-6 shadow-xl hover:shadow-emerald-500/15 transition-all duration-500 hover:border-emerald-400/30 relative overflow-hidden group">
                {/* Card Background Animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-green-500/2 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                
                <div className="text-center relative z-10">
                  <div className="relative inline-block mb-5 image-menu-container">
                    <div 
                      className="w-28 h-28 bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 rounded-full flex items-center justify-center text-slate-950 text-4xl font-bold shadow-lg relative overflow-hidden group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={() => setShowImageMenu(!showImageMenu)}
                    >
                      {user?.profileImage ? (
                        <img 
                          src={user.profileImage} 
                          alt={user.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-r from-black/0 via-black/15 to-black/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                          <span className="relative z-10">
                            {profileData?.name?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || "U"}
                          </span>
                        </>
                      )}
                      {/* Animated Ring */}
                      <div className="absolute inset-0 rounded-full border-2 border-black/10 animate-spin" style={{animationDuration: '6s'}}></div>
                    </div>
                    
                    {/* Camera Icon Overlay / Button */}
                    <label 
                      htmlFor="profile-upload"
                      className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full border-2 border-gray-800 flex items-center justify-center shadow-md shadow-emerald-500/30 cursor-pointer hover:scale-110 transition-transform duration-200 z-20 group/camera"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="w-4 h-4 text-slate-900 group-hover/camera:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="absolute inset-0 rounded-full bg-emerald-400/25 animate-ping group-hover:animate-none"></div>
                    </label>
                    <input 
                      id="profile-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleProfileImageChange}
                    />

                    {/* Image Options Dropdown Menu */}
                    {showImageMenu && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-gray-800/95 backdrop-blur-xl rounded-xl border border-emerald-500/20 shadow-xl shadow-emerald-500/10 overflow-hidden z-50">
                        <div className="py-1">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              document.getElementById('profile-upload-menu').click();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-300 cursor-pointer transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm font-medium">Upload New Photo</span>
                          </button>
                          <input 
                            id="profile-upload-menu" 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleProfileImageChange}
                          />
                          
                          {user?.profileImage && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowImageMenu(false);
                                  setShowImageModal(true);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-300 transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span className="text-sm font-medium">View & Adjust</span>
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveProfileImage();
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span className="text-sm font-medium">Remove Photo</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center relative z-10">
                    {user?.role && (
                      <div className="flex items-center justify-center space-x-2 mb-4 p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span className="text-emerald-400 text-sm font-medium capitalize">{user?.role}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={openEditModal}
                    className="w-full py-3 px-6 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 hover:from-emerald-500 hover:via-green-600 hover:to-teal-700 text-slate-950 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/30 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-black/0 via-black/10 to-black/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                    <span className="relative z-10 flex items-center justify-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit Profile</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map((stat, index) => (
                  <div
                    key={stat.label}
                    className={`bg-gradient-to-br from-gray-800/80 via-slate-800/70 to-gray-900/80 backdrop-blur-xl rounded-2xl border ${stat.bgGlow} p-6 text-center hover:border-opacity-50 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl group relative overflow-hidden`}
                    style={{ 
                      animationDelay: `${index * 150}ms`,
                      animation: 'fadeInUp 0.6s ease-out forwards'
                    }}
                  >
                    {/* Card Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200/3 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-2xl"></div>
                    
                    <div className="relative z-10">
                      <div className="text-3xl mb-3 transform group-hover:scale-110 transition-transform duration-300 filter drop-shadow-md">
                        {stat.icon}
                      </div>
                      <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2 group-hover:text-4xl transition-all duration-300`}>
                        {stat.value}
                      </div>
                      <div className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors duration-300 font-medium uppercase tracking-wide">
                        {stat.label}
                      </div>
                    </div>
                    
                    {/* Floating Background Elements */}
                    <div className="absolute top-1 right-1 w-6 h-6 bg-slate-100/3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-bounce"></div>
                    <div className="absolute bottom-1 left-1 w-4 h-4 bg-slate-100/2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-bounce delay-100"></div>
                  </div>
                ))}
              </div>

              {/* Enhanced Navigation Tabs */}
              <div className="bg-gradient-to-r from-gray-800/80 via-slate-800/70 to-gray-900/80 backdrop-blur-xl rounded-2xl border border-slate-600/40 p-3 mb-6 shadow-xl hover:shadow-emerald-500/8 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/1 via-green-500/1 to-teal-500/1 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                
                <div className="flex space-x-3 relative z-10">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center space-x-2 py-3 px-5 rounded-xl font-semibold transition-all duration-500 transform hover:scale-105 relative overflow-hidden group ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 text-gray-950 shadow-lg shadow-emerald-500/40 border border-gray-950/10'
                          : 'text-slate-300 bg-gradient-to-r from-gray-800/80 via-slate-800/70 to-gray-900/80 hover:text-slate-100 hover:bg-gradient-to-r hover:from-slate-700/60 hover:to-gray-700/60 hover:shadow-md border border-slate-600/25 hover:border-slate-500/40'
                      }`}
                    >
                      {activeTab === tab.id && (
                        <div className="absolute inset-0 bg-gradient-to-r from-black/0 via-black/15 to-black/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      )}
                      <div className="relative z-10 flex items-center space-x-2">
                        <div className={`transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-105'}`}>
                          {tab.icon}
                        </div>
                        <span>{tab.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Content Based on Active Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Enhanced Quick Stats */}
              <div className="bg-gradient-to-br from-gray-800/70 via-slate-800/60 to-gray-900/70 backdrop-blur-xl rounded-2xl border border-emerald-500/25 p-6 shadow-xl hover:shadow-emerald-500/15 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-teal-500/2 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                
                <h3 className="text-2xl font-bold text-slate-100 mb-6 flex items-center space-x-3 relative z-10">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-md shadow-emerald-500/30">
                    <svg className="w-4 h-4 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-green-400 bg-clip-text text-transparent">Profile Overview</span>
                </h3>
                
                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-500/12 to-teal-500/8 rounded-xl border border-emerald-500/25 hover:border-emerald-400/40 transition-all duration-300 hover:shadow-md hover:shadow-emerald-500/15">
                    <span className="text-slate-200 font-medium">Profile Completion</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2.5 bg-slate-700 rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-green-500 rounded-full shadow-sm transition-all duration-700 ease-out"
                          style={{ width: `${profileCompletion}%` }}
                        />
                      </div>
                      <span className={`font-bold text-sm tabular-nums ${
                        profileCompletion === 100 ? 'text-emerald-300' :
                        profileCompletion >= 70  ? 'text-emerald-400' :
                        profileCompletion >= 40  ? 'text-yellow-400'  : 'text-red-400'
                      }`}>{profileCompletion}%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-500/12 to-emerald-500/8 rounded-xl border border-green-500/25 hover:border-green-400/40 transition-all duration-300 hover:shadow-md hover:shadow-green-500/15">
                    <span className="text-slate-200 font-medium">Skills Added</span>
                    <span className="text-green-400 font-semibold">{effectiveTeachCount + effectiveLearnCount} skills</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-teal-500/12 to-green-500/8 rounded-xl border border-teal-500/25 hover:border-teal-400/40 transition-all duration-300 hover:shadow-md hover:shadow-teal-500/15">
                    <span className="text-slate-200 font-medium">Member Since</span>
                    <span className="text-teal-400 font-semibold">{memberSince}</span>
                  </div>



                  {/* Certificates section — uses new structured format */}
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
                      <div className="mt-4">
                        <p className="text-slate-200 font-medium mb-2">Skill Certificates ({allCerts.length})</p>
                        <div className="space-y-2">
                          {allCerts.map((cert, index) => {
                            const isPdf = cert.fileType === 'pdf' || cert.fileType === 'document';
                            return (
                              <div
                                key={index}
                                className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-500/12 to-purple-500/8 rounded-xl border border-blue-500/25 hover:border-blue-400/40 transition-all duration-300"
                              >
                                {/* Thumbnail or PDF icon */}
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  {isPdf ? (
                                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                      <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  ) : (
                                    <img
                                      src={cert.fileUrl}
                                      alt={cert.fileName}
                                      className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                                      loading="lazy"
                                    />
                                  )}
                                  <span className="text-slate-300 text-sm truncate">
                                    {cert.fileName || `Certificate ${index + 1}`}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 ml-2">
                                  <a
                                    href={cert.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 font-semibold hover:text-blue-300 flex items-center gap-1 text-sm"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    {isPdf ? 'Open PDF' : 'View'}
                                  </a>
                                  <button
                                    onClick={() => handleDeleteCertificate(index)}
                                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition duration-200"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Enhanced Recent Activity */}
              <div className="bg-gradient-to-br from-gray-800/70 via-slate-800/60 to-gray-900/70 backdrop-blur-xl rounded-2xl border border-green-500/25 p-6 shadow-xl hover:shadow-green-500/15 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-teal-500/2 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                
                <h3 className="text-2xl font-bold text-slate-100 mb-6 flex items-center space-x-3 relative z-10">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-teal-500 rounded-lg flex items-center justify-center shadow-md shadow-green-500/30">
                    <svg className="w-4 h-4 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="bg-gradient-to-r from-green-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">Recent Activity</span>
                </h3>
                
                <div className="space-y-4 relative z-10">
                  {/* Showcase Video Section */}
                  {user?.skillShowcaseVideo && (
                    <div className="mb-6 rounded-2xl overflow-hidden border border-emerald-500/30 bg-black/40 group/video relative">
                      <video 
                        src={user.skillShowcaseVideo} 
                        className="w-full aspect-video object-cover" 
                        controls
                      />
                      <div className="absolute top-2 left-2 px-2 py-1 bg-emerald-500/80 backdrop-blur-md rounded text-[10px] font-bold text-slate-900 uppercase">
                        Showcase Video
                      </div>
                    </div>
                  )}

                  {[
                    { icon: '🎯', bg: 'from-emerald-500/15 to-green-500/8', border: 'border-emerald-500/25', text: 'Profile updated', time: '2 hours ago', color: 'text-emerald-400' },
                    { icon: '📚', bg: 'from-green-500/15 to-teal-500/8', border: 'border-green-500/25', text: 'New skill added', time: '1 day ago', color: 'text-green-400' },
                    { icon: '🤝', bg: 'from-teal-500/15 to-emerald-500/8', border: 'border-teal-500/25', text: 'New connection', time: '3 days ago', color: 'text-teal-400' }
                  ].map((activity, index) => (
                    <div key={index} className={`flex items-center space-x-4 p-4 bg-gradient-to-r ${activity.bg} rounded-xl border ${activity.border} hover:border-opacity-50 transition-all duration-300 hover:shadow-md hover:-translate-y-1 group`}>
                      <div className={`w-10 h-10 bg-gradient-to-r ${activity.bg} rounded-full flex items-center justify-center shadow-md border ${activity.border} group-hover:scale-110 transition-transform duration-300`}>
                        <span className="text-lg">{activity.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-100 font-medium">{activity.text}</p>
                        <p className={`${activity.color} text-sm font-medium`}>{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Enhanced Teaching Skills */}
              <div className="bg-gradient-to-br from-gray-800/80 via-slate-800/70 to-gray-900/80 backdrop-blur-xl rounded-3xl border border-emerald-500/30 p-8 shadow-2xl hover:shadow-emerald-500/25 transition-all duration-500 relative overflow-hidden group hover:border-emerald-400/50">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-green-500/3 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"></div>
                
                {/* Header */}
                <div className="relative z-10 mb-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden group-hover:scale-110 transition-transform duration-300">
                        <div className="absolute inset-0 bg-gradient-to-r from-black/0 via-black/15 to-black/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        <svg className="w-7 h-7 text-slate-950 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-black bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">Skills I Teach</h3>
                      <p className="text-slate-400 font-medium mt-1">Share your expertise with others</p>
                    </div>
                  </div>
                  
                  {/* Skills Counter */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500/15 via-green-500/10 to-teal-500/8 rounded-2xl border border-emerald-500/30">
                    <span className="text-slate-200 font-semibold">Teaching Skills</span>
                    <div className="px-4 py-2 bg-gradient-to-r from-emerald-400 to-green-500 rounded-xl text-slate-950 font-bold shadow-sm">
                      {teachSkills.length}
                    </div>
                  </div>
                </div>
                
                {teachSkills.length > 0 ? (
                  <div className="space-y-4 relative z-10">
                    {teachSkills.map((skill, index) => (
                      <div
                        key={index}
                        className="group/skill p-6 bg-gradient-to-r from-emerald-500/15 via-green-500/12 to-teal-500/8 border border-emerald-500/30 rounded-2xl hover:from-emerald-500/25 hover:via-green-500/20 hover:to-teal-500/15 hover:border-emerald-400/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/25 relative overflow-hidden"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-emerald-400/3 to-emerald-400/0 -translate-x-full group-hover/skill:translate-x-full transition-transform duration-1000 rounded-2xl" />
                        <div className="flex justify-between items-center relative z-10">
                          <span className="text-slate-100 font-bold text-lg group-hover/skill:text-emerald-200 transition-colors duration-300">
                            {skill.name}
                          </span>
                          <StarRater skill={skill} type="teach" accentColor="text-emerald-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-r from-emerald-500/20 via-green-500/15 to-teal-500/12 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-slate-300 mb-3">No Teaching Skills Yet</h4>
                    <p className="text-slate-400 mb-6 leading-relaxed">Share your knowledge and help others grow</p>
                    <button className="px-6 py-3 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 hover:from-emerald-500 hover:via-green-600 hover:to-teal-700 text-slate-950 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/30">
                      Add Teaching Skills
                    </button>
                  </div>
                )}
              </div>

              {/* Enhanced Learning Skills */}
              <div className="bg-gradient-to-br from-gray-800/80 via-slate-800/70 to-gray-900/80 backdrop-blur-xl rounded-3xl border border-teal-500/30 p-8 shadow-2xl hover:shadow-teal-500/25 transition-all duration-500 relative overflow-hidden group hover:border-teal-400/50">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-green-500/3 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"></div>
                
                {/* Header */}
                <div className="relative z-10 mb-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-teal-400 via-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden group-hover:scale-110 transition-transform duration-300">
                        <div className="absolute inset-0 bg-gradient-to-r from-black/0 via-black/15 to-black/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        <svg className="w-7 h-7 text-slate-950 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-black bg-gradient-to-r from-teal-400 via-green-400 to-emerald-400 bg-clip-text text-transparent">Skills I Want to Learn</h3>
                      <p className="text-slate-400 font-medium mt-1">Expand your knowledge and grow</p>
                    </div>
                  </div>
                  
                  {/* Skills Counter */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-500/15 via-green-500/10 to-emerald-500/8 rounded-2xl border border-teal-500/30">
                    <span className="text-slate-200 font-semibold">Learning Goals</span>
                    <div className="px-4 py-2 bg-gradient-to-r from-teal-400 to-green-500 rounded-xl text-slate-950 font-bold shadow-sm">
                      {learnSkills.length}
                    </div>
                  </div>
                </div>
                
                {learnSkills.length > 0 ? (
                  <div className="space-y-4 relative z-10">
                    {learnSkills.map((skill, index) => (
                      <div
                        key={index}
                        className="group/skill p-6 bg-gradient-to-r from-teal-500/15 via-green-500/12 to-emerald-500/8 border border-teal-500/30 rounded-2xl hover:from-teal-500/25 hover:via-green-500/20 hover:to-emerald-500/15 hover:border-teal-400/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-500/25 relative overflow-hidden"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-400/0 via-teal-400/3 to-teal-400/0 -translate-x-full group-hover/skill:translate-x-full transition-transform duration-1000 rounded-2xl" />
                        <div className="flex justify-between items-center relative z-10">
                          <span className="text-slate-100 font-bold text-lg group-hover/skill:text-teal-200 transition-colors duration-300">
                            {skill.name}
                          </span>
                          <StarRater skill={skill} type="learn" accentColor="text-teal-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-r from-teal-500/20 via-green-500/15 to-emerald-500/12 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-10 h-10 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-slate-300 mb-3">No Learning Goals Yet</h4>
                    <p className="text-slate-400 mb-6 leading-relaxed">Start your learning journey today</p>
                    <button className="px-6 py-3 bg-gradient-to-r from-teal-400 via-green-500 to-emerald-600 hover:from-teal-500 hover:via-green-600 hover:to-emerald-700 text-slate-950 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-teal-500/30">
                      Add Learning Goals
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="bg-gradient-to-br from-gray-800/70 via-slate-800/60 to-gray-900/70 backdrop-blur-xl rounded-2xl border border-emerald-500/25 p-6 shadow-xl text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-teal-500/2 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
              
              <div className="py-16 relative z-10">
                <div className="w-24 h-24 bg-gradient-to-r from-emerald-400/15 via-teal-500/12 to-green-600/8 rounded-full flex items-center justify-center mx-auto mb-6 relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/25 via-teal-500/15 to-green-600/25 rounded-full animate-ping"></div>
                  <svg className="w-12 h-12 text-emerald-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                
                <h3 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-green-400 bg-clip-text text-transparent mb-4">Activity Timeline</h3>
                <p className="text-slate-300 text-lg mb-4 leading-relaxed">
                  Your learning journey and achievements will appear here
                </p>
                <p className="text-slate-400 mb-8">
                  Start connecting with others and building your skill portfolio
                </p>
                
                <button className="px-10 py-3 bg-gradient-to-r from-emerald-400 via-teal-500 to-green-600 hover:from-emerald-500 hover:via-teal-600 hover:to-green-700 text-slate-950 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/30 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/0 via-black/10 to-black/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                  <span className="relative z-10 flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Start Your Journey</span>
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Enhanced Edit Profile Modal */}
          {isEditing && (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-gradient-to-br from-gray-800/90 via-slate-800/85 to-gray-900/90 backdrop-blur-xl rounded-2xl border border-emerald-500/25 p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-xl shadow-emerald-500/15 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/2 via-green-500/1 to-teal-500/2 rounded-2xl"></div>
                
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">Edit Profile</h3>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-700/40 rounded-xl transition-all duration-300 hover:rotate-90 hover:scale-110"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="relative z-10">
                  <EditProfile
                    key={isEditing}
                    form={form}
                    setForm={setForm}
                    onSubmit={handleSubmit}
                    loading={loading}
                    theme="dark"
                    certificateFiles={certificateFiles}
                    setCertificateFiles={setCertificateFiles}
                    certificatePreviews={certificatePreviews}
                    setCertificatePreviews={setCertificatePreviews}
                    onDeleteCertificate={handleDeleteCertificate}
                    onRemoveCertificate={handleRemoveCertificateFromForm}
                    videoFile={videoFile}
                    setVideoFile={setVideoFile}
                    removeVideo={removeVideo}
                    setRemoveVideo={setRemoveVideo}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(40px, 40px); }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>

      {/* Image View/Edit Modal */}
      {showImageModal && user?.profileImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
          
          {/* Modal Content */}
          <div 
            className="relative bg-gray-900/95 backdrop-blur-xl rounded-3xl border border-emerald-500/20 shadow-2xl shadow-emerald-500/10 max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800/50">
              <h3 className="text-xl font-bold text-white">Profile Photo</h3>
              <button 
                onClick={() => setShowImageModal(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Image Container */}
            <div className="p-6 flex justify-center">
              <div className="relative w-80 h-80 rounded-2xl overflow-hidden border-2 border-emerald-500/30 shadow-lg">
                <img 
                  src={user.profileImage} 
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center justify-center gap-4 p-6 border-t border-gray-800/50">
              <label 
                htmlFor="profile-upload-modal"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 hover:from-emerald-500 hover:via-green-600 hover:to-teal-700 text-slate-950 font-semibold rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Change Photo</span>
              </label>
              <input 
                id="profile-upload-modal" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleProfileImageChange}
              />
              
              <button
                onClick={() => {
                  setShowImageModal(false);
                  handleRemoveProfileImage();
                }}
                className="flex items-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold rounded-xl border border-red-500/30 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}