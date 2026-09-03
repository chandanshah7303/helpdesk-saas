import api from "./api";

// GET ALL CATEGORIES
export const getCategories = async () => {
  const response = await api.get("/categories");

  return response.data;
};

// CREATE CATEGORY
export const createCategory = async (data) => {
  const response = await api.post("/categories", data);

  return response.data;
};

// UPDATE CATEGORY
export const updateCategory = async (categoryId, data) => {
  const response = await api.patch(`/categories/${categoryId}`, data);

  return response.data;
};

// DEACTIVATE CATEGORY
export const deactivateCategory = async (categoryId) => {
  const response = await api.delete(`/categories/${categoryId}/deactivate`);

  return response.data;
};
