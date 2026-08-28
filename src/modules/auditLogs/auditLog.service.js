import AuditLog from "./auditLog.model.js";
import Ticket from "../tickets/ticket.model.js";

import { ApiError } from "../../utils/ApiError.js";

// CREATE AUDIT LOG
export const createAuditLog = async ({
  ticketId,
  organizationId,
  actorId,
  action,
  oldValue = null,
  newValue = null,
  metadata = {},
}) => {
  return await AuditLog.create({
    ticketId,
    organizationId,
    actorId,
    action,
    oldValue,
    newValue,
    metadata,
  });
};

// GET TICKET HISTORY
export const getTicketHistoryService = async (ticketId, user) => {
  // Find ticket inside user's organization
  const ticket = await Ticket.findOne({
    _id: ticketId,
    organizationId: user.organizationId,
  });

  if (!ticket) {
    throw new ApiError("Ticket not found", 404);
  }

  // REQUESTER
  // Can view history only of own ticket
  if (user.role === "requester") {
    if (ticket.createdBy.toString() !== user._id.toString()) {
      throw new ApiError("Access denied", 403);
    }
  }

  // AGENT
  // Can view history only of assigned ticket
  if (user.role === "agent") {
    if (
      !ticket.assignedTo ||
      ticket.assignedTo.toString() !== user._id.toString()
    ) {
      throw new ApiError("Access denied", 403);
    }
  }

  // ADMIN
  // Can view any ticket history inside organization

  const history = await AuditLog.find({
    ticketId: ticket._id,
    organizationId: user.organizationId,
  })
    .populate("actorId", "name email role")
    .sort({ createdAt: 1 });

  return history;
};
