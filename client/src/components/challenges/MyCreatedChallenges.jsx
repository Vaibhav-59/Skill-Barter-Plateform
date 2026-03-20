import { useState, useEffect } from "react";
import { Loader2, Plus, Users, Clock, CheckCircle, XCircle } from "lucide-react";
import { getMyCreatedChallenges, getChallengeSubmissions, reviewSubmission, createChallenge } from "../../services/challengeApi";
import { toast } from "react-toastify";

// Component to handle the review of a single submission
function SubmissionReviewRow({ submission, onReview, isDarkMode }) {
  const [reviewing, setReviewing] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleAction = async (status) => {
    setReviewing(true);
    try {
      await onReview(submission._id, status, feedback);
      toast.success(`Submission ${status.toLowerCase()}!`);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${status} submission`);
    } finally {
      setReviewing(false);
    }
  };

  const isPending = submission.status === "Pending";

  return (
    <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-gray-800/40 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* User Info */}
        <div className="flex items-center gap-3">
          <img src={submission.userId?.profileImage || "https://api.dicebear.com/7.x/avataaars/svg"} alt="Avatar" className="w-10 h-10 rounded-full border border-gray-500" />
          <div>
            <p className={`font-semibold text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>{submission.userId?.name}</p>
            <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>{new Date(submission.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Content Link */}
        <div className="flex-1 text-sm">
          {submission.submissionLink && (
            <a href={submission.submissionLink} target="_blank" rel="noreferrer" className="text-fuchsia-500 hover:underline block truncate max-w-xs">
              🔗 {submission.submissionLink}
            </a>
          )}
          {submission.textAnswer && (
            <p className={`mt-1 italic line-clamp-2 ${isDarkMode ? "text-slate-300" : "text-gray-600"}`}>
              "{submission.textAnswer}"
            </p>
          )}
        </div>

        {/* Status / Actions */}
        <div className="flex items-center gap-2">
          {!isPending ? (
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              submission.status === "Accepted"
                ? "bg-green-500/10 text-green-400 border border-green-500/30"
                : "bg-red-500/10 text-red-400 border border-red-500/30"
            }`}>
              {submission.status}
            </span>
          ) : (
            <div className="flex flex-col gap-2 min-w-[200px]">
              <input
                type="text"
                placeholder="Optional feedback..."
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                className={`w-full px-2 py-1 text-xs rounded border ${
                  isDarkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-800"
                }`}
              />
              <div className="flex gap-2">
                <button
                  disabled={reviewing}
                  onClick={() => handleAction("Accepted")}
                  className="flex-1 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-xs font-medium disabled:opacity-50 transition-colors"
                >
                  Accept
                </button>
                <button
                  disabled={reviewing}
                  onClick={() => handleAction("Rejected")}
                  className="flex-1 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-medium disabled:opacity-50 transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MyCreatedChallenges({ isDarkMode }) {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create Challenge Modal State
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    skillCategory: "Web Development",
    difficulty: "Medium",
    description: "",
    requirements: "", // comma separated
    rewardXP: 50,
  });

  // Selected Challenge for viewing submissions
  const [selectedChallengeId, setSelectedChallengeId] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  useEffect(() => {
    fetchMyChallenges();
  }, []);

  const fetchMyChallenges = async () => {
    try {
      const res = await getMyCreatedChallenges();
      setChallenges(res.data);
    } catch {
      toast.error("Failed to load your challenges.");
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async (id) => {
    if (selectedChallengeId === id) {
      setSelectedChallengeId(null);
      return;
    }
    
    setSelectedChallengeId(id);
    setLoadingSubs(true);
    try {
      const res = await getChallengeSubmissions(id);
      setSubmissions(res.data);
    } catch {
      toast.error("Failed to load submissions.");
    } finally {
      setLoadingSubs(false);
    }
  };

  const handleReview = async (submissionId, status, feedback) => {
    await reviewSubmission(submissionId, { status, feedback });
    
    // Update local state without refetching everything
    setSubmissions(prev => 
      prev.map(sub => sub._id === submissionId ? { ...sub, status, feedback } : sub)
    );
    
    // Update the parent challenge's pending count
    setChallenges(prev => 
      prev.map(ch => ch._id === selectedChallengeId && status !== "Pending"
        ? { ...ch, pendingCount: Math.max(0, ch.pendingCount - 1) }
        : ch
      )
    );
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const reqsArray = formData.requirements.split(',').map(r => r.trim()).filter(Boolean);
      await createChallenge({ ...formData, requirements: reqsArray });
      toast.success("Challenge created successfully!");
      setIsCreating(false);
      setFormData({ title: "", skillCategory: "Web Development", difficulty: "Medium", description: "", requirements: "", rewardXP: 50 });
      fetchMyChallenges();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create challenge.");
    }
  };

  if (loading) {
    return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 text-fuchsia-500 animate-spin" /></div>;
  }

  const inputCls = `w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500 ${
    isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"
  }`;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>My Created Challenges</h2>
          <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>Manage challenges you created and review submissions.</p>
        </div>
        <button
          onClick={() => setIsCreating(p => !p)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-700 text-white text-sm font-semibold shadow-md active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> Create New
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className={`p-5 rounded-2xl border ${isDarkMode ? "bg-gray-900/60 border-gray-800" : "bg-white border-gray-200"}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>Title</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className={inputCls} placeholder="E.g. Build a React component" />
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>Category</label>
              <select value={formData.skillCategory} onChange={e => setFormData({...formData, skillCategory: e.target.value})} className={inputCls}>
                <option>Web Development</option><option>Data Science</option><option>UI/UX Design</option><option>AI & Machine Learning</option>
              </select>
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>Difficulty</label>
              <select value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})} className={inputCls}>
                <option>Easy</option><option>Medium</option><option>Hard</option>
              </select>
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>Reward XP</label>
              <input required type="number" min="10" max="500" value={formData.rewardXP} onChange={e => setFormData({...formData, rewardXP: e.target.value})} className={inputCls} />
            </div>
            <div className="md:col-span-2">
              <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>Requirements (comma separated)</label>
              <input type="text" value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} className={inputCls} placeholder="React, Responsive, Dark Mode..." />
            </div>
            <div className="md:col-span-2">
              <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>Description</label>
              <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className={inputCls} placeholder="Explain the challenge..." />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsCreating(false)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${isDarkMode ? "text-slate-300 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-100"}`}>Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-sm font-semibold transition-colors">Create Challenge</button>
          </div>
        </form>
      )}

      {challenges.length === 0 ? (
        <div className={`p-10 text-center rounded-2xl border ${isDarkMode ? "bg-gray-900/60 border-gray-800 text-slate-400" : "bg-white border-gray-200 text-gray-500"}`}>
          You haven't created any challenges yet.
        </div>
      ) : (
        <div className="space-y-4">
          {challenges.map(ch => (
            <div key={ch._id} className={`rounded-2xl border overflow-hidden ${isDarkMode ? "bg-gray-900/60 border-gray-800" : "bg-white border-gray-200"}`}>
              {/* Header */}
              <div className="p-5 flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-gray-500/10">
                <div>
                  <h3 className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-gray-900"}`}>{ch.title}</h3>
                  <div className={`flex flex-wrap gap-2 mt-1 text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                    <span className="bg-gray-500/10 px-2 py-0.5 rounded">{ch.skillCategory}</span>
                    <span className={`px-2 py-0.5 rounded ${ch.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500' : ch.difficulty === 'Hard' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{ch.difficulty}</span>
                    <span className="bg-fuchsia-500/10 text-fuchsia-500 px-2 py-0.5 rounded px-2">XP: {ch.rewardXP}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{ch.submissionCount}</div>
                    <div className={`text-[10px] uppercase font-bold tracking-wider ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>Total Submissions</div>
                  </div>
                  <div className="text-center px-4 border-l border-gray-500/20">
                    <div className={`text-xl font-bold ${ch.pendingCount > 0 ? "text-yellow-500" : isDarkMode ? "text-white" : "text-gray-900"}`}>{ch.pendingCount}</div>
                    <div className={`text-[10px] uppercase font-bold tracking-wider ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>Pending Review</div>
                  </div>
                  
                  <button
                    onClick={() => loadSubmissions(ch._id)}
                    className={`ml-2 px-4 py-2 flex items-center gap-2 rounded-xl text-sm font-semibold border transition-all ${
                      selectedChallengeId === ch._id
                        ? "bg-fuchsia-600 text-white border-fuchsia-600"
                        : isDarkMode
                          ? "border-gray-700 text-slate-300 hover:bg-gray-800"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    {selectedChallengeId === ch._id ? "Hide Submissions" : "View Submissions"}
                  </button>
                </div>
              </div>

              {/* Submissions List */}
              {selectedChallengeId === ch._id && (
                <div className={`p-5 ${isDarkMode ? "bg-gray-900/40" : "bg-gray-50/50"}`}>
                  {loadingSubs ? (
                    <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 text-fuchsia-500 animate-spin" /></div>
                  ) : submissions.length === 0 ? (
                    <p className={`text-center text-sm py-4 ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>No submissions yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {submissions.map(sub => (
                        <SubmissionReviewRow key={sub._id} submission={sub} onReview={handleReview} isDarkMode={isDarkMode} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
