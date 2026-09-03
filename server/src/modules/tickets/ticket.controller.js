import {createTicketSchema,assignTicketSchema,updateTicketStatusSchema} from "./ticket.validation.js";

import {
  createTicketService,
  getAllTicketsService,
  getTicketByIdService,
  assignTicketService,
  updateTicketStatusService,
  getTicketDetailsService
} from "./ticket.service.js";
  
import { ticketFilterSchema } from "./ticket.filter.validation.js";

// CREATE TICKET
export const createTicket = async (req, res, next) => {
  try {
    // Validate request body
    const data = createTicketSchema.parse(req.body);

    // Create ticket
    const ticket = await createTicketService(data, req.user);

    return res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL TICKETS
export const getAllTickets = async (req, res, next) => {
  try {
    // Validate query parameters
    const query = ticketFilterSchema.parse(req.query);

    const tickets = await getAllTicketsService(
      req.user,
      query
    );

    return res.status(200).json({
      success: true,
      message: "Tickets fetched successfully",
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
};

// GET TICKET BY ID
export const getTicketById = async (req, res, next) => {
  try {
    const ticket = await getTicketByIdService(req.params.id, req.user);

    return res.status(200).json({
      success: true,
      message: "Ticket fetched successfully",
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// ASSIGN TICKET
export const assignTicket = async (req, res, next) => {
  try {
    // Validate request body
    const data = assignTicketSchema.parse(req.body);

    // Assign ticket
    const ticket = await assignTicketService(
      req.params.id,
      data.agentId,
      req.user,
    );

    return res.status(200).json({
      success: true,
      message: "Ticket assigned successfully",
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE TICKET STATUS
export const updateTicketStatus = async (req, res, next) => {
  try {
    // Validate request body
    const data = updateTicketStatusSchema.parse(req.body);

    // Update status
    const ticket = await updateTicketStatusService(
      req.params.id,
      data.status,
      req.user,
    );

    return res.status(200).json({
      success: true,
      message: "Ticket status updated successfully",
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// GET TICKET DETAILS
export const getTicketDetails = async (req, res, next) => {
  try {
    const details = await getTicketDetailsService(req.params.id, req.user);
    
    return res.status(200).json({
      success: true,
      message: "Ticket details fetched successfully",
      data: details,
    });
  } catch (error) {
    next(error);
  }
};