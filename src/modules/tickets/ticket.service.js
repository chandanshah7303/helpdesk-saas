import Ticket from "./ticket.model.js";
import User from "../users/user.model.js";
import Category from "../categories/category.model.js";
import Comment from "../comments/comment.model.js";
import AuditLog from "../auditLogs/auditLog.model.js";

import { createAuditLog } from "../auditLogs/auditLog.service.js";
import { ApiError } from "../../utils/ApiError.js";
// CREATE TICKET
export const createTicketService = async (data, user) => {

  // Check Category
  const category = await Category.findOne({
    _id: data.categoryId,
    organizationId: user.organizationId,
    isActive: true,
  });

  if (!category) {
    throw new ApiError(
      "Category not found in your organization",
      404
    );
  }

  // Create Ticket
  const ticket = await Ticket.create({
    title: data.title,
    description: data.description,
    priority: data.priority,

    categoryId: category._id,

    organizationId: user.organizationId,
    createdBy: user._id,
  });

  // Audit Log
  await createAuditLog({
    ticketId: ticket._id,
    organizationId: user.organizationId,
    actorId: user._id,
    action: "ticket_created",
  });

  return ticket;
};

// GET ALL TICKETS
export const getAllTicketsService = async (user, query) => {

const page = query.page;
const limit = query.limit;

const skip = (page - 1) * limit;

  // Base Filter
  const filter = {
    organizationId: user.organizationId,
  };

  // ----------------------------------------------------
  // ROLE BASED ACCESS
  // ----------------------------------------------------

  // Agent → assigned tickets only
  if (user.role === "agent") {
    filter.assignedTo = user._id;
  }

  // Requester → own tickets only
  if (user.role === "requester") {
    filter.createdBy = user._id;
  }

  // STATUS FILTER
  if (query.status) {
    filter.status = query.status;
  }

  // PRIORITY FILTER
  if (query.priority) {
    filter.priority = query.priority;
  }

  // SEARCH
  if (query.search) {
    filter.title = {
      $regex: query.search.trim(),
      $options: "i",
    };
  }

  // GET TICKETS
  const tickets = await Ticket.find(filter)
    .populate("createdBy", "name email role")
    .populate("assignedTo", "name email role")
    .populate("categoryId", "name description")
    .sort({
      createdAt: -1,
    })
    .skip(skip)
    .limit(limit);

  // TOTAL
  const totalTickets =
    await Ticket.countDocuments(filter);


  return {
    tickets,

    pagination: {
      total: totalTickets,
      page,
      limit,
      totalPages: Math.ceil(
        totalTickets / limit
      ),
    },
  };
};

// GET TICKET BY ID
export const getTicketByIdService = async (
  ticketId,
  user
) => {

  // Multi-Tenant Ticket Lookup
  const ticket = await Ticket.findOne({
    _id: ticketId,
    organizationId: user.organizationId,
  })
    .populate("createdBy", "name email role")
    .populate("assignedTo", "name email role")
    .populate("categoryId", "name description");


  if (!ticket) {
    throw new ApiError(
      "Ticket not found",
      404
    );
  }

  // ADMIN
  if (user.role === "admin") {
    return ticket;
  }

  // AGENT
  if (user.role === "agent") {

    if (
      ticket.assignedTo &&
      ticket.assignedTo._id.toString() ===
        user._id.toString()
    ) {
      return ticket;
    }

    throw new ApiError(
      "Access denied",
      403
    );
  }

  // REQUESTER
  if (user.role === "requester") {

    if (
      ticket.createdBy &&
      ticket.createdBy._id.toString() ===
        user._id.toString()
    ) {
      return ticket;
    }

    throw new ApiError(
      "Access denied",
      403
    );
  }


  throw new ApiError(
    "Access denied",
    403
  );
};

// ASSIGN TICKET
export const assignTicketService = async (
  ticketId,
  agentId,
  admin
) => {

  // Find Ticket
  const ticket = await Ticket.findOne({
    _id: ticketId,
    organizationId: admin.organizationId,
  });

  if (!ticket) {
    throw new ApiError(
      "Ticket not found",
      404
    );
  }


  // Find Agent
  const agent = await User.findOne({
    _id: agentId,
    organizationId: admin.organizationId,
    role: "agent",
    isActive: true,
  });

  if (!agent) {
    throw new ApiError(
      "Agent not found in your organization",
      404
    );
  }

// Prevent duplicate assignment
if (
  ticket.assignedTo &&
  ticket.assignedTo.toString() === agent._id.toString()
) {
  throw new ApiError(
    "Ticket is already assigned to this agent",
    400
  );
}

  // Save Old Values
  const oldAssignedTo = ticket.assignedTo;
  const oldStatus = ticket.status;


  // Update Ticket
  ticket.assignedTo = agent._id;
  ticket.status = "in_progress";

  await ticket.save();

  // AUDIT: ASSIGNMENT
  await createAuditLog({
    ticketId: ticket._id,
    organizationId: admin.organizationId,
    actorId: admin._id,
    action: "ticket_assigned",

    oldValue: oldAssignedTo
      ? oldAssignedTo.toString()
      : null,

    newValue: agent._id.toString(),
  });

  // AUDIT: STATUS CHANGE
  if (oldStatus !== "in_progress") {
    await createAuditLog({
      ticketId: ticket._id,
      organizationId: admin.organizationId,
      actorId: admin._id,
      action: "status_changed",

      oldValue: oldStatus,

      newValue: "in_progress",
    });
  }


  return ticket;
};

// UPDATE TICKET STATUS
export const updateTicketStatusService = async (
  ticketId,
  newStatus,
  user
) => {

  // Find Ticket
  const ticket = await Ticket.findOne({
    _id: ticketId,
    organizationId: user.organizationId,
  });

  if (!ticket) {
    throw new ApiError(
      "Ticket not found",
      404
    );
  }


  // REQUESTER
  if (user.role === "requester") {
    throw new ApiError(
      "Requester cannot change ticket status",
      403
    );
  }


  // ONLY ADMIN CAN CLOSE
  if (
    newStatus === "closed" &&
    user.role !== "admin"
  ) {
    throw new ApiError(
      "Only admin can close a ticket",
      403
    );
  }


  // AGENT → ASSIGNED TICKETS ONLY
  if (user.role === "agent") {

    if (
      !ticket.assignedTo ||
      ticket.assignedTo.toString() !==
        user._id.toString()
    ) {
      throw new ApiError(
        "You can only update tickets assigned to you",
        403
      );
    }
  }


  // TICKET MUST BE ASSIGNED BEFORE IN_PROGRESS
  if (
    newStatus === "in_progress" &&
    !ticket.assignedTo
  ) {
    throw new ApiError(
      "Ticket must be assigned to an agent before starting",
      400
    );
  }


  // ALLOWED STATUS TRANSITIONS
  const allowedTransitions = {
    pending: ["in_progress"],
    in_progress: ["resolved"],
    resolved: ["closed"],
    closed: [],
  };


  const currentStatus = ticket.status;

  const allowedNextStatuses =
    allowedTransitions[currentStatus];


  // Invalid current status
  if (!allowedNextStatuses) {
    throw new ApiError(
      `Invalid current ticket status: ${currentStatus}`,
      400
    );
  }


  // Invalid transition
  if (
    !allowedNextStatuses.includes(newStatus)
  ) {
    throw new ApiError(
      `Cannot change status from ${currentStatus} to ${newStatus}`,
      400
    );
  }


  // UPDATE STATUS
  ticket.status = newStatus;

  await ticket.save();


  // AUDIT LOG
  await createAuditLog({
    ticketId: ticket._id,
    organizationId: user.organizationId,
    actorId: user._id,
    action: "status_changed",

    oldValue: currentStatus,

    newValue: newStatus,
  });


  return ticket;
};

// GET TICKET DETAILS
export const getTicketDetailsService = async (ticketId, user) => {
  // Get ticket using existing security rules
  const ticket = await getTicketByIdService(ticketId, user);

  // Get comments
  const comments = await Comment.find({
    ticketId: ticket._id,
    organizationId: user.organizationId,
  })
    .populate("authorId", "name email role")
    .sort({ createdAt: 1 });

  // Get audit history
  const history = await AuditLog.find({
    ticketId: ticket._id,
    organizationId: user.organizationId,
  })
    .populate("actorId", "name email role")
    .sort({ createdAt: 1 });

  return {
    ticket,
    comments,
    history,
  };
};