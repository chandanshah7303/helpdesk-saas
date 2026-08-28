import express from "express";
import { getTicketHistory } from "./auditLog.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";

const router = express.Router();

router.get(
  "/tickets/:ticketId/history",
  authMiddleware,
  authorize("admin", "agent", "requester"),
  getTicketHistory
);
 
export default router;