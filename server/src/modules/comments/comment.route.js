import express from "express";
import { createComment ,getTicketComments} from "./comment.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";

const router = express.Router();

router.post(
  "/tickets/:ticketId/comments",
  authMiddleware,
  authorize("admin", "agent", "requester"),
  createComment,
);

router.get(
  "/tickets/:ticketId/comments",
  authMiddleware,
  authorize("admin", "agent", "requester"),
  getTicketComments
);

export default router;
