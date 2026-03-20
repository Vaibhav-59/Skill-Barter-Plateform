// components/challenges/SubmissionForm.jsx
import { useState } from "react";
import { Link2, Upload, FileText, Send, Loader2, Sparkles, CheckCircle2, XCircle, Clock, Zap } from "lucide-react";
import { submitChallenge } from "../../services/challengeApi";
import { toast } from "react-toastify";

const TABS = [
  { id: "link", label: "Submit Link", icon: Link2 },
  { id: "text", label: "Write Answer", icon: FileText },
  { id: "file", label: "Upload File", icon: Upload },
];

// ── Verdict result card ──────────────────────────────────────────────────────
function VerdictCard({ result, onClose, isDarkMode }) {
  const isAccepted = result.status === "Accepted";
  const isRejected = result.status === "Rejected";
  const isPending  = result.status === "Pending";

  const config = isAccepted
    ? {
        bg:      isDarkMode ? "bg-green-500/10 border-green-500/25"  : "bg-green-50 border-green-200",
        icon:    <CheckCircle2 className="w-10 h-10 text-green-400" />,
        title:   "✅ Accepted!",
        titleCls: isDarkMode ? "text-green-400" : "text-green-600",
        badge:   "bg-green-500/15 text-green-400 border border-green-500/30",
        btnCls:  "bg-green-600 hover:bg-green-700",
      }
    : isRejected
    ? {
        bg:      isDarkMode ? "bg-red-500/10 border-red-500/25"      : "bg-red-50 border-red-200",
        icon:    <XCircle className="w-10 h-10 text-red-400" />,
        title:   "❌ Rejected",
        titleCls: isDarkMode ? "text-red-400" : "text-red-600",
        badge:   "bg-red-500/15 text-red-400 border border-red-500/30",
        btnCls:  "bg-red-600 hover:bg-red-700",
      }
    : {
        bg:      isDarkMode ? "bg-yellow-500/10 border-yellow-500/25" : "bg-yellow-50 border-yellow-200",
        icon:    <Clock className="w-10 h-10 text-yellow-400" />,
        title:   "⏳ Under Review",
        titleCls: isDarkMode ? "text-yellow-400" : "text-yellow-600",
        badge:   "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
        btnCls:  "bg-yellow-600 hover:bg-yellow-700",
      };

  return (
    <div className={`rounded-2xl border p-6 text-center ${config.bg}`}>
      {/* Icon */}
      <div className="flex justify-center mb-3">{config.icon}</div>

      {/* Title */}
      <h3 className={`text-2xl font-extrabold mb-1 ${config.titleCls}`}>
        {config.title}
      </h3>

      {/* Status pill */}
      <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold mb-4 ${config.badge}`}>
        {result.status}
      </span>

      {/* Score row */}
      <div className="flex items-center justify-center gap-4 mb-4">
        {typeof result.score === "number" && result.score > 0 && (
          <div
            className={`flex flex-col items-center px-5 py-2 rounded-xl border ${
              isDarkMode ? "bg-gray-800/60 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <span className={`text-2xl font-extrabold ${
              result.score >= 70
                ? isDarkMode ? "text-green-400" : "text-green-600"
                : isDarkMode ? "text-red-400" : "text-red-600"
            }`}>
              {result.score}<span className="text-base font-normal">/100</span>
            </span>
            <span className={`text-xs mt-0.5 ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>Score</span>
          </div>
        )}

        {isAccepted && result.xpAwarded > 0 && (
          <div
            className={`flex flex-col items-center px-5 py-2 rounded-xl border ${
              isDarkMode ? "bg-gray-800/60 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <span className={`text-2xl font-extrabold ${isDarkMode ? "text-fuchsia-400" : "text-fuchsia-600"}`}>
              <Zap className="inline w-5 h-5 -mt-1" /> +{result.xpAwarded}
            </span>
            <span className={`text-xs mt-0.5 ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>XP Earned</span>
          </div>
        )}
      </div>

      {/* AI Feedback box */}
      {result.aiFeedback && (
        <div
          className={`mt-1 mb-5 p-4 rounded-xl text-left text-sm border ${
            isDarkMode
              ? "bg-gray-900/60 border-gray-700 text-slate-300"
              : "bg-white border-gray-200 text-gray-700"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-fuchsia-500 flex-shrink-0" />
            <span className="font-semibold text-fuchsia-500 text-xs uppercase tracking-wider">
              AI Evaluator Feedback
            </span>
          </div>
          <p className="leading-relaxed">{result.aiFeedback}</p>
        </div>
      )}

      {/* Pending explanation */}
      {isPending && (
        <p className={`text-sm mb-4 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
          Your submission is queued for manual review. Check back in the History tab for updates.
        </p>
      )}

      {/* Rejected retry hint */}
      {isRejected && (
        <p className={`text-sm mb-4 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
          Don't give up! Read the feedback carefully and rethink your approach.
        </p>
      )}

      <button
        onClick={onClose}
        className={`px-8 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors ${config.btnCls}`}
      >
        {isAccepted ? "🎉 Awesome, Close" : isRejected ? "Review & Retry" : "Close"}
      </button>
    </div>
  );
}

export default function SubmissionForm({ challenge, onSuccess, onClose, isDarkMode }) {
  const [tab, setTab]                   = useState("link");
  const [submissionLink, setSubmissionLink] = useState("");
  const [textAnswer, setTextAnswer]     = useState("");
  const [fileUrl, setFileUrl]           = useState("");
  const [loading, setLoading]           = useState(false);
  const [result, setResult]             = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submissionLink && !textAnswer && !fileUrl) {
      toast.error("Please provide at least one submission type.");
      return;
    }
    setLoading(true);
    try {
      const res = await submitChallenge({
        challengeId: challenge._id,
        submissionLink,
        textAnswer,
        fileUrl,
      });
      setResult(res.data);

      // Show server verdict message as toast
      if (res.data?.status === "Accepted") {
        toast.success(res.message || "✅ Challenge accepted!");
      } else if (res.data?.status === "Rejected") {
        toast.error(res.message || "❌ Submission rejected.");
      } else {
        toast.info(res.message || "⏳ Submission received, pending review.");
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      const msg = err?.response?.data?.message || "Submission failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all ${
    isDarkMode
      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
      : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
  }`;

  // Show verdict card after submission
  if (result) {
    return <VerdictCard result={result} onClose={onClose} isDarkMode={isDarkMode} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Tab switcher */}
      <div
        className={`flex rounded-xl p-1 gap-1 ${
          isDarkMode ? "bg-gray-800" : "bg-gray-100"
        }`}
      >
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 ${
              tab === id
                ? "bg-fuchsia-600 text-white shadow-md"
                : isDarkMode
                ? "text-slate-400 hover:text-white"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "link" && (
        <div className="space-y-2">
          <label className={`text-sm font-medium ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
            GitHub / Live Demo URL
          </label>
          <input
            type="url"
            placeholder="https://github.com/you/project"
            value={submissionLink}
            onChange={(e) => setSubmissionLink(e.target.value)}
            className={inputClass}
          />
          <p className={`text-xs ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
            Link to your GitHub repo, live demo, CodePen, etc.
          </p>
        </div>
      )}

      {tab === "text" && (
        <div className="space-y-2">
          <label className={`text-sm font-medium ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
            Your Answer / Explanation
          </label>
          <textarea
            rows={6}
            placeholder="Describe your solution, approach, and key decisions..."
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            className={`${inputClass} resize-none`}
          />
        </div>
      )}

      {tab === "file" && (
        <div className="space-y-2">
          <label className={`text-sm font-medium ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
            File / Drive URL
          </label>
          <input
            type="url"
            placeholder="https://drive.google.com/..."
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            className={inputClass}
          />
          <p className={`text-xs ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
            Upload to Google Drive / Dropbox, then paste the shared link here.
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        id="submit-challenge-btn"
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-700 text-white font-semibold text-sm shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" /> Submit Solution
          </>
        )}
      </button>
    </form>
  );
}
