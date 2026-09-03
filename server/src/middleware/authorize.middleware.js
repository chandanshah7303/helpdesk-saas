import { ApiError } from "../utils/ApiError.js";

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // AUTHENTICATION CHECK
    if (!req.user) {
      return next(new ApiError("Authentication required", 401));
    }

    // ROLE AUTHORIZATION CHECK
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          `Role '${req.user.role}' is not allowed to access this resource`,
          403,
        ),
      );
    }

    // AUTHORIZED
    return next();
  };
};
