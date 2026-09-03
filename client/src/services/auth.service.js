import api from "./api.js";

export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", credentials);

  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);

  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await api.patch("/auth/change-password", passwordData);

  return response.data;
};
