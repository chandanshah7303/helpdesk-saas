import express from "express";
import { createCategory, getAllCategories, updateCategory, deactivateCategory } from "./category.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";

const router = express.Router();

router.post("/categories", authMiddleware, authorize("admin"), createCategory);
router.get("/categories", authMiddleware,authorize("admin", "agent", "requester"), getAllCategories);
router.patch("/categories/:categoryId", authMiddleware,authorize("admin"), updateCategory);
router.delete("/categories/:categoryId/deactivate", authMiddleware,authorize("admin"), deactivateCategory);

export default router;
