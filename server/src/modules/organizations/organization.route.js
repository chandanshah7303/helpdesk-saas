import express from "express";

import {
  createOrganization,
  getOrganizationById,
  updateOrganization,
  deactivateOrganization,
} from "./organization.controller.js";

const router = express.Router();

// Create 
router.post("/", createOrganization);

// Get 
router.get("/:id", getOrganizationById);

// Update 
router.patch("/:id", updateOrganization);

// Deactivate 
router.patch("/:id/deactivate", deactivateOrganization);

export default router;
