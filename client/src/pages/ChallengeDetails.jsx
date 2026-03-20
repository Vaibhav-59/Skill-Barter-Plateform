// pages/ChallengeDetails.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Clock, Zap, Users, Star, Cpu, CheckCircle2,
  AlertCircle, Play, Timer, ListChecks,
} from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { getChallengeById, startChallenge } from "../services/challengeApi";
import SubmissionForm from "../components/challenges/SubmissionForm";
import { toast } from "react-toastify";

const DIFFICULTY_COLOR = {
  Easy: "text-green-400 bg-green-500/10 border-green-500/30",
  Medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  Hard: "text-red-400 bg-red-500/10 border-red-500/30",
};

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function ChallengeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getChallengeById(id);
        setChallenge(res.data);
        // If challenge has timeLimit, set timer to that
        if (res.data?.timeLimit) setTimer(res.data.timeLimit * 60);
      } catch {
        toast.error("Failed to load challenge.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setTimerRunning(false);
            toast.warning("⏰ Time's up! You can still submit your work.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [timerRunning]);

  const handleStart = async () => {
    try {
      await startChallenge(id);
      setStarted(true);
      if (challenge?.timeLimit) setTimerRunning(true);
      toast.success("🚀 Challenge started! Good luck!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to start challenge.");
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-gray-950" : "bg-gray-50"}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-fuchsia-500 border-t-transparent animate-spin" />
          <p className={isDarkMode ? "text-slate-400" : "text-gray-500"}>Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-gray-950" : "bg-gray-50"}`}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className={isDarkMode ? "text-slate-400" : "text-gray-500"}>Challenge not found.</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-fuchsia-500 hover:underline text-sm">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const diffClass = DIFFICULTY_COLOR[challenge.difficulty] || DIFFICULTY_COLOR.Medium;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-950 via-slate-950 to-gray-900"
          : "bg-gradient-to-br from-gray-50 via-slate-50 to-white"
      }`}
    >
      {/* Fixed timer bar */}
      {started && challenge.timeLimit && (
        <div
          className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center py-2 text-sm font-bold gap-2 shadow-lg ${
            timer < 300
              ? "bg-red-600/90 text-white"
              : "bg-fuchsia-700/90 text-white"
          } backdrop-blur-sm`}
        >
          <Timer className="w-4 h-4 animate-pulse" />
          Time Remaining: {formatTime(timer)}
          {timer < 300 && " ⚠️ Hurry!"}
        </div>
      )}

      <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 ${started && challenge.timeLimit ? "pt-16" : ""}`}>
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 text-sm font-medium mb-8 group ${
            isDarkMode
              ? "text-slate-400 hover:text-white"
              : "text-gray-500 hover:text-gray-900"
          } transition-colors`}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Challenges
        </button>

        {/* Challenge Hero */}
        <div
          className={`rounded-2xl border p-7 mb-6 ${
            isDarkMode
              ? "bg-gray-900/70 border-gray-800"
              : "bg-white border-gray-200"
          }`}
        >
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${diffClass}`}>
              {challenge.difficulty}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isDarkMode
                  ? "bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30"
                  : "bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200"
              }`}
            >
              {challenge.skillCategory}
            </span>
            {challenge.isDaily && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Star className="w-3 h-3 inline mr-1" />Daily
              </span>
            )}
            {challenge.isAIGenerated && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30">
                <Cpu className="w-3 h-3 inline mr-1" />AI Generated
              </span>
            )}
          </div>

          <h1
            className={`text-3xl font-extrabold mb-3 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {challenge.title}
          </h1>

          {/* Meta row */}
          <div
            className={`flex flex-wrap gap-5 text-sm mb-5 ${
              isDarkMode ? "text-slate-400" : "text-gray-500"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-fuchsia-500" />
              <strong className="text-fuchsia-500">{challenge.rewardXP} XP</strong> reward
            </span>
            {challenge.timeLimit && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {challenge.timeLimit} min time limit
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {challenge.participantsCount?.toLocaleString() || 0} participants
            </span>
          </div>

          {/* Description */}
          <p className={`text-base leading-relaxed ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
            {challenge.description}
          </p>
        </div>

        {/* Requirements */}
        {challenge.requirements?.length > 0 && (
          <div
            className={`rounded-2xl border p-6 mb-6 ${
              isDarkMode
                ? "bg-gray-900/70 border-gray-800"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-4">
              <ListChecks className="w-5 h-5 text-fuchsia-500" />
              <h2 className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Requirements
              </h2>
            </div>
            <ul className="space-y-2">
              {challenge.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className={`text-sm ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                    {req}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Input/Output examples */}
        {challenge.inputOutputExamples?.length > 0 && (
          <div
            className={`rounded-2xl border p-6 mb-6 ${
              isDarkMode
                ? "bg-gray-900/70 border-gray-800"
                : "bg-white border-gray-200"
            }`}
          >
            <h2 className={`text-lg font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              Examples
            </h2>
            {challenge.inputOutputExamples.map((ex, i) => (
              <div
                key={i}
                className={`rounded-xl p-4 mb-3 last:mb-0 text-sm font-mono ${
                  isDarkMode ? "bg-gray-800 text-slate-300" : "bg-gray-50 text-gray-800"
                }`}
              >
                {ex.input && <div><span className="text-fuchsia-500">Input: </span>{ex.input}</div>}
                {ex.output && <div><span className="text-green-500">Output: </span>{ex.output}</div>}
                {ex.explanation && (
                  <div className={`mt-1 text-xs ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
                    {ex.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        {challenge.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {challenge.tags.map((tag) => (
              <span
                key={tag}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isDarkMode
                    ? "bg-gray-800 text-slate-400"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Action section */}
        {!started && (
          <div
            className={`rounded-2xl border p-6 text-center ${
              isDarkMode
                ? "bg-gray-900/70 border-gray-800"
                : "bg-white border-gray-200"
            }`}
          >
            <p className={`text-sm mb-4 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
              Ready to take on this challenge? The timer will start once you click Start.
            </p>
            <button
              id="begin-challenge-btn"
              onClick={handleStart}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-700 text-white font-bold text-sm shadow-lg hover:opacity-90 hover:shadow-fuchsia-500/30 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4" />
              Start Challenge
            </button>
          </div>
        )}

        {/* Submission section */}
        {started && !showSubmit && (
          <div
            className={`rounded-2xl border p-6 text-center ${
              isDarkMode
                ? "bg-gray-900/70 border-fuchsia-500/20"
                : "bg-fuchsia-50 border-fuchsia-200"
            }`}
          >
            <p className={`text-sm mb-4 font-medium ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
              🎯 You're working on this challenge. When you're done, submit your solution below.
            </p>
            <button
              id="open-submit-btn"
              onClick={() => setShowSubmit(true)}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-700 text-white font-bold text-sm shadow-lg hover:opacity-90 active:scale-95 transition-all"
            >
              Submit Solution →
            </button>
          </div>
        )}

        {started && showSubmit && (
          <div
            className={`rounded-2xl border p-6 ${
              isDarkMode
                ? "bg-gray-900/70 border-gray-800"
                : "bg-white border-gray-200"
            }`}
          >
            <h2 className={`text-lg font-bold mb-5 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              Submit Your Solution
            </h2>
            <SubmissionForm
              challenge={challenge}
              isDarkMode={isDarkMode}
              onClose={() => navigate(-1)}
              onSuccess={() => {
                setTimerRunning(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
