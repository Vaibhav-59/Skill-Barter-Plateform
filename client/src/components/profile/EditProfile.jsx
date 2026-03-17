// client/src/components/profile/EditProfile.jsx
import React, { useRef } from "react";
import Spinner from "../common/Spinner";

const AVAILABILITY_SLOTS = [
  { id: "morning",   label: "Morning",   icon: "🌅" },
  { id: "afternoon", label: "Afternoon", icon: "☀️" },
  { id: "evening",   label: "Evening",   icon: "🌆" },
  { id: "night",     label: "Night",     icon: "🌙" },
  { id: "weekdays",  label: "Weekdays",  icon: "📅" },
  { id: "weekends",  label: "Weekends",  icon: "🎉" },
  { id: "flexible",  label: "Flexible",  icon: "⚡" },
];

const EXPERIENCE_LEVELS = [
  {
    id: "beginner",
    label: "Beginner",
    icon: "🌱",
    desc: "Just starting out",
    gradient: "from-blue-500/20 to-indigo-500/15",
    border: "border-blue-400/40",
    active: "border-blue-400 bg-blue-500/20 shadow-blue-500/20",
    text: "text-blue-300",
  },
  {
    id: "intermediate",
    label: "Intermediate",
    icon: "⚡",
    desc: "Comfortable & growing",
    gradient: "from-emerald-500/20 to-teal-500/15",
    border: "border-emerald-400/40",
    active: "border-emerald-400 bg-emerald-500/20 shadow-emerald-500/20",
    text: "text-emerald-300",
  },
  {
    id: "advanced",
    label: "Advanced",
    icon: "🔥",
    desc: "Expert level mastery",
    gradient: "from-orange-500/20 to-red-500/15",
    border: "border-orange-400/40",
    active: "border-orange-400 bg-orange-500/20 shadow-orange-500/20",
    text: "text-orange-300",
  },
];

export default function EditProfile({
  form,
  setForm,
  onSubmit,
  loading = false,
  theme = "light",
  certificateFiles,
  setCertificateFiles,
  certificatePreviews,
  setCertificatePreviews,
  onDeleteCertificate,
  onRemoveCertificate,
  videoFile,
  setVideoFile,
  removeVideo,
  setRemoveVideo,
}) {
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const isDark = theme === "dark";

  const [existingCerts, setExistingCerts] = React.useState(form.certificates || form.skillCertificates || []);
  const [deletedCertIndices, setDeletedCertIndices] = React.useState([]);
  const [langInput, setLangInput] = React.useState("");

  React.useEffect(() => {
    setExistingCerts(form.certificates || form.skillCertificates || []);
    setDeletedCertIndices([]);
  }, [form.certificates, form.skillCertificates]);

  // ── Helpers ─────────────────────────────────────────────────────────
  const location = form.location || {};
  const setLocation = (key, val) =>
    setForm({ ...form, location: { ...location, [key]: val } });

  const availability = form.availability || [];
  const toggleAvailability = (slot) => {
    const updated = availability.includes(slot)
      ? availability.filter((s) => s !== slot)
      : [...availability, slot];
    setForm({ ...form, availability: updated });
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newPreviews = files.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
          })
      );
      Promise.all(newPreviews).then((results) => {
        setCertificateFiles((prev) => [...prev, ...files]);
        setCertificatePreviews((prev) => [...prev, ...results]);
      });
    }
    e.target.value = "";
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 105000000) return alert("Video should be around 100MB maximum");
      setVideoFile(file);
      setRemoveVideo(false);
    }
    e.target.value = "";
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    setRemoveVideo(true);
  };

  const handleAddLanguage = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = langInput.trim();
      if (val && !(form.languages || []).includes(val)) {
        setForm({ ...form, languages: [...(form.languages || []), val] });
      }
      setLangInput("");
    }
  };

  const removeLanguage = (idx) => {
    const newLangs = [...(form.languages || [])];
    newLangs.splice(idx, 1);
    setForm({ ...form, languages: newLangs });
  };

  const handleDeleteFile = (index) => {
    setCertificateFiles(certificateFiles.filter((_, i) => i !== index));
    setCertificatePreviews((certificatePreviews || []).filter((_, i) => i !== index));
  };

  const handleDeleteExistingCert = async (cert, index) => {
    try {
      setDeletedCertIndices([...deletedCertIndices, index]);
      setExistingCerts(existingCerts.filter((_, i) => i !== index));
      if (onDeleteCertificate) await onDeleteCertificate(index);
    } catch {
      setExistingCerts([...existingCerts]);
      setDeletedCertIndices(deletedCertIndices.filter((i) => i !== index));
    }
  };

  // ── Styles ───────────────────────────────────────────────────────────
  const inputCls =
    "w-full px-4 py-3 border border-gray-600/60 rounded-xl focus:ring-2 focus:ring-emerald-400/60 focus:border-emerald-400/60 bg-gray-800/60 text-white placeholder-gray-500 transition duration-200 outline-none backdrop-blur-sm";
  const labelCls = "block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2";
  const sectionCls =
    "bg-gray-800/40 rounded-2xl border border-gray-700/50 p-5 space-y-4";

  return (
    <form onSubmit={onSubmit} className="space-y-5 max-w-lg mx-auto" encType="multipart/form-data">

      {/* ── Personal Info ─────────────────────────────────────────────── */}
      <div className={sectionCls}>
        <h4 className="text-emerald-400 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
          <span>👤</span> Personal Info
        </h4>

        {/* Name */}
        <div>
          <label className={labelCls}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Full Name
          </label>
          <input
            id="name" type="text" placeholder="Your full name"
            className={inputCls} value={form.name || ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        {/* Email */}
        <div>
          <label className={labelCls}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email Address
          </label>
          <input
            id="email" type="email"
            className={`${inputCls} opacity-50 cursor-not-allowed`}
            value={form.email || ""} disabled
          />
        </div>

        {/* Role */}
        <div>
          <label className={labelCls}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Role / Title
          </label>
          <input
            id="role" type="text" placeholder="e.g., Developer, Designer, Teacher"
            className={inputCls} value={form.role || ""}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          />
        </div>

        {/* Bio */}
        <div>
          <label className={labelCls}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            Bio
          </label>
          <textarea
            id="bio" rows={3}
            placeholder="Tell others about yourself — your interests, goals, and what you can teach or learn."
            value={form.bio || ""}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className={inputCls}
          />
        </div>
      </div>

      {/* ── Expertise & Education ─────────────────────────────────────────────── */}
      <div className={sectionCls}>
        <h4 className="text-emerald-400 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
          <span>🎓</span> Expertise
        </h4>

        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className={labelCls}>Learning Style</label>
            <select
              className={inputCls}
              value={form.learningStyle || ""}
              onChange={(e) => setForm({ ...form, learningStyle: e.target.value })}
            >
              <option value="">Select learning style...</option>
              <option value="Visual">Visual</option>
              <option value="Auditory">Auditory</option>
              <option value="Reading/Writing">Reading/Writing</option>
              <option value="Hands-on">Hands-on</option>
              <option value="Interactive">Interactive</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Teaching Style</label>
            <select
              className={inputCls}
              value={form.teachingStyle || ""}
              onChange={(e) => setForm({ ...form, teachingStyle: e.target.value })}
            >
              <option value="">Select teaching style...</option>
              <option value="Hands-on">Hands-on</option>
              <option value="Lecture-based">Lecture-based</option>
              <option value="Project-based">Project-based</option>
              <option value="Step-by-step guidance">Step-by-step guidance</option>
              <option value="Discussion-based">Discussion-based</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
           <div>
            <label className={labelCls}>Years of Experience</label>
            <input
              type="number" min="0" placeholder="e.g. 3"
              className={inputCls} value={form.yearsOfExperience || ""}
              onChange={(e) => setForm({ ...form, yearsOfExperience: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Languages Known</label>
            <input
              type="text" placeholder="Type and press Enter (e.g., English)"
              className={inputCls} value={langInput}
              onChange={(e) => setLangInput(e.target.value)}
              onKeyDown={handleAddLanguage}
            />
            {form.languages?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.languages.map((lang, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-700/60 rounded text-sm text-gray-200 flex items-center gap-1">
                    {lang}
                    <button type="button" onClick={() => removeLanguage(idx)} className="text-gray-400 hover:text-red-400">&times;</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Social Media Links ────────────────────────────────────────────────── */}
      <div className={sectionCls}>
        <h4 className="text-emerald-400 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
          <span>🔗</span> Social Links
        </h4>
        <div className="space-y-3">
          <div>
            <label className={labelCls}>LinkedIn Profile</label>
            <input type="url" placeholder="https://linkedin.com/in/username" className={inputCls} value={form.linkedinUrl || ""} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Twitter / X</label>
            <input type="url" placeholder="https://twitter.com/username" className={inputCls} value={form.twitterUrl || ""} onChange={(e) => setForm({ ...form, twitterUrl: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>GitHub Profile</label>
            <input type="url" placeholder="https://github.com/username" className={inputCls} value={form.githubUrl || ""} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Portfolio Website</label>
            <input type="url" placeholder="https://yourwebsite.com" className={inputCls} value={form.portfolioUrl || ""} onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })} />
          </div>
        </div>
      </div>

      {/* ── Location ──────────────────────────────────────────────────── */}
      <div className={sectionCls}>
        <h4 className="text-emerald-400 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
          <span>📍</span> Location
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>City</label>
            <input
              type="text" placeholder="e.g., Vadodara"
              className={inputCls}
              value={location.city || ""}
              onChange={(e) => setLocation("city", e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Country</label>
            <input
              type="text" placeholder="e.g., India"
              className={inputCls}
              value={location.country || ""}
              onChange={(e) => setLocation("country", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Experience Level ───────────────────────────────────────────── */}
      <div className={sectionCls}>
        <h4 className="text-emerald-400 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
          <span>🏆</span> Experience Level
        </h4>
        <p className="text-gray-400 text-xs">Your overall skill / experience level</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {EXPERIENCE_LEVELS.map((lvl) => {
            const isActive = (form.experienceLevel || "").toLowerCase() === lvl.id.toLowerCase();
            return (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setForm({ ...form, experienceLevel: isActive ? "" : lvl.id })}
                className={`relative p-3 sm:p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center text-center
                  bg-gradient-to-br ${lvl.gradient}
                  ${isActive ? `${lvl.active} shadow-lg scale-[1.03]` : `${lvl.border} hover:scale-[1.02] hover:border-opacity-70`}
                `}
              >
                {isActive && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-emerald-400 rounded-full flex items-center justify-center shadow-sm">
                    <svg className="w-2.5 h-2.5 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div className="text-2xl mb-1">{lvl.icon}</div>
                <div className={`font-bold text-sm ${isActive ? lvl.text : "text-slate-300"}`}>{lvl.label}</div>
                <div className="text-gray-500 text-xs mt-0.5 max-w-[90%] leading-tight text-balance">{lvl.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Availability ───────────────────────────────────────────────── */}
      <div className={sectionCls}>
        <h4 className="text-emerald-400 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
          <span>🕐</span> Availability
        </h4>
        <p className="text-gray-400 text-xs">Pick all slots when you're free to barter skills</p>
        <div className="flex flex-wrap gap-2">
          {AVAILABILITY_SLOTS.map((slot) => {
            const isActive = availability.includes(slot.id);
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => toggleAvailability(slot.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-200
                  ${isActive
                    ? "bg-emerald-500/20 border-emerald-400/70 text-emerald-300 shadow-md shadow-emerald-500/15 scale-[1.04]"
                    : "bg-gray-700/40 border-gray-600/50 text-gray-400 hover:border-gray-500 hover:text-gray-300 hover:scale-[1.02]"
                  }`}
              >
                <span>{slot.icon}</span>
                <span>{slot.label}</span>
                {isActive && (
                  <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
        {availability.length > 0 && (
          <p className="text-xs text-emerald-400/70 mt-1">
            ✓ {availability.length} slot{availability.length > 1 ? "s" : ""} selected
          </p>
        )}
      </div>

      {/* ── Skill Certificates ─────────────────────────────────────────── */}
      <div className={sectionCls}>
        <h4 className="text-emerald-400 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
          <span>🏅</span> Skill Certificates
        </h4>

        <input
          ref={fileInputRef} id="skillCertificate"
          type="file" accept="image/*,.pdf" multiple
          onChange={handleFileSelect} className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="w-full py-3 px-4 border-2 border-dashed border-emerald-500/40 hover:border-emerald-400/70 rounded-xl text-emerald-400 hover:text-emerald-300 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload Certificate / Image
        </button>

        {((certificateFiles?.length || 0) + (existingCerts?.length || 0)) > 0 && (
          <div className="space-y-2 mt-1">
            {existingCerts.map((cert, i) => {
              // Support both new format (object with fileUrl/fileType/fileName) and old format (plain string)
              const isObject = cert && typeof cert === "object" && cert.fileUrl;
              const certUrl = isObject ? cert.fileUrl : cert;
              const certType = isObject ? cert.fileType : (certUrl?.toLowerCase().endsWith(".pdf") ? "pdf" : "image");
              const certName = isObject ? cert.fileName : (certUrl?.split("/").pop() || "Certificate");
              const isPdf = certType === "pdf" || certType === "document";

              return (
                <div key={`ex-${i}`} className="flex items-center gap-3 p-3 bg-gray-700/40 rounded-xl border border-gray-600/40">
                  {isPdf ? (
                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ) : (
                    <img src={certUrl} alt="cert" className="w-10 h-10 object-cover rounded-lg" />
                  )}
                  <span className="flex-1 text-sm text-gray-300 truncate">{certName}</span>
                  <a href={certUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs px-2 py-0.5 rounded-md bg-blue-900/40 text-blue-300 hover:bg-blue-800/50 transition">
                    {isPdf ? "View PDF" : "View"}
                  </a>
                  <button type="button" onClick={() => handleDeleteExistingCert(cert, i)}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              );
            })}
            {certificateFiles?.map((file, i) => {
              const isImage = file.type?.includes("image");
              return (
                <div key={`new-${i}`} className="flex items-center gap-3 p-3 bg-gray-700/40 rounded-xl border border-emerald-600/30">
                  {isImage ? (
                    <img src={certificatePreviews?.[i]} alt="preview" className="w-10 h-10 object-cover rounded-lg" />
                  ) : (
                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <span className="flex-1 text-sm text-gray-300 truncate">{file.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-900/40 text-emerald-300">New</span>
                  <button type="button" onClick={() => handleDeleteFile(i)}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Skill Showcase Video ─────────────────────────────────────────────── */}
      <div className={sectionCls}>
        <h4 className="text-emerald-400 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
          <span>🎥</span> Skill Showcase Video
        </h4>
        <p className="text-gray-400 text-xs text-balance">Upload a short intro video (under 2 limits) showcasing your skills (mp4, mov, webm).</p>

        <input
          ref={videoInputRef} id="skillShowcaseVideo"
          type="file" accept="video/mp4,video/quicktime,video/webm"
          onChange={handleVideoSelect} className="hidden"
        />

        {!videoFile && (!form.skillShowcaseVideo || removeVideo) ? (
          <button
            type="button"
            onClick={() => videoInputRef.current.click()}
            className="w-full py-3 px-4 border-2 border-dashed border-emerald-500/40 hover:border-emerald-400/70 rounded-xl text-emerald-400 hover:text-emerald-300 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Upload Showcase Video
          </button>
        ) : (
          <div className="relative rounded-xl overflow-hidden border border-emerald-500/30 bg-gray-900/50">
            <video
              src={videoFile ? URL.createObjectURL(videoFile) : form.skillShowcaseVideo}
              controls
              className="w-full max-h-48 object-cover"
            />
            <button
              type="button"
              onClick={handleRemoveVideo}
              className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full p-1.5 shadow-lg backdrop-blur-sm transition-all z-10"
              title="Remove Video"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}
      </div>

      {/* ── Submit ────────────────────────────────────────────────────── */}
      <button
        type="submit" disabled={loading}
        className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 text-slate-950 font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
      >
        {loading ? (
          <>
            <Spinner size={20} color="#0f172a" /> Saving...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save Changes
          </>
        )}
      </button>
    </form>
  );
}
