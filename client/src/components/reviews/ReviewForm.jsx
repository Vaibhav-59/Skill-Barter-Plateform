import { useState } from "react";
import { useDispatch } from "react-redux";
import { createReviewAsync } from "../../redux/slices/reviewSlice";
import { fetchSmartMatches } from "../../redux/slices/smartMatchSlice";
import { showError, showSuccess } from "../../utils/toast";

const RatingBox = ({ value, onClick, active }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold transition-all duration-200 ${
      active
        ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg shadow-yellow-500/30 scale-105"
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
    className={`flex-1 py-2.5 rounded-xl font-semibold transition-all duration-200 text-sm ${
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

export default function ReviewForm({
  revieweeId,
  revieweeName,
  matchId = null,
  skillOffered,
  skillRequested,
  onSuccess,
  onCancel,
}) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    comment: "",
    rating: 5,
    skillOfferedRating: 5,
    skillRequestedRating: 5,
    communication: 5,
    reliability: 5,
    skillDelivered: true,
    wouldRecommend: true,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.comment.trim()) {
      newErrors.comment = "Comment is required";
    } else if (formData.comment.trim().length < 10) {
      newErrors.comment = "Comment must be at least 10 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const reviewData = {
        reviewee: revieweeId,
        comment: formData.comment.trim(),
        rating: parseInt(formData.rating),
        teachingQuality: parseInt(formData.skillOfferedRating),
        communication: parseInt(formData.communication),
        reliability: parseInt(formData.reliability),
        skillDelivered: formData.skillDelivered,
        wouldRecommend: formData.wouldRecommend,
        skillOffered: skillOffered || null,
        skillRequested: skillRequested || null,
        ...(matchId && { matchId }),
      };
      const result = await dispatch(createReviewAsync(reviewData)).unwrap();
      showSuccess("Review submitted successfully!");
      dispatch(fetchSmartMatches({ refresh: true }));
      setFormData({
        comment: "", rating: 5, skillOfferedRating: 5, skillRequestedRating: 5,
        communication: 5, reliability: 5, skillDelivered: true, wouldRecommend: true,
      });
      onSuccess?.(result);
    } catch (error) {
      showError(error?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  const overallStars = [1, 2, 3, 4, 5];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Overall Rating */}
      <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
        <h3 className="text-lg font-bold text-white text-center mb-3">Overall Experience</h3>
        
        <div className="flex justify-center gap-2 mb-3">
          {overallStars.map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleInputChange("rating", star)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-200 ${
                star <= formData.rating
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg shadow-yellow-500/40 scale-105"
                  : "bg-slate-800 text-slate-600 hover:bg-slate-700 hover:scale-105"
              }`}
            >
              ★
            </button>
          ))}
        </div>
        
        <div className="text-center">
          <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 text-emerald-400 rounded-full font-bold text-sm">
            {formData.rating} / 5 Stars
          </span>
        </div>
      </div>

      {/* Detailed Ratings */}
      <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
        <h3 className="text-lg font-bold text-white text-center mb-4">Rate Each Aspect</h3>
        
        <div className="space-y-3">
          {(skillOffered && skillOffered.trim()) && (
            <div className="bg-slate-800/50 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">{skillOffered}</span>
                  <span className="text-xs px-2 py-0.5 bg-teal-500/20 text-teal-400 rounded-full">Teaches</span>
                </div>
                <span className="text-yellow-400 font-bold text-sm">{formData.skillOfferedRating}/5</span>
              </div>
              <div className="flex justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((val) => (
                  <RatingBox
                    key={`teach-${val}`}
                    value={val}
                    active={val <= formData.skillOfferedRating}
                    onClick={() => handleInputChange("skillOfferedRating", val)}
                  />
                ))}
              </div>
            </div>
          )}

          {(skillRequested && skillRequested.trim()) && (
            <div className="bg-slate-800/50 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">{skillRequested}</span>
                  <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">Learns</span>
                </div>
                <span className="text-yellow-400 font-bold text-sm">{formData.skillRequestedRating}/5</span>
              </div>
              <div className="flex justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((val) => (
                  <RatingBox
                    key={`learn-${val}`}
                    value={val}
                    active={val <= formData.skillRequestedRating}
                    onClick={() => handleInputChange("skillRequestedRating", val)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Fallback when no skills provided */}
          {(!skillOffered || !skillOffered.trim()) && (
            <div className="bg-slate-800/50 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">Teaching Quality</span>
                </div>
                <span className="text-yellow-400 font-bold text-sm">{formData.skillOfferedRating}/5</span>
              </div>
              <div className="flex justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((val) => (
                  <RatingBox
                    key={`teach-fb-${val}`}
                    value={val}
                    active={val <= formData.skillOfferedRating}
                    onClick={() => handleInputChange("skillOfferedRating", val)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="bg-slate-800/50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-white text-sm">Communication</span>
              <span className="text-yellow-400 font-bold text-sm">{formData.communication}/5</span>
            </div>
            <div className="flex justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((val) => (
                <RatingBox
                  key={val}
                  value={val}
                  active={val <= formData.communication}
                  onClick={() => handleInputChange("communication", val)}
                />
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-white text-sm">Reliability</span>
              <span className="text-yellow-400 font-bold text-sm">{formData.reliability}/5</span>
            </div>
            <div className="flex justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((val) => (
                <RatingBox
                  key={val}
                  value={val}
                  active={val <= formData.reliability}
                  onClick={() => handleInputChange("reliability", val)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Questions */}
      <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
        <h3 className="text-lg font-bold text-white text-center mb-4">Quick Feedback</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-300 text-center">Skill Delivered?</p>
            <div className="flex gap-2">
              <ToggleButton
                active={formData.skillDelivered === true}
                onClick={() => handleInputChange("skillDelivered", true)}
                label="Yes"
                positive={true}
              />
              <ToggleButton
                active={formData.skillDelivered === false}
                onClick={() => handleInputChange("skillDelivered", false)}
                label="No"
                positive={false}
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-300 text-center">Recommend?</p>
            <div className="flex gap-2">
              <ToggleButton
                active={formData.wouldRecommend === true}
                onClick={() => handleInputChange("wouldRecommend", true)}
                label="Yes"
                positive={true}
              />
              <ToggleButton
                active={formData.wouldRecommend === false}
                onClick={() => handleInputChange("wouldRecommend", false)}
                label="No"
                positive={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Comment */}
      <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
        <h3 className="text-lg font-bold text-white mb-2">Your Review</h3>
        <p className="text-slate-400 text-sm mb-3">Share your experience with others</p>
        
        <textarea
          rows={4}
          placeholder="What was your experience like? Would you exchange skills again?"
          value={formData.comment}
          onChange={(e) => handleInputChange("comment", e.target.value)}
          className={`w-full px-3 py-2.5 bg-slate-800/50 border rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-400 focus:border-transparent resize-none ${
            errors.comment ? "border-red-400" : "border-slate-700"
          }`}
          disabled={loading}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-slate-500">Minimum 10 characters</span>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            formData.comment.length >= 10 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30' 
              : 'bg-slate-700 text-slate-400'
          }`}>
            {formData.comment.length}/10
          </span>
        </div>
        {errors.comment && <p className="text-xs text-red-400 mt-1">{errors.comment}</p>}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-3 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-700 disabled:opacity-50 transition-all font-semibold"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading || !formData.comment.trim() || formData.comment.length < 10}
          className="px-8 py-3 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold shadow-xl shadow-emerald-500/30"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </form>
  );
}
