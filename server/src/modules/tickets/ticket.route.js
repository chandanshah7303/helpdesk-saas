import express from "express";
import { createTicket,getAllTickets,getTicketById,assignTicket,updateTicketStatus,getTicketDetails } from "./ticket.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";

const router = express.Router();

router.post("/",authMiddleware,authorize("requester", "admin"),createTicket);
router.get("/",authMiddleware,authorize( "admin","agent","requester"),getAllTickets);
router.get("/:id",authMiddleware,authorize("admin", "agent", "requester"),getTicketById);
router.patch("/:id/assign",authMiddleware,authorize("admin"),assignTicket);
router.patch("/:id/status",authMiddleware,authorize("admin", "agent"),updateTicketStatus);
router.get("/:id/details",authMiddleware,authorize("admin", "agent", "requester"),getTicketDetails);

export default router; 