import Ticket from "../tickets/ticket.model.js";
import User from "../users/user.model.js";

export const getAdminDashboardService = async (user) => {
  const organizationId = user.organizationId;

  const [
    totalTickets,
    pendingTickets,
    inProgressTickets,
    resolvedTickets,
    closedTickets,
    totalAgents,
    totalRequesters,
  ] = await Promise.all([
    Ticket.countDocuments({ organizationId }),

    Ticket.countDocuments({
      organizationId,
      status: "pending",
    }),

    Ticket.countDocuments({
      organizationId,
      status: "in_progress",
    }),

    Ticket.countDocuments({
      organizationId,
      status: "resolved",
    }),

    Ticket.countDocuments({
      organizationId,
      status: "closed",
    }),

    User.countDocuments({
      organizationId,
      role: "agent",
      isActive: true,
    }),

    User.countDocuments({
      organizationId,
      role: "requester",
      isActive: true,
    }),
  ]);

  return {
    tickets: {
      total: totalTickets,
      pending: pendingTickets,
      inProgress: inProgressTickets,
      resolved: resolvedTickets,
      closed: closedTickets,
    },

    users: {
      agents: totalAgents,
      requesters: totalRequesters,
    },
  };
};

export const getAgentDashboardService = async (user) => {
  const organizationId = user.organizationId;
  const agentId = user._id;

  const [totalTickets, inProgressTickets, resolvedTickets, closedTickets] =
    await Promise.all([
      Ticket.countDocuments({
        organizationId,
        assignedTo: agentId,
      }),

      Ticket.countDocuments({
        organizationId,
        assignedTo: agentId,
        status: "in_progress",
      }),

      Ticket.countDocuments({
        organizationId,
        assignedTo: agentId,
        status: "resolved",
      }),

      Ticket.countDocuments({
        organizationId,
        assignedTo: agentId,
        status: "closed",
      }),
    ]);

  return {
    tickets: {
      total: totalTickets,
      inProgress: inProgressTickets,
      resolved: resolvedTickets,
      closed: closedTickets,
    },
  };
};

export const getRequesterDashboardService = async (user) => {
  const organizationId = user.organizationId;
  const requesterId = user._id;

  const [
    totalTickets,
    pendingTickets,
    inProgressTickets,
    resolvedTickets,
    closedTickets,
  ] = await Promise.all([
    Ticket.countDocuments({
      organizationId,
      createdBy: requesterId,
    }),

    Ticket.countDocuments({
      organizationId,
      createdBy: requesterId,
      status: "pending",
    }),

    Ticket.countDocuments({
      organizationId,
      createdBy: requesterId,
      status: "in_progress",
    }),

    Ticket.countDocuments({
      organizationId,
      createdBy: requesterId,
      status: "resolved",
    }),

    Ticket.countDocuments({
      organizationId,
      createdBy: requesterId,
      status: "closed",
    }),
  ]);

  return {
    tickets: {
      total: totalTickets,
      pending: pendingTickets,
      inProgress: inProgressTickets,
      resolved: resolvedTickets,
      closed: closedTickets,
    },
  };
};
