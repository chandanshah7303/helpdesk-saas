import api from "./api.js";

export const getAdminDashboard = async () => {
  const response = await api.get("/dashboard/admin");

  return response.data;
};

export const getAgentDashboard = async () => {
  const response = await api.get("/dashboard/agent");

  return response.data;
};

export const getRequesterDashboard = async () => {
  const response = await api.get("/dashboard/requester");

  return response.data;
};
