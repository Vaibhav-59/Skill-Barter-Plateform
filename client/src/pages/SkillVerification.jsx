import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { toast } from "react-toastify";

import SkillSelector from "../components/verification/SkillSelector";
import TestConfig from "../components/verification/TestConfig";
import MCQQuestion from "../components/verification/MCQQuestion";
import TestProgress from "../components/verification/TestProgress";
import ResultCard from "../components/verification/ResultCard";
import VerificationBadge from "../components/verification/VerificationBadge";
import TestTimer from "../components/verification/TestTimer";

import {
  generateTest,
  submitTest,
  getTestHistory,
  getLeaderboard,
} from "../services/verificationApi";

const TABS = [
  { id: "verify", label: "Get Verified", icon: "🏅" },
  { id: "history", label: "Test History", icon: "📜" },
  { id: "leaderboard", label: "Leaderboard", icon: "🏆" },
];

// Seconds per question map
const TIME_PER_Q = { Easy: 45, Medium: 60, Hard: 90 };

export default function SkillVerification() {
  const { isDarkMode } = useTheme();

  // ── Tab & step state ──────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("verify");
  // steps: "setup" | "loading" | "testing" | "review" | "result"
  const [testStep, setTestStep] = useState("setup");

  // ── User data ─────────────────────────────────────────────────────────────
  const [userSkills, setUserSkills] = useState([]);
  const [verifiedSkills, setVerifiedSkills] = useState([]);

  // ── Setup state ───────────────────────────────────────────────────────────
  const [selectedSkill, setSelectedSkill] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState("Medium");

  // ── Test state ────────────────────────────────────────────────────────────
  const [activeTest, setActiveTest] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { idx: optionString }
  const [submitLoading, setSubmitLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewIdx, setReviewIdx] = useState(0);

  // Timer ref to track elapsed time
  const testStartRef = useRef(null);
  const timerSeconds = (TIME_PER_Q[difficulty] || 60) * totalQuestions;

  // ── History state ─────────────────────────────────────────────────────────
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // ── Leaderboard state ─────────────────────────────────────────────────────
  const [leaders, setLeaders] = useState([]);
  const [lbLoading, setLbLoading] = useState(false);
  const [lbSkill, setLbSkill] = useState("");

  // ── Load user skills from localStorage ───────────────────────────────────
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      const all = [...(u.teachSkills || []), ...(u.learnSkills || [])];
      const seen = new Set();
      const unique = [];
      for (const s of all) {
        if (!seen.has(s.name)) { unique.push(s); seen.add(s.name); }
      }
      setUserSkills(unique);
      setVerifiedSkills(u.verifiedSkills || []);
    } catch {}
  }, []);

  // ── Fetch history ─────────────────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await getTestHistory();
      setHistory(res.data || []);
    } catch {
      toast.error("Failed to load history");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // ── Fetch leaderboard ─────────────────────────────────────────────────────
  const fetchLeaderboard = useCallback(async (skill = "") => {
    setLbLoading(true);
    try {
      const res = await getLeaderboard(skill);
      setLeaders(res.data || []);
    } catch {
      toast.error("Failed to load leaderboard");
    } finally {
      setLbLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "history") fetchHistory();
    if (activeTab === "leaderboard") fetchLeaderboard(lbSkill);
  }, [activeTab]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleStartTest = async () => {
    if (!selectedSkill?.trim()) return toast.warning("Please select or type a skill");

    setTestStep("loading");
    try {
      const res = await generateTest({ skillName: selectedSkill.trim(), totalQuestions, difficulty });
      setActiveTest(res.data);
      setCurrentIdx(0);
      setAnswers({});
      setResult(null);
      setReviewMode(false);
      testStartRef.current = Date.now();
      setTestStep("testing");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate test. Try again.");
      setTestStep("setup");
    }
  };

  const handleSelectAnswer = (option) => {
    setAnswers((prev) => ({ ...prev, [currentIdx]: option }));
  };

  const handleTimerExpire = () => {
    toast.warning("⏰ Time's up! Submitting your answers...");
    submitAnswers();
  };

  const submitAnswers = async () => {
    if (submitLoading) return;
    const timeTaken = testStartRef.current
      ? Math.round((Date.now() - testStartRef.current) / 1000)
      : 0;

    setSubmitLoading(true);
    try {
      // Convert numeric-indexed answers to question._id keyed
      const mappedAnswers = {};
      if (activeTest?.questions) {
        activeTest.questions.forEach((q, i) => {
          if (answers[i] !== undefined) {
            mappedAnswers[String(q._id)] = answers[i];
            mappedAnswers[String(i)] = answers[i]; // also send by index as fallback
          }
        });
      }

      const res = await submitTest({
        verificationId: activeTest._id,
        answers: mappedAnswers,
        timeTaken,
      });

      setResult(res.data);
      // Update local verifiedSkills cache
      if (res.data.status === "passed") {
        setVerifiedSkills((prev) =>
          prev.includes(res.data.skillName) ? prev : [...prev, res.data.skillName]
        );
        // Also update localStorage user cache
        try {
          const u = JSON.parse(localStorage.getItem("user") || "{}");
          u.verifiedSkills = [...new Set([...(u.verifiedSkills || []), res.data.skillName])];
          localStorage.setItem("user", JSON.stringify(u));
        } catch {}
      }
      setTestStep("result");
    } catch {
      toast.error("Failed to submit test");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSubmitTest = async () => {
    const answered = Object.keys(answers).length;
    if (answered < activeTest.questions.length) {
      const ok = window.confirm(
        `You have answered ${answered}/${activeTest.questions.length} questions. Submit anyway?`
      );
      if (!ok) return;
    }
    await submitAnswers();
  };

  const handleReset = () => {
    setTestStep("setup");
    setActiveTest(null);
    setResult(null);
    setCurrentIdx(0);
    setAnswers({});
    setReviewMode(false);
  };

  const handleReview = () => {
    setReviewIdx(0);
    setReviewMode(true);
    setTestStep("review");
  };

  // ── Skeleton loader ───────────────────────────────────────────────────────
  const LoadingScreen = () => (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="relative w-20 h-20 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
        <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
        <div className="absolute inset-3 flex items-center justify-center text-2xl">🤖</div>
      </div>
      <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
        AI is crafting your test...
      </h3>
      <p className={`text-sm max-w-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
        Generating {totalQuestions} custom {difficulty.toLowerCase()} questions for{" "}
        <span className="font-bold text-emerald-500">{selectedSkill}</span>
      </p>
      <div className="flex gap-1.5 mt-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );

  // ── Question navigation dots ──────────────────────────────────────────────
  const QuestionDots = ({ idx, setIdx, qs, ans }) => (
    <div className="flex flex-wrap justify-center gap-2 mt-6">
      {qs.map((_, i) => (
        <button
          key={i}
          onClick={() => setIdx(i)}
          title={ans[i] ? `Q${i + 1}: Answered` : `Q${i + 1}: Unanswered`}
          className={`w-7 h-7 rounded-lg text-[11px] font-bold transition-all hover:scale-110 ${
            i === idx
              ? "ring-2 ring-blue-500 bg-blue-500 text-white"
              : ans[i]
              ? "bg-emerald-500 text-white"
              : isDarkMode
              ? "bg-white/10 text-slate-400 hover:bg-white/20"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode
        ? "bg-gradient-to-br from-gray-950 via-slate-950 to-gray-900"
        : "bg-gradient-to-br from-slate-50 via-gray-50 to-white"
    }`}>
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 right-10 w-[600px] h-[600px] bg-emerald-500/4 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-80 h-80 bg-blue-500/4 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── PAGE HEADER ───────────────────────────────────────────────────── */}
        <div className="mb-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs mb-4">
            <Link to="/skill-hub" className={`hover:underline ${isDarkMode ? "text-slate-500 hover:text-slate-300" : "text-gray-400 hover:text-gray-600"}`}>
              Skill Hub
            </Link>
            <span className={isDarkMode ? "text-slate-700" : "text-gray-300"}>/</span>
            <span className={`font-semibold ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`}>Skill Verification</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">AI Powered</span>
              </div>
              <h1 className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Skill{" "}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  Verification
                </span>
              </h1>
              <p className={`mt-3 text-base sm:text-lg max-w-lg leading-relaxed ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                Take an AI-generated MCQ quiz, earn a verified medal badge, and stand out from the crowd.
              </p>
            </div>

            {/* Verified count badge */}
            {verifiedSkills.length > 0 && (
              <div className={`flex-shrink-0 px-5 py-4 rounded-2xl border text-center ${
                isDarkMode ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-200"
              }`}>
                <div className="text-3xl font-black text-emerald-500">{verifiedSkills.length}</div>
                <div className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? "text-emerald-400/70" : "text-emerald-600/70"}`}>
                  Verified
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── TAB NAV (only in setup / result / history / leaderboard) ───── */}
        {(testStep === "setup" || testStep === "result") && (
          <div className={`flex gap-1 p-1 rounded-2xl mb-8 w-fit shadow-sm ${
            isDarkMode ? "bg-white/5 border border-white/[0.07]" : "bg-gray-100 border border-gray-200"
          }`}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === "verify" && testStep === "result") handleReset();
                }}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                    : isDarkMode
                    ? "text-slate-400 hover:text-white hover:bg-white/5"
                    : "text-gray-500 hover:text-gray-900 hover:bg-white"
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/*                    HISTORY TAB                                    */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "history" && testStep !== "testing" && testStep !== "loading" && (
          <div>
            {historyLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`h-24 rounded-2xl animate-pulse ${isDarkMode ? "bg-white/5" : "bg-gray-100"}`} />
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-24">
                <div className="text-5xl mb-4">📜</div>
                <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>No test history yet</h3>
                <p className={`text-sm mb-8 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>Take your first skill verification test to see results here.</p>
                <button onClick={() => setActiveTab("verify")}
                  className="px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg hover:scale-[1.02] transition-all">
                  Start Test →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {history.map((h, i) => {
                  const passed = h.status === "passed";
                  return (
                    <div key={h._id || i}
                      className={`p-5 rounded-2xl border transition-all hover:scale-[1.01] ${
                        isDarkMode
                          ? `bg-white/[0.03] border-white/10 hover:border-${passed ? "emerald" : "rose"}-500/30`
                          : "bg-white border-gray-100 shadow-sm hover:shadow-md"
                      }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4 className={`font-bold text-base truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}>{h.skillName}</h4>
                            {passed && <VerificationBadge size="xs" />}
                          </div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                              h.difficulty === "Hard" ? "bg-rose-500/15 text-rose-400"
                              : h.difficulty === "Easy" ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-amber-500/15 text-amber-400"
                            }`}>{h.difficulty}</span>
                            <span className={`text-xs ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
                              {new Date(h.createdAt).toLocaleDateString()}
                            </span>
                            <span className={`text-xs ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
                              {h.score}/{h.totalQuestions}
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <div className={`text-2xl font-black ${passed ? "text-emerald-500" : "text-rose-500"}`}>
                            {h.percentage}%
                          </div>
                          <div className={`text-[10px] font-bold uppercase tracking-widest ${
                            passed ? "text-emerald-500/60" : "text-rose-500/60"
                          }`}>{h.status}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/*                   LEADERBOARD TAB                                 */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "leaderboard" && testStep !== "testing" && testStep !== "loading" && (
          <div>
            {/* Filter */}
            <div className="flex gap-3 mb-6 flex-col sm:flex-row">
              <input
                type="text"
                value={lbSkill}
                onChange={(e) => setLbSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchLeaderboard(lbSkill)}
                placeholder="Filter by skill…"
                className={`flex-1 px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                  isDarkMode
                    ? "bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                    : "bg-white border-gray-200 text-gray-900 focus:border-emerald-400 focus:ring-emerald-400/20 shadow-sm"
                }`}
              />
              <button
                onClick={() => fetchLeaderboard(lbSkill)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:scale-[1.02] transition-all"
              >
                🔍 Search
              </button>
            </div>

            {lbLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`h-16 rounded-2xl animate-pulse ${isDarkMode ? "bg-white/5" : "bg-gray-100"}`} />
                ))}
              </div>
            ) : leaders.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🏆</div>
                <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>No leaderboard data found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaders.map((leader, i) => {
                  const medals = ["🥇", "🥈", "🥉"];
                  const medal = medals[i] || `#${i + 1}`;
                  return (
                    <div key={leader.userId || i}
                      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                        i < 3
                          ? isDarkMode
                            ? "bg-gradient-to-r from-amber-500/5 to-yellow-500/5 border-amber-500/20"
                            : "bg-amber-50 border-amber-200"
                          : isDarkMode
                          ? "bg-white/[0.03] border-white/10"
                          : "bg-white border-gray-100 shadow-sm"
                      }`}>
                      {/* Rank */}
                      <div className="w-10 h-10 flex items-center justify-center text-xl flex-shrink-0">{medal}</div>
                      {/* Avatar */}
                      {leader.profileImage ? (
                        <img src={leader.profileImage} alt={leader.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30 flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {leader.name?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-bold text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>{leader.name}</span>
                          {leader.verifiedSkills?.length > 0 && <VerificationBadge size="xs" showLabel={false} />}
                        </div>
                        <span className={`text-xs ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>{leader.skillName}</span>
                      </div>
                      {/* Score */}
                      <div className="text-right flex-shrink-0">
                        <div className={`text-xl font-black ${i === 0 ? "text-amber-500" : "text-emerald-500"}`}>
                          {leader.bestScore}%
                        </div>
                        <div className={`text-xs ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
                          {leader.attempts} attempt{leader.attempts !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/*                    VERIFY FLOW                                    */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "verify" && (
          <div>
            {/* ── STEP: SETUP ──────────────────────────────────────────── */}
            {testStep === "setup" && (
              <div className="max-w-xl mx-auto">
                <div className={`rounded-3xl border shadow-xl ${
                  isDarkMode ? "bg-white/[0.02] border-white/10" : "bg-white border-gray-100"
                }`}>
                  <div className="p-6 sm:p-10">
                    {/* Card header */}
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/30 mb-4">
                        🏅
                      </div>
                      <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        Configure Your Test
                      </h2>
                      <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                        Pick a skill, set difficulty, and let AI generate your personalised quiz.
                      </p>
                    </div>

                    <SkillSelector
                      value={selectedSkill}
                      onChange={setSelectedSkill}
                      userSkills={userSkills}
                    />

                    <TestConfig
                      totalQuestions={totalQuestions}
                      setTotalQuestions={setTotalQuestions}
                      difficulty={difficulty}
                      setDifficulty={setDifficulty}
                    />

                    {/* Timer info */}
                    <div className={`flex items-center gap-3 p-4 rounded-xl mb-6 ${
                      isDarkMode ? "bg-blue-500/10 border border-blue-500/20" : "bg-blue-50 border border-blue-100"
                    }`}>
                      <span className="text-blue-400 text-xl">⏱️</span>
                      <div>
                        <div className={`text-sm font-bold ${isDarkMode ? "text-blue-300" : "text-blue-700"}`}>
                          Time Limit: {Math.floor(timerSeconds / 60)} minutes
                        </div>
                        <div className={`text-xs ${isDarkMode ? "text-blue-400/70" : "text-blue-500"}`}>
                          {TIME_PER_Q[difficulty]}s per question · Questions are randomised
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleStartTest}
                      disabled={!selectedSkill?.trim()}
                      className="w-full py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                    >
                      🚀 Start Verification Test
                    </button>
                  </div>
                </div>

                {/* Already verified skills chips */}
                {verifiedSkills.length > 0 && (
                  <div className="mt-6">
                    <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
                      Your Verified Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {verifiedSkills.map((s) => (
                        <div key={s} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
                          isDarkMode ? "border-emerald-500/30 bg-emerald-500/10" : "border-emerald-200 bg-emerald-50"
                        }`}>
                          <VerificationBadge size="xs" showLabel={false} />
                          <span className={`text-xs font-semibold ${isDarkMode ? "text-emerald-300" : "text-emerald-700"}`}>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP: LOADING ─────────────────────────────────────────── */}
            {testStep === "loading" && <LoadingScreen />}

            {/* ── STEP: TESTING ─────────────────────────────────────────── */}
            {testStep === "testing" && activeTest && (
              <div className="max-w-3xl mx-auto">
                {/* Top bar: progress + timer */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
                  <div className="flex-1">
                    <TestProgress
                      answered={Object.keys(answers).length}
                      total={activeTest.totalQuestions}
                      current={currentIdx}
                    />
                  </div>
                  <TestTimer
                    totalSeconds={timerSeconds}
                    onExpire={handleTimerExpire}
                  />
                </div>

                {/* Question card */}
                <div className={`rounded-3xl border p-6 sm:p-10 mb-6 shadow-xl ${
                  isDarkMode ? "bg-gray-900 border-white/10" : "bg-white border-gray-100"
                }`}>
                  <MCQQuestion
                    question={activeTest.questions[currentIdx]?.question}
                    options={activeTest.questions[currentIdx]?.options || []}
                    selectedOption={answers[currentIdx]}
                    onSelect={handleSelectAnswer}
                    questionNumber={currentIdx + 1}
                    totalQuestions={activeTest.totalQuestions}
                  />

                  {/* Navigation */}
                  <div className={`flex items-center justify-between gap-4 mt-10 pt-8 border-t ${
                    isDarkMode ? "border-white/10" : "border-gray-100"
                  }`}>
                    <button
                      onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
                      disabled={currentIdx === 0}
                      className={`px-7 py-3 rounded-xl text-sm font-bold border transition-all active:scale-95 ${
                        currentIdx === 0
                          ? "opacity-25 cursor-not-allowed border-transparent"
                          : isDarkMode
                          ? "border-white/10 text-white hover:bg-white/5"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      ← Prev
                    </button>

                    {currentIdx < activeTest.questions.length - 1 ? (
                      <button
                        onClick={() => setCurrentIdx((p) => p + 1)}
                        className="px-10 py-3 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
                      >
                        Next →
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitTest}
                        disabled={submitLoading}
                        className="px-10 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {submitLoading ? "Submitting…" : "Submit Test ✅"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Question dots */}
                <QuestionDots
                  idx={currentIdx}
                  setIdx={setCurrentIdx}
                  qs={activeTest.questions}
                  ans={answers}
                />
              </div>
            )}

            {/* ── STEP: REVIEW ──────────────────────────────────────────── */}
            {testStep === "review" && result && (
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    📋 Answer Review — {result.skillName}
                  </h2>
                  <button
                    onClick={() => setTestStep("result")}
                    className={`px-5 py-2 rounded-xl text-sm font-bold border transition-all ${
                      isDarkMode ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    ← Back to Results
                  </button>
                </div>

                <div className={`rounded-3xl border p-6 sm:p-10 mb-6 shadow-xl ${
                  isDarkMode ? "bg-gray-900 border-white/10" : "bg-white border-gray-100"
                }`}>
                  <MCQQuestion
                    question={result.questions[reviewIdx]?.question}
                    options={result.questions[reviewIdx]?.options || []}
                    selectedOption={result.questions[reviewIdx]?.userAnswer}
                    correctAnswer={result.questions[reviewIdx]?.correctAnswer}
                    onSelect={() => {}}
                    questionNumber={reviewIdx + 1}
                    totalQuestions={result.questions.length}
                    showReview={true}
                  />

                  <div className={`mt-6 p-4 rounded-xl ${
                    result.questions[reviewIdx]?.userAnswer === result.questions[reviewIdx]?.correctAnswer
                      ? isDarkMode ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-emerald-50 border border-emerald-200"
                      : isDarkMode ? "bg-rose-500/10 border border-rose-500/20" : "bg-rose-50 border border-rose-200"
                  }`}>
                    <p className={`text-sm font-semibold ${
                      result.questions[reviewIdx]?.userAnswer === result.questions[reviewIdx]?.correctAnswer
                        ? "text-emerald-500" : "text-rose-500"
                    }`}>
                      {result.questions[reviewIdx]?.userAnswer === result.questions[reviewIdx]?.correctAnswer
                        ? "✅ Correct!"
                        : `❌ Wrong. Correct answer: ${result.questions[reviewIdx]?.correctAnswer}`}
                    </p>
                  </div>

                  {/* Review nav */}
                  <div className={`flex items-center justify-between mt-8 pt-6 border-t ${isDarkMode ? "border-white/10" : "border-gray-100"}`}>
                    <button
                      onClick={() => setReviewIdx((p) => Math.max(0, p - 1))}
                      disabled={reviewIdx === 0}
                      className="px-7 py-3 rounded-xl text-sm font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-25 transition-all"
                    >← Prev</button>
                    {reviewIdx < result.questions.length - 1 ? (
                      <button onClick={() => setReviewIdx((p) => p + 1)}
                        className="px-10 py-3 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-500 transition-all">
                        Next →
                      </button>
                    ) : (
                      <button onClick={() => setTestStep("result")}
                        className="px-10 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white transition-all">
                        Done ✓
                      </button>
                    )}
                  </div>
                </div>

                {/* Dots for review */}
                <div className="flex flex-wrap justify-center gap-2">
                  {result.questions.map((q, i) => {
                    const isCorrect = q.userAnswer === q.correctAnswer;
                    return (
                      <button key={i} onClick={() => setReviewIdx(i)}
                        className={`w-7 h-7 rounded-lg text-[11px] font-bold transition-all ${
                          i === reviewIdx ? "ring-2 ring-blue-500 scale-110" : ""
                        } ${isCorrect ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"}`}>
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── STEP: RESULT ──────────────────────────────────────────── */}
            {testStep === "result" && result && (
              <div>
                <ResultCard
                  skillName={result.skillName}
                  score={result.score}
                  percentage={result.percentage}
                  status={result.status}
                  totalQuestions={result.totalQuestions || totalQuestions}
                  timeTaken={result.timeTaken || 0}
                  onRetest={handleReset}
                  onReview={handleReview}
                />

                <div className="flex flex-wrap justify-center gap-3 mt-8">
                  <Link
                    to="/profile"
                    className={`px-6 py-3 rounded-xl text-sm font-semibold border transition-all hover:scale-[1.02] ${
                      isDarkMode ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={() => { setActiveTab("leaderboard"); fetchLeaderboard(result.skillName); setTestStep("setup"); }}
                    className={`px-6 py-3 rounded-xl text-sm font-semibold border transition-all hover:scale-[1.02] ${
                      isDarkMode ? "border-amber-500/30 text-amber-400 hover:bg-amber-500/10" : "border-amber-200 text-amber-700 hover:bg-amber-50"
                    }`}
                  >
                    🏆 View Leaderboard
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
