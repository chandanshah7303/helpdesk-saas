import express from "express";

import {
  createOrganization,
  getOrganizationById,
  updateOrganization,
  deactivateOrganization,
} from "./organization.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";

const router = express.Router();

// Create 
router.post("/", createOrganization);

// Get 
router.get(
  "/:id",
  authMiddleware,
  authorize("admin"),
  getOrganizationById,
);

// Update 
router.patch(
  "/:id",
  authMiddleware,
  authorize("admin"),
  updateOrganization,
);

// Deactivate 
router.patch(
  "/:id/deactivate",
  authMiddleware,
  authorize("admin"),
  deactivateOrganization,
);

export default router;
