import { registerSchema, loginSchema } from "./auth.validation.js";

import { registerService, loginService } from "./auth.service.js";

// REGISTER
export const register = async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    const result = await registerService(data);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

// LOGIN
export const login = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    const result = await loginService(data);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};
