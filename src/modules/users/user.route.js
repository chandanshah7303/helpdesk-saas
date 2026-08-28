import express from "express";

import { createUser, getAllUsers, getUserById, updateUser, deactivateUser } from "./user.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";

const router = express.Router();

// Create User
router.post("/", authMiddleware, authorize("admin"), createUser);

// Get All Users
router.get("/", authMiddleware, authorize("admin"), getAllUsers);

// Get User By ID
router.get("/:id", authMiddleware, authorize("admin"), getUserById);

// Update User
router.patch("/:id", authMiddleware, authorize("admin"), updateUser);

// Deactivate User
router.patch( "/:id/deactivate", authMiddleware, authorize("admin"), deactivateUser );
  
export default router;
