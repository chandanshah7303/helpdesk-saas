import {
  createCategorySchema,
  updateCategorySchema,
} from "./category.validation.js";

import {
  createCategoryService,
  getAllCategoriesService,
  updateCategoryService,
  deactivateCategoryService,
} from "./category.service.js";

// CREATE CATEGORY
export const createCategory = async (req, res, next) => {
  try {
    const data = createCategorySchema.parse(req.body);

    const category = await createCategoryService(data, req.user);

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL CATEGORIES
export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await getAllCategoriesService(req.user);

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE CATEGORY
export const updateCategory = async (req, res, next) => {
  try {
    const data = updateCategorySchema.parse(req.body);

    const category = await updateCategoryService(
      req.params.categoryId,
      data,
      req.user,
    );

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// DEACTIVATE CATEGORY
export const deactivateCategory = async (req, res, next) => {
  try {
    const category = await deactivateCategoryService(
      req.params.categoryId,
      req.user,
    );

    return res.status(200).json({
      success: true,
      message: "Category deactivated successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};
