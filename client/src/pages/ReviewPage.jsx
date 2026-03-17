import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../utils/api";
import { showError, showSuccess } from "../utils/toast";

export default function ReviewPage() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const type = searchParams.get("type") || "match";

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [review, setReview] = useState({
    rating: 5,
    comment: "",
    skillDelivered: true,
    wouldRecommend: true,
    skillOfferedRating: 5,
    skillRequestedRating: 5,
    communication: 5,
    reliability: 5,
  });

  useEffect(() => {
    fetchMatch();
  }, [matchId]);

  const fetchMatch = async () => {
    try {
      const endpoint = type === "contract" ? `/contracts/${matchId}` : `/matches/${matchId}`;
      const response = await api.get(endpoint);
      const matchData = response.data.data;
      if (matchData.status !== "completed") {
        showError(`Can only review completed ${type}s`);
        navigate(type === "contract" ? "/contracts" : "/matches");
        return;
      }
      setMatch(matchData);
    } catch (err) {
      showError(`Failed to load ${type} details`);
      navigate(type === "contract" ? "/contracts" : "/matches");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!review.comment.trim()) {
      showError("Please write a comment about your experience");
      return;
    }
    setSubmitting(true);
    try {
      const endpoint = type === "contract" ? `/contracts/${matchId}/review` : `/matches/${matchId}/review`;
      await api.post(endpoint, {
        rating: review.rating,
        comment: review.comment,
        skillDelivered: review.skillDelivered,
        wouldRecommend: review.wouldRecommend,
        teachingQuality: review.skillOfferedRating,
        communication: review.communication,
        reliability: review.reliability,
        reviewee: otherUser._id,
        skillOffered: taughtSkillInfo.name,
        skillRequested: learnedSkillInfo.name,
      });
      showSuccess("Review submitted successfully!");
      navigate(type === "contract" ? "/contracts" : "/matches");
    } catch (err) {
      showError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const RatingBox = ({ value, onClick, active }) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold transition-all duration-200 ${
        active
          ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg shadow-yellow-500/30 scale-110"
          : "bg-slate-800 text-slate-500 hover:bg-slate-700 hover:scale-105"
      }`}
    >
      {value}
    </button>
  );

  const ToggleButton = ({ active, onClick, label, positive = true }) => (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-200 ${
        active
          ? positive
            ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30"
            : "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30"
          : "bg-slate-800 text-slate-500 hover:bg-slate-700"
      }`}
    >
      {label}
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-lg">Loading review form...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-slate-950 flex items-center justify-center">
        <div className="text-center bg-slate-900/50 border border-slate-800 rounded-2xl p-12">
          <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Match Not Found</h2>
          <p className="text-slate-400">The requested match could not be found.</p>
        </div>
      </div>
    );
  }

  const isA = type === "contract" ? (match.userA?._id === user._id) : false;
  const otherUser = type === "contract" 
    ? (isA ? match.userB : match.userA)
    : (match.requester?._id === user._id ? match.receiver : match.requester);
    
  const skillIOffered = type === "contract" 
    ? (isA ? match.skillTeach : match.skillLearn)
    : match.skillOffered;
    
  const skillIRequested = type === "contract"
    ? (isA ? match.skillLearn : match.skillTeach)
    : match.skillRequested;
  
  const otherUserTeachSkills = otherUser?.teachSkills || [];
  const otherUserLearnSkills = otherUser?.learnSkills || [];
  
  const getSkillDisplayName = (skillName) => {
    if (otherUserTeachSkills.find(s => s.name === skillName)) {
      return { name: skillName, type: 'teach' };
    }
    if (otherUserLearnSkills.find(s => s.name === skillName)) {
      return { name: skillName, type: 'learn' };
    }
    return { name: skillName, type: 'teach' };
  };
  
  const taughtSkillInfo = getSkillDisplayName(skillIOffered);
  const learnedSkillInfo = getSkillDisplayName(skillIRequested);

  const overallStars = [1, 2, 3, 4, 5];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-3xl">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 mb-6">
          <div className="text-center">
            <div className="relative inline-block mb-4">
              <div className="w-28 h-28 bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30 overflow-hidden">
                {otherUser.profileImage ? (
                  <img 
                    src={otherUser.profileImage} 
                    alt={otherUser.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl font-bold text-white">
                    {otherUser.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
            
            <h1 className="text-3xl font-black text-white mb-2">Rate Your Experience</h1>
            <p className="text-xl text-slate-300 mb-1">with <span className="text-emerald-400 font-bold">{otherUser.name}</span></p>
            <p className="text-sm text-slate-500">Your feedback helps the community grow</p>
          </div>
        </div>

        {/* Skills Card */}
        <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 mb-6">
          <h2 className="text-lg font-bold text-white text-center mb-6">{otherUser?.name}'s Skills</h2>
          <div className="grid grid-cols-3 items-center gap-4">
            <div className="text-center">
              <div className="bg-gradient-to-br from-emerald-500/30 to-green-500/20 border border-emerald-400/30 rounded-2xl p-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="text-xs text-emerald-400 font-semibold mb-1">Learns</p>
                <p className="text-sm font-bold text-white leading-tight">{skillIRequested}</p>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-14 h-14 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-teal-500/30 to-blue-500/20 border border-teal-400/30 rounded-2xl p-4">
                <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p className="text-xs text-teal-400 font-semibold mb-1">Teaches</p>
                <p className="text-sm font-bold text-white leading-tight">{skillIOffered}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Review Form */}
        <form onSubmit={handleSubmitReview} className="space-y-5">
          {/* Overall Rating */}
          <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white text-center mb-2">Overall Experience</h3>
            <p className="text-slate-400 text-center mb-6">How was your overall skill exchange?</p>
            
            <div className="flex justify-center gap-2 mb-4">
              {overallStars.map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReview((prev) => ({ ...prev, rating: star }))}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-200 ${
                    star <= review.rating
                      ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg shadow-yellow-500/40 scale-110"
                      : "bg-slate-800 text-slate-600 hover:bg-slate-700 hover:scale-105"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            
            <div className="text-center">
              <span className="inline-block px-5 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 text-emerald-400 rounded-full font-bold">
                {review.rating} / 5 Stars
              </span>
            </div>
          </div>

          {/* Detailed Ratings */}
          <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white text-center mb-6">Rate Each Aspect</h3>
            
            <div className="space-y-4">
              {/* Skill Taught */}
              <div className="bg-slate-800/50 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{taughtSkillInfo.name}</span>
                    <span className="text-xs px-2 py-0.5 bg-teal-500/20 text-teal-400 rounded-full">Teaches</span>
                  </div>
                  <span className="text-yellow-400 font-bold">{review.skillOfferedRating}/5</span>
                </div>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <RatingBox
                      key={val}
                      value={val}
                      active={val <= review.skillOfferedRating}
                      onClick={() => setReview((prev) => ({ ...prev, skillOfferedRating: val }))}
                    />
                  ))}
                </div>
              </div>

              {/* Skill Learned */}
              <div className="bg-slate-800/50 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{learnedSkillInfo.name}</span>
                    <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">Learns</span>
                  </div>
                  <span className="text-yellow-400 font-bold">{review.skillRequestedRating}/5</span>
                </div>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <RatingBox
                      key={val}
                      value={val}
                      active={val <= review.skillRequestedRating}
                      onClick={() => setReview((prev) => ({ ...prev, skillRequestedRating: val }))}
                    />
                  ))}
                </div>
              </div>

              {/* Communication */}
              <div className="bg-slate-800/50 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-white">Communication</span>
                  <span className="text-yellow-400 font-bold">{review.communication}/5</span>
                </div>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <RatingBox
                      key={val}
                      value={val}
                      active={val <= review.communication}
                      onClick={() => setReview((prev) => ({ ...prev, communication: val }))}
                    />
                  ))}
                </div>
              </div>

              {/* Reliability */}
              <div className="bg-slate-800/50 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-white">Reliability</span>
                  <span className="text-yellow-400 font-bold">{review.reliability}/5</span>
                </div>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <RatingBox
                      key={val}
                      value={val}
                      active={val <= review.reliability}
                      onClick={() => setReview((prev) => ({ ...prev, reliability: val }))}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Questions */}
          <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white text-center mb-6">Quick Feedback</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-300 text-center">Skill Delivered?</p>
                <div className="flex gap-2">
                  <ToggleButton
                    active={review.skillDelivered === true}
                    onClick={() => setReview((prev) => ({ ...prev, skillDelivered: true }))}
                    label="Yes"
                    positive={true}
                  />
                  <ToggleButton
                    active={review.skillDelivered === false}
                    onClick={() => setReview((prev) => ({ ...prev, skillDelivered: false }))}
                    label="No"
                    positive={false}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-300 text-center">Recommend?</p>
                <div className="flex gap-2">
                  <ToggleButton
                    active={review.wouldRecommend === true}
                    onClick={() => setReview((prev) => ({ ...prev, wouldRecommend: true }))}
                    label="Yes"
                    positive={true}
                  />
                  <ToggleButton
                    active={review.wouldRecommend === false}
                    onClick={() => setReview((prev) => ({ ...prev, wouldRecommend: false }))}
                    label="No"
                    positive={false}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Comment */}
          <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-2">Your Review</h3>
            <p className="text-slate-400 mb-4">Share your experience with others</p>
            
            <textarea
              value={review.comment}
              onChange={(e) => setReview((prev) => ({ ...prev, comment: e.target.value }))}
              placeholder="What was your experience like? What did you learn? Would you exchange skills again?"
              rows={5}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent resize-none"
              required
            />
            
            <div className="flex justify-between items-center mt-3">
              <span className="text-sm text-slate-500">Minimum 10 characters</span>
              <span className={`text-sm font-bold px-4 py-1.5 rounded-full ${
                review.comment.length >= 10 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30' 
                  : 'bg-slate-700 text-slate-400'
              }`}>
                {review.comment.length}/10
              </span>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => navigate(type === "contract" ? "/contracts" : "/matches")}
              disabled={submitting}
              className="px-10 py-4 bg-slate-800 border border-slate-700 text-slate-300 rounded-2xl hover:bg-slate-700 disabled:opacity-50 transition-all font-semibold"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={submitting || review.comment.length < 10}
              className="px-12 py-4 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white rounded-2xl hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-lg shadow-xl shadow-emerald-500/30"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
