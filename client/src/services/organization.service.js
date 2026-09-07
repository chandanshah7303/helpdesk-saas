import api from "./api.js";

// CREATE ORGANIZATION
export const createOrganization = async (organizationData) => {
  const response = await api.post("/organizations", organizationData);

  return response.data;
};

// GET ORGANIZATION BY ID
export const getOrganizationById = async (organizationId) => {
  const response = await api.get(`/organizations/${organizationId}`);

  return response.data;
};

// UPDATE ORGANIZATION
export const updateOrganization = async (organizationId, organizationData) => {
  const response = await api.patch(
    `/organizations/${organizationId}`,
    organizationData,
  );

  return response.data;
};

// DEACTIVATE ORGANIZATION
export const deactivateOrganization = async (organizationId) => {
  const response = await api.patch(
    `/organizations/${organizationId}/deactivate`,
  );

  return response.data;
};
