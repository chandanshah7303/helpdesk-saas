import bcrypt from "bcrypt";

import User from "./user.model.js";
import Organization from "../organizations/organization.model.js";

import { ApiError } from "../../utils/ApiError.js";

// CREATE USER
export const createUserService = async (data, admin) => {
  // Check organization
  const organization = await Organization.findOne({
    _id: admin.organizationId,
    isActive: true,
  });

  if (!organization) {
    throw new ApiError("Organization not found or inactive", 404);
  }

  // Check duplicate email
  const existingUser = await User.findOne({
    organizationId: admin.organizationId,
    email: data.email,
  });

  if (existingUser) {
    throw new ApiError(
      "User with this email already exists in your organization",
      409,
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 12);

  // Create user
  const user = await User.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    role: data.role,
    organizationId: admin.organizationId,
  });

  // Remove password from response
  const userObject = user.toObject();

  delete userObject.password;

  return userObject;
};

// GET ALL USERS
export const getAllUsersService = async (admin, query) => {
  const page = Math.max(Number(query.page) || 1, 1);

  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);

  const skip = (page - 1) * limit;

  const filter = {
    organizationId: admin.organizationId,
  };

  // Role filter
  if (query.role) {
    filter.role = query.role;
  }

  // Active filter
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === "true";
  }

  // Search
  if (query.search) {
    filter.name = {
      $regex: query.search,
      $options: "i",
    };
  }

  const users = await User.find(filter)
    .select("-password")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalUsers = await User.countDocuments(filter);

  return {
    users,
    pagination: {
      total: totalUsers,
      page,
      limit,
      totalPages: Math.ceil(totalUsers / limit),
    },
  };
};

// GET USER BY ID
export const getUserByIdService = async (userId, admin) => {
  const user = await User.findOne({
    _id: userId,
    organizationId: admin.organizationId,
  }).select("-password");

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  return user;
};

// UPDATE USER
export const updateUserService = async (userId, data, admin) => {
  const user = await User.findOne({
    _id: userId,
    organizationId: admin.organizationId,
  });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // Name
  if (data.name !== undefined) {
    user.name = data.name;
  }

  // Email
  if (data.email !== undefined) {
    const existingUser = await User.findOne({
      organizationId: admin.organizationId,
      email: data.email,
      _id: { $ne: userId },
    });

    if (existingUser) {
      throw new ApiError("Email already exists in your organization", 409);
    }

    user.email = data.email;
  }

  // Role
  if (data.role !== undefined) {
    user.role = data.role;
  }

  // Active status
  if (data.isActive !== undefined) {
    user.isActive = data.isActive;
  }

  // Password
  if (data.password) {
    user.password = await bcrypt.hash(data.password, 12);
  }

  await user.save();

  const userObject = user.toObject();

  delete userObject.password;

  return userObject;
};

// DEACTIVATE USER
export const deactivateUserService = async (userId, admin) => {
  // Prevent admin from deactivating himself
  if (userId.toString() === admin._id.toString()) {
    throw new ApiError("You cannot deactivate your own account", 400);
  }

  const user = await User.findOne({
    _id: userId,
    organizationId: admin.organizationId,
  });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (!user.isActive) {
    throw new ApiError("User is already inactive", 400);
  }

  user.isActive = false;

  await user.save();

  const userObject = user.toObject();

  delete userObject.password;

  return userObject;
};
