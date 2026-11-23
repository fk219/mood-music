import api from "../../shared/services/api";

export const recordMoodEntry = async ({ mood, source }) => {
  const response = await api.post("/api/mood", { mood, source });
  return response.data;
};

export const getMoodSummary = async () => {
  const response = await api.get("/api/mood/summary");
  return response.data;
};

export const clearMoodHistory = async () => {
  const response = await api.delete("/api/mood");
  return response.data;
};
