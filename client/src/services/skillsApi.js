// services/skillsApi.js
import api from "../utils/api";

export const skillsApi = {
  // Fetch all skills with expert counts
  getAllSkills: () => api.get("/skills/explore"),

  // Fetch experts for a specific skill
  getExpertsBySkill: (skillName) =>
    api.get(`/skills/explore/${encodeURIComponent(skillName)}/experts`),

  // Fetch a single expert's full profile
  getExpertProfile: (expertId) =>
    api.get(`/skills/explore/expert/${expertId}`),
};
