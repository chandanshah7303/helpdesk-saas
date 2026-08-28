import {
  createUserService,
  getAllUsersService,
  getUserByIdService,
  updateUserService,
  deactivateUserService,
} from "./user.service.js";

import { createUserSchema, updateUserSchema } from "./user.validation.js";

// CREATE USER
export const createUser = async (req, res, next) => {
  try {
    const data = createUserSchema.parse(req.body);

    const user = await createUserService(data, req.user);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL USERS
export const getAllUsers = async (req, res, next) => {
  try {
    const result = await getAllUsersService(req.user, req.query);

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET USER BY ID
export const getUserById = async (req, res, next) => {
  try {
    const user = await getUserByIdService(req.params.id, req.user);

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE USER
export const updateUser = async (req, res, next) => {
  try {
    const data = updateUserSchema.parse(req.body);

    const user = await updateUserService(req.params.id, data, req.user);

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// DEACTIVATE USER
export const deactivateUser = async (req, res, next) => {
  try {
    const user = await deactivateUserService(req.params.id, req.user);

    return res.status(200).json({
      success: true,
      message: "User deactivated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
