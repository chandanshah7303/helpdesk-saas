import api from "./api.js";

export const getTickets = async (params = {}) => {
  const response = await api.get("/tickets", {
    params,
  });

  return response.data;
};

export const getTicketById = async (ticketId) => {
  const response = await api.get(`/tickets/${ticketId}`);

  return response.data;
};

export const createTicket = async (data) => {
  const response = await api.post("/tickets", data);

  return response.data;
};

export const assignTicket = async (ticketId, agentId) => {
  const response = await api.patch(`/tickets/${ticketId}/assign`, { agentId });

  return response.data;
};

export const updateTicketStatus = async (ticketId, status) => {
  const response = await api.patch(`/tickets/${ticketId}/status`, { status });

  return response.data;
};

export const getTicketDetails = async (ticketId) => {
  const response = await api.get(`/tickets/${ticketId}/details`);

  return response.data;
};

// CREATE COMMENT
export const createComment = async (ticketId, message) => {
  const response = await api.post(`/tickets/${ticketId}/comments`, {
    message,
  });

  return response.data;
};
