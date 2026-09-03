import Ticket from "../tickets/ticket.model.js";
import Comment from "./comment.model.js";

import { createAuditLog } from "../auditLogs/auditLog.service.js";
import { ApiError } from "../../utils/ApiError.js";

// CREATE COMMENT
export const createCommentService = async (ticketId, message, user) => {
  // Find ticket inside user's organization
  const ticket = await Ticket.findOne({
    _id: ticketId,
    organizationId: user.organizationId,
  });

  if (!ticket) {
    throw new ApiError("Ticket not found", 404);
  }

  // Closed ticket cannot receive new comments
  if (ticket.status === "closed") {
    throw new ApiError("Cannot add comment to a closed ticket", 400);
  }

  // REQUESTER
  // Can comment only on their own ticket
  if (user.role === "requester") {
    if (ticket.createdBy.toString() !== user._id.toString()) {
      throw new ApiError("You can only comment on your own tickets", 403);
    }
  }

  // AGENT
  // Can comment only on assigned ticket
  if (user.role === "agent") {
    if (
      !ticket.assignedTo ||
      ticket.assignedTo.toString() !== user._id.toString()
    ) {
      throw new ApiError(
        "You can only comment on tickets assigned to you",
        403,
      );
    }
  }

  // ADMIN
  // Admin can comment on any ticket in their organization

  const comment = await Comment.create({
    ticketId: ticket._id,
    organizationId: user.organizationId,
    authorId: user._id,
    message,
  });

  // Audit Log
  await createAuditLog({
    ticketId: ticket._id,
    organizationId: user.organizationId,
    actorId: user._id,
    action: "comment_added",
    metadata: {
      commentId: comment._id,
    },
  });

  return comment;
};

// GET TICKET COMMENTS
export const getTicketCommentsService = async (ticketId, user) => {
  // Find ticket inside user's organization
  const ticket = await Ticket.findOne({
    _id: ticketId,
    organizationId: user.organizationId,
  });

  if (!ticket) {
    throw new ApiError("Ticket not found", 404);
  }

  // REQUESTER
  // Can view comments only on own ticket
  if (user.role === "requester") {
    if (ticket.createdBy.toString() !== user._id.toString()) {
      throw new ApiError("You can only view comments of your own tickets", 403);
    }
  }

  // AGENT
  // Can view comments only on assigned ticket
  if (user.role === "agent") {
    if (
      !ticket.assignedTo ||
      ticket.assignedTo.toString() !== user._id.toString()
    ) {
      throw new ApiError(
        "You can only view comments of tickets assigned to you",
        403,
      );
    }
  }

  // ADMIN
  // Can view comments of any ticket in their organization

  const comments = await Comment.find({
    ticketId: ticket._id,
    organizationId: user.organizationId,
  })
    .populate("authorId", "name email role")
    .sort({ createdAt: 1 });

  return comments;
};
