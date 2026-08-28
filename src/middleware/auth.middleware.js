import jwt from "jsonwebtoken";
import User from "../modules/users/user.model.js";
import { ApiError } from "../utils/ApiError.js";

export const authMiddleware = async (req, res, next) => {
  try {
   if (!process.env.JWT_SECRET) {
      throw new ApiError("JWT_SECRET is not configured",500);
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || typeof authHeader !== "string") {
      throw new ApiError("Authorization header missing",401);
    }

    const [scheme, token] = authHeader.trim().split(/\s+/); //This handles multiple spaces safely.
    if (scheme !== "Bearer" || !token) {
      throw new ApiError("Invalid authorization format",401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || typeof decoded !== "object" || !decoded.userId) {
      throw new ApiError("Invalid token payload",401);
    }

    // Attach user role         
    const user = await User.findById(decoded.userId).select("_id name email role organizationId"); // More restrictive and preferable for this middleware. 
    // const user = await User.findById(decoded.userId).select("-password"); // but also this is correct 
    if (!user) {
      throw new ApiError("Unauthorized",401);
    }

    req.user = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
  };

  return next();

  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new ApiError("Token expired",401));
    }
    if (error.name === "JsonWebTokenError") {
      return next(new ApiError("Invalid token",401));
    }
    console.error(`[AUTH_ERROR]: ${error.message}`);
    return next(new ApiError("Internal server error",500));
  }
};
