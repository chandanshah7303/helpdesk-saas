import Category from "./category.model.js";

import { ApiError } from "../../utils/ApiError.js";

// CREATE CATEGORY
export const createCategoryService = async (data, user) => {
  // Check duplicate category
  const existingCategory = await Category.findOne({
    organizationId: user.organizationId,
    name: data.name,
  });

  if (existingCategory) {
    throw new ApiError("Category with this name already exists in your organization",409);
  }

  const category = await Category.create({
    name: data.name,
    description: data.description,
    organizationId: user.organizationId,
  });

  return category;
};

// GET ALL CATEGORIES
export const getAllCategoriesService = async (user) => {
  const categories = await Category.find({
    organizationId: user.organizationId,
    isActive: true,
  }).sort({name: 1});
    
  return categories;
};

// UPDATE CATEGORY
export const updateCategoryService = async (categoryId, data, user) => {
  const category = await Category.findOne({
    _id: categoryId,
    organizationId: user.organizationId,
    isActive: true,
  });

  if (!category) {
    throw new ApiError("Category not found in your organization", 404);
  }

  // Update name
  if (data.name !== undefined) {
    const existingCategory = await Category.findOne({
      organizationId: user.organizationId,
      name: data.name,
      _id: { $ne: categoryId },
    });

    if (existingCategory) {
      throw new ApiError("Category with this name already exists in your organization",409);
    }
    category.name = data.name;
  }

  // Update description
  if (data.description !== undefined) {
    category.description = data.description;
  }
  await category.save();

  return category;
};

// DEACTIVATE CATEGORY
export const deactivateCategoryService = async (categoryId, user) => {
  const category = await Category.findOne({
    _id: categoryId,
    organizationId: user.organizationId,
    isActive: true,
  });

  if (!category) {
    throw new ApiError("Category not found in your organization", 404);
  }

  category.isActive = false;

  await category.save();

  return category;
};
