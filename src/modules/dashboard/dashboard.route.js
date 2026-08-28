import express from "express";

import { getAdminDashboard, getAgentDashboard, getRequesterDashboard} from "./dashboard.controller.js";

import { authMiddleware } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";

const router = express.Router();

router.get("/admin", authMiddleware, authorize("admin"), getAdminDashboard);
router.get("/agent", authMiddleware, authorize("agent"), getAgentDashboard);
router.get("/requester", authMiddleware, authorize("requester"), getRequesterDashboard);

export default router;
