import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { showSuccess, showError } from "../utils/toast";
import SkillList from "../components/profile/SkillList";
import { useTheme } from "../hooks/useTheme";
import { updateProfile } from "../redux/slices/userSlice";

export default function SkillsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDarkMode, bgClass, textClass, borderClass, cardClass, inputClass } = useTheme();
  const [teachSkill, setTeachSkill] = useState("");
  const [teachLevel, setTeachLevel] = useState("Beginner");
  const [learnSkill, setLearnSkill] = useState("");
  const [learnLevel, setLearnLevel] = useState("Beginner");

  const [skills, setSkills] = useState([]);
  const [learnSkills, setLearnSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [learnLoading, setLearnLoading] = useState(false);

  const fetchSkills = async () => {
    try {
      const res = await api.get("/users/me");
      setSkills(res.data?.teachSkills || []);
      setLearnSkills(res.data?.learnSkills || []);
    } catch {
      showError("Failed to load skills");
    }
  };

  const addSkill = async () => {
    if (!teachSkill || !teachLevel) return;
    setLoading(true);
    try {
      await api.post("/skills/teach", { name: teachSkill, level: teachLevel });
      showSuccess("Skill added");
      setTeachSkill("");
      setTeachLevel("Beginner");
      await fetchSkills();
      // Sync Redux so ProfilePage progress bar updates immediately
      const res = await api.get("/users/me");
      dispatch(updateProfile({ teachSkills: res.data.teachSkills, learnSkills: res.data.learnSkills }));
    } catch (err) {
      showError(err.response?.data?.message || "Error adding skill");
    } finally {
      setLoading(false);
    }
  };

  const removeSkill = async (name) => {
    try {
      await api.delete(`/skills/teach?name=${encodeURIComponent(name)}`);
      showSuccess("Skill removed");
      const updated = skills.filter((s) => s.name !== name);
      setSkills(updated);
      // Sync Redux so ProfilePage progress bar updates immediately
      dispatch(updateProfile({ teachSkills: updated }));
    } catch {
      showError("Failed to remove skill");
    }
  };

  const addLearnSkill = async () => {
    if (!learnSkill || !learnLevel) return;
    setLearnLoading(true);
    try {
      await api.post("/skills/learn", { name: learnSkill, level: learnLevel });
      showSuccess("Learn skill added");
      setLearnSkill("");
      setLearnLevel("Beginner");
      await fetchSkills();
      // Sync Redux so ProfilePage progress bar updates immediately
      const res = await api.get("/users/me");
      dispatch(updateProfile({ teachSkills: res.data.teachSkills, learnSkills: res.data.learnSkills }));
    } catch (err) {
      showError(err.response?.data?.message || "Error adding learn skill");
    } finally {
      setLearnLoading(false);
    }
  };

  const removeLearnSkill = async (name) => {
    try {
      await api.delete(`/skills/learn?name=${encodeURIComponent(name)}`);
      showSuccess("Learn skill removed");
      const updated = learnSkills.filter((s) => s.name !== name);
      setLearnSkills(updated);
      // Sync Redux so ProfilePage progress bar updates immediately
      dispatch(updateProfile({ learnSkills: updated }));
    } catch {
      showError("Failed to remove learn skill");
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-black via-gray-950 to-slate-950' : 'bg-gradient-to-br from-gray-50 to-white'} relative overflow-hidden`}>
      {/* Background Effects */}
      <div className={`fixed inset-0 overflow-hidden pointer-events-none ${isDarkMode ? '' : 'opacity-20'}`}>
        <div className="absolute -top-96 -right-96 w-[800px] h-[800px] bg-gradient-to-br from-emerald-400/4 via-green-500/3 to-teal-600/2 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-96 -left-96 w-[800px] h-[800px] bg-gradient-to-tr from-green-400/3 via-teal-500/2 to-emerald-600/2 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-teal-400/2 via-emerald-500/2 to-green-600/1 rounded-full blur-2xl animate-pulse delay-500"></div>

        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-ping opacity-30"
            style={{
              background: `linear-gradient(45deg, 
                ${i % 3 === 0
                  ? "rgba(52, 211, 153, 0.4)"
                  : i % 3 === 1
                    ? "rgba(34, 197, 94, 0.4)"
                    : "rgba(20, 184, 166, 0.4)"
                }
              )`,
              top: `${15 + i * 8}%`,
              left: `${10 + i * 7}%`,
              animationDelay: `${i * 0.6}s`,
              animationDuration: "4s",
            }}
          />
        ))}

        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
            linear-gradient(rgba(52, 211, 153, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(52, 211, 153, 0.1) 1px, transparent 1px)
          `,
            backgroundSize: "40px 40px",
            animation: "gridMove 15s linear infinite",
          }}
        ></div>
      </div>

      <div className="relative z-10 p-5 lg:p-6">
        <div className="max-w-6xl mx-auto">
          <br />
          {/* Skills Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Teaching Skills Section */}
            <div className="space-y-6">
              <div className={`${cardClass} backdrop-blur-xl rounded-2xl border border-emerald-500/25 p-6 shadow-xl hover:shadow-emerald-500/15 transition-all duration-300 relative overflow-hidden group ${!isDarkMode ? 'shadow-lg border-gray-200' : ''}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-green-500/3 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>

                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/30">
                      <span className="text-white text-xl">🎓</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
                        Skills I Teach
                      </h2>
                      <p className="text-slate-400 text-sm">
                        Share your expertise with others
                      </p>
                    </div>
                  </div>

                  {/* Add Skill Form */}
                  <div className="bg-gradient-to-r from-emerald-500/8 via-green-500/6 to-teal-500/8 rounded-xl border border-emerald-500/20 p-5 mb-6">
                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Enter skill name..."
                          className={`w-full px-4 py-3 ${inputClass} border border-slate-600/40 rounded-xl placeholder-slate-400 focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all duration-300 backdrop-blur-sm`}
                          value={teachSkill}
                          onChange={(e) => setTeachSkill(e.target.value)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 to-green-400/5 rounded-xl opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative">
                          <select
                            value={teachLevel}
                            onChange={(e) => setTeachLevel(e.target.value)}
                            className={`w-full px-4 py-3 ${inputClass} border border-slate-600/40 rounded-xl focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all duration-300 backdrop-blur-sm appearance-none cursor-pointer`}
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                          </select>
                          <svg
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>

                        <button
                          onClick={addSkill}
                          disabled={loading || !teachSkill.trim()}
                          className="px-8 py-3 bg-slate-800/90 hover:bg-slate-700/90 disabled:bg-gray-700/50 border border-emerald-500/30 hover:border-emerald-400/50 disabled:border-gray-600/30 text-emerald-300 hover:text-emerald-200 disabled:text-gray-500 font-medium rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100 backdrop-blur-sm relative overflow-hidden group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <span className="relative z-10 flex items-center justify-center space-x-2">
                            {loading ? (
                              <>
                                <svg
                                  className="w-4 h-4 animate-spin"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                <span>Adding...</span>
                              </>
                            ) : (
                              <>
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
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                  />
                                </svg>
                                <span>Add Skill</span>
                              </>
                            )}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Skills List */}
                  <div className="space-y-3">
                    {skills.length > 0 ? (
                      <SkillList
                        skills={skills}
                        editable={true}
                        onRemove={removeSkill}
                      />
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed border-emerald-500/20 rounded-xl bg-emerald-500/5">
                        <div className="w-16 h-16 bg-gradient-to-r from-emerald-500/15 to-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-3xl">🎯</span>
                        </div>
                        <p className="text-slate-400 mb-2">
                          No teaching skills added yet
                        </p>
                        <p className="text-slate-500 text-sm">
                          Add your first skill to start teaching others
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Skills Section */}
            <div className="space-y-6">
              <div className={`${cardClass} backdrop-blur-xl rounded-2xl border border-teal-500/25 p-6 shadow-xl hover:shadow-teal-500/15 transition-all duration-300 relative overflow-hidden group ${!isDarkMode ? 'shadow-lg border-gray-200' : ''}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-green-500/3 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>

                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-teal-400 to-green-500 rounded-xl flex items-center justify-center shadow-md shadow-teal-500/30">
                      <span className="text-white text-xl">📚</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-400 via-green-400 to-emerald-400 bg-clip-text text-transparent">
                        Skills I Want to Learn
                      </h2>
                      <p className="text-slate-400 text-sm">
                        Discover new areas of knowledge
                      </p>
                    </div>
                  </div>

                  {/* Add Learn Skill Form */}
                  <div className="bg-gradient-to-r from-teal-500/8 via-green-500/6 to-emerald-500/8 rounded-xl border border-teal-500/20 p-5 mb-6">
                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Enter skill you want to learn..."
                          className={`w-full px-4 py-3 ${inputClass} border border-slate-600/40 rounded-xl placeholder-slate-400 focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 transition-all duration-300 backdrop-blur-sm`}
                          value={learnSkill}
                          onChange={(e) => setLearnSkill(e.target.value)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-400/5 to-green-400/5 rounded-xl opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative">
                          <select
                            value={learnLevel}
                            onChange={(e) => setLearnLevel(e.target.value)}
                            className={`w-full px-4 py-3 ${inputClass} border border-slate-600/40 rounded-xl focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 transition-all duration-300 backdrop-blur-sm appearance-none cursor-pointer`}
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                          </select>
                          <svg
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>

                        <button
                          onClick={addLearnSkill}
                          disabled={learnLoading || !learnSkill.trim()}
                          className="px-8 py-3 bg-slate-800/90 hover:bg-slate-700/90 disabled:bg-gray-700/50 border border-teal-500/30 hover:border-teal-400/50 disabled:border-gray-600/30 text-teal-300 hover:text-teal-200 disabled:text-gray-500 font-medium rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100 backdrop-blur-sm relative overflow-hidden group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/5 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <span className="relative z-10 flex items-center justify-center space-x-2">
                            {learnLoading ? (
                              <>
                                <svg
                                  className="w-4 h-4 animate-spin"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                <span>Adding...</span>
                              </>
                            ) : (
                              <>
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
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                  />
                                </svg>
                                <span>Add Skill</span>
                              </>
                            )}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Learn Skills List */}
                  <div className="space-y-3">
                    {learnSkills.length > 0 ? (
                      <SkillList
                        skills={learnSkills}
                        editable={true}
                        onRemove={removeLearnSkill}
                      />
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed border-teal-500/20 rounded-xl bg-teal-500/5">
                        <div className="w-16 h-16 bg-gradient-to-r from-teal-500/15 to-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-3xl">🎯</span>
                        </div>
                        <p className="text-slate-400 mb-2">
                          No learning goals added yet
                        </p>
                        <p className="text-slate-500 text-sm">
                          Add skills you want to master
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`${cardClass} backdrop-blur-xl rounded-2xl border border-emerald-500/20 p-6 text-center shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 group ${!isDarkMode ? 'shadow-lg border-gray-200' : ''}`}>
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🎓</span>
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 bg-clip-text text-transparent mb-2">
                {skills.length}
              </div>
              <div className="text-slate-400 font-medium">Teaching Skills</div>
            </div>

            <div className={`${cardClass} backdrop-blur-xl rounded-2xl border border-teal-500/20 p-6 text-center shadow-lg hover:shadow-teal-500/10 transition-all duration-300 group ${!isDarkMode ? 'shadow-lg border-gray-200' : ''}`}>
              <div className="w-12 h-12 bg-gradient-to-r from-teal-400 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">📚</span>
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-teal-400 via-green-500 to-emerald-600 bg-clip-text text-transparent mb-2">
                {learnSkills.length}
              </div>
              <div className="text-slate-400 font-medium">Learning Goals</div>
            </div>

            <div className={`${cardClass} backdrop-blur-xl rounded-2xl border border-green-500/20 p-6 text-center shadow-lg hover:shadow-green-500/10 transition-all duration-300 group ${!isDarkMode ? 'shadow-lg border-gray-200' : ''}`}>
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 bg-clip-text text-transparent mb-2">
                {skills.length + learnSkills.length}
              </div>
              <div className="text-slate-400 font-medium">Total Skills</div>
            </div>
          </div>

          {/* ━━━ Explore Skills & Experts Section ━━━ */}
          <div className="mt-12">
            <div className={`relative overflow-hidden rounded-3xl border shadow-2xl ${isDarkMode
                ? "bg-gray-900/50 backdrop-blur-xl border-violet-500/20"
                : "bg-white/80 backdrop-blur-xl border-violet-200 shadow-violet-500/5"
              }`}>
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-indigo-500/10 pointer-events-none" />
              <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl pointer-events-none ${isDarkMode ? "bg-violet-500/10" : "bg-violet-400/10"}`} />
              <div className={`absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-3xl pointer-events-none ${isDarkMode ? "bg-indigo-500/8" : "bg-indigo-400/8"}`} />

              <div className="relative z-10 p-8 lg:p-10">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  {/* Left: text + features */}
                  <div className="flex-1 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/15 border border-violet-500/30 rounded-full text-violet-400 text-sm font-semibold mb-4">
                      <span>🌟</span> Featured Section
                    </div>
                    <h2 className={`text-3xl lg:text-4xl font-black mb-3 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                      Explore Skills &{" "}
                      <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent">
                        Find Experts
                      </span>
                    </h2>
                    <p className={`text-lg mb-6 max-w-lg mx-auto lg:mx-0 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                      Discover all skills available on the platform and connect with verified experts who can teach them
                    </p>

                    {/* Feature bullets */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                      {[
                        { icon: "🔍", text: "Search any skill" },
                        { icon: "👨‍🏫", text: "Browse expert profiles" },
                        { icon: "⭐", text: "See ratings & reviews" },
                        { icon: "🤝", text: "Send match requests" },
                      ].map((f) => (
                        <div key={f.text} className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-medium ${isDarkMode
                            ? "bg-gray-800/50 border-gray-700/40 text-slate-300"
                            : "bg-violet-50/50 border-violet-100 text-slate-700"
                          }`}>
                          <span className="text-lg">{f.icon}</span>
                          {f.text}
                        </div>
                      ))}
                    </div>

                    <button
                      id="btn-explore-skills"
                      onClick={() => navigate("/skills/explore")}
                      className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold text-lg rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-violet-500/30"
                    >
                      <span>🚀</span>
                      Explore Skills & Experts
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>

                  {/* Right: decorative skill grid preview */}
                  <div className="hidden lg:grid grid-cols-2 gap-3 w-64 flex-shrink-0">
                    {[
                      { icon: "⚡", name: "JavaScript", experts: 5, color: "from-yellow-400 to-orange-500" },
                      { icon: "🐍", name: "Python", experts: 8, color: "from-blue-400 to-cyan-500" },
                      { icon: "⚛️", name: "React", experts: 6, color: "from-cyan-400 to-blue-500" },
                      { icon: "🎨", name: "UI/UX Design", experts: 3, color: "from-pink-400 to-rose-500" },
                    ].map((sk) => (
                      <div
                        key={sk.name}
                        className={`p-4 rounded-2xl border text-center transition-all duration-300 hover:scale-105 cursor-pointer ${isDarkMode ? "bg-gray-800/60 border-gray-700/50 hover:border-violet-500/30" : "bg-white border-gray-200 hover:border-violet-300 shadow-md"
                          }`}
                        onClick={() => navigate("/skills/explore")}
                      >
                        <div className={`w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br ${sk.color} flex items-center justify-center text-xl shadow-lg`}>
                          {sk.icon}
                        </div>
                        <p className={`text-xs font-bold mb-1 ${isDarkMode ? "text-white" : "text-slate-800"}`}>{sk.name}</p>
                        <p className={`text-[10px] ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>{sk.experts} experts</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes gridMove {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(40px, 40px);
          }
        }
      `}</style>
    </div>
  );
}
