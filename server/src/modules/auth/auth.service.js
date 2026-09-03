import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../users/user.model.js";
import Organization from "../organizations/organization.model.js";

import { ApiError } from "../../utils/ApiError.js";

// REGISTER USER
export const registerService = async (data) => {
  const { organizationId, name, email, password } = data;

  // Check Organization
  const organization = await Organization.findOne({
    _id: organizationId,
    isActive: true,
  });

  if (!organization) {
    throw new ApiError("Organization not found or inactive", 404);
  }

  // Check Existing User
  const existingUser = await User.findOne({
    email,
  });

  if (existingUser) {
    throw new ApiError("Email already exists", 409);
  }

  const saltRounds = 10;

  // Hash Password
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create User
  const user = await User.create({
    name,
    email,
    password: hashedPassword,

    // First user will be admin
    role: "admin",

    organizationId: organization._id,
  });

  return {
    organization,
    user,
  };
};

// LOGIN
export const loginService = async (data) => {
  const { email, password } = data;

  // Find User
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError("Invalid email or password", 401);
  }

  // Compare Password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new ApiError("Invalid email or password", 401);
  }

  // Check Organization
  const organization = await Organization.findOne({
    _id: user.organizationId,
    isActive: true,
  });

  if (!organization) {
    throw new ApiError("Organization is inactive or not found", 403);
  }

  // Generate JWT
  if (!process.env.JWT_SECRET) {
    throw new ApiError("JWT_SECRET is not configured", 500);
  }

  const token = jwt.sign(
    {
      userId: user._id,
      organizationId: user.organizationId,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
  );

  // Remove Password From Response
  const safeUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
  };

  return {
    token,
    user: safeUser,
  };
};

// CHANGE PASSWORD
export const changePasswordService = async (userId, data) => {
  const { currentPassword, newPassword } = data;

  // Find logged-in user
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // Check current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    throw new ApiError("Current password is incorrect", 401);
  }

  // Hash new password
  const saltRounds = 10;

  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

  // Update password
  user.password = hashedPassword;

  await user.save();

  return {
    message: "Password changed successfully",
  };
};
