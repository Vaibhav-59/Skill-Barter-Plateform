import { useState } from "react";
import { useTheme } from "../../hooks/useTheme";
import { createSession, updateSession } from "../../services/groupSessionApi";
import { toast } from "react-toastify";

const INITIAL = {
  title: "",
  skill: "",
  description: "",
  date: "",
  startTime: "",
  endTime: "",
  maxParticipants: 10,
  sessionType: "scheduled",
};

export default function CreateSessionForm({ onSuccess, onCancel, editData = null }) {
  const { isDarkMode } = useTheme();
  const [form, setForm] = useState(
    editData
      ? {
          title: editData.title || "",
          skill: editData.skill || "",
          description: editData.description || "",
          date: editData.date ? editData.date.slice(0, 10) : "",
          startTime: editData.startTime || "",
          endTime: editData.endTime || "",
          maxParticipants: editData.maxParticipants || 10,
          sessionType: editData.sessionType || "scheduled",
        }
      : INITIAL
  );
  const [loading, setLoading] = useState(false);

  const input = isDarkMode
    ? "bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-blue-500/50 focus:bg-white/8"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:bg-white";

  const label = isDarkMode ? "text-slate-400" : "text-gray-500";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "maxParticipants" ? +value : value }));
  };

  const validate = () => {
    if (!form.title.trim()) return "Session title is required";
    if (!form.skill.trim()) return "Skill is required";
    if (!form.date) return "Date is required";
    if (!form.startTime) return "Start time is required";
    if (!form.endTime) return "End time is required";
    if (form.startTime >= form.endTime) return "End time must be after start time";
    if (form.maxParticipants < 2) return "At least 2 participants required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return toast.error(err);

    setLoading(true);
    try {
      if (editData) {
        await updateSession(editData._id, form);
        toast.success("Session updated successfully! 🎉");
      } else {
        await createSession(form);
        toast.success("Group session created! 🚀");
      }
      onSuccess?.();
      if (!editData) setForm(INITIAL);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save session");
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = `w-full px-4 py-2.5 rounded-xl border text-sm transition-all duration-200 outline-none ${input}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Session Title */}
        <div className="sm:col-span-2">
          <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wide ${label}`}>
            Session Title *
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. React Hooks Bootcamp"
            className={fieldClass}
            maxLength={100}
          />
        </div>

        {/* Skill */}
        <div>
          <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wide ${label}`}>
            Skill to Teach *
          </label>
          <input
            name="skill"
            value={form.skill}
            onChange={handleChange}
            placeholder="e.g. React, Python, Design"
            className={fieldClass}
          />
        </div>

        {/* Session Type */}
        <div>
          <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wide ${label}`}>
            Session Type
          </label>
          <select
            name="sessionType"
            value={form.sessionType}
            onChange={handleChange}
            className={fieldClass}
          >
            <option value="scheduled">📅 Scheduled</option>
            <option value="live">🔴 Live (Instant)</option>
          </select>
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wide ${label}`}>
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="What will participants learn in this session?"
            className={`${fieldClass} resize-none`}
            rows={3}
            maxLength={500}
          />
          <p className={`text-right text-[10px] mt-0.5 ${label}`}>
            {form.description.length}/500
          </p>
        </div>

        {/* Date */}
        <div>
          <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wide ${label}`}>
            Date *
          </label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            min={new Date().toISOString().slice(0, 10)}
            className={fieldClass}
          />
        </div>

        {/* Max Participants */}
        <div>
          <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wide ${label}`}>
            Max Participants
          </label>
          <input
            type="number"
            name="maxParticipants"
            value={form.maxParticipants}
            onChange={handleChange}
            min={2}
            max={100}
            className={fieldClass}
          />
        </div>

        {/* Start Time */}
        <div>
          <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wide ${label}`}>
            Start Time *
          </label>
          <input
            type="time"
            name="startTime"
            value={form.startTime}
            onChange={handleChange}
            className={fieldClass}
          />
        </div>

        {/* End Time */}
        <div>
          <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wide ${label}`}>
            End Time *
          </label>
          <input
            type="time"
            name="endTime"
            value={form.endTime}
            onChange={handleChange}
            className={fieldClass}
          />
        </div>
      </div>

      {/* Meeting link note */}
      <div
        className={`flex items-start gap-2 px-4 py-3 rounded-xl text-xs ${
          isDarkMode
            ? "bg-blue-500/10 border border-blue-500/20 text-blue-300"
            : "bg-blue-50 border border-blue-200 text-blue-600"
        }`}
      >
        <span className="text-base">🔗</span>
        <span>
          A unique meeting link will be auto-generated for your session when its created.
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 transition-all hover:scale-[1.02] shadow-lg shadow-blue-500/30 disabled:opacity-60 disabled:hover:scale-100"
        >
          {loading
            ? editData
              ? "Updating…"
              : "Creating…"
            : editData
            ? "✓ Update Session"
            : "🚀 Create Session"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={`px-5 py-3 rounded-xl text-sm font-semibold border transition-all hover:scale-[1.02] ${
              isDarkMode
                ? "border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                : "border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
