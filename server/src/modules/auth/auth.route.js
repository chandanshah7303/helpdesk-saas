import express from "express";
import { register,login, changePassword } from "./auth.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.patch("/change-password", authMiddleware, changePassword);

export default router; 