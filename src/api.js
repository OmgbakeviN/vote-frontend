import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "",
  headers: { "Content-Type": "application/json" },
});

// API Endpoints
export const getActiveElection = () => api.get("/api/active/");
export const getElectionAggregates = (id) => api.get(`/api/${id}/aggregates/`);
export const openElection = (id) => api.post(`/api/${id}/open/`);
export const closeElection = (id) => api.post(`/api/${id}/close/`);
export const postVote = (id, payload) => api.post(`/api/${id}/vote/`, payload);

export default api;
