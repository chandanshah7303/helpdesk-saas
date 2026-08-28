import { describe, it, expect, vi, beforeEach } from "vitest";

import request from "supertest";

import app from "../src/app.js";

import Ticket from "../src/modules/tickets/ticket.model.js";

import AuditLog from "../src/modules/auditLogs/auditLog.model.js";

import { createAuditLog } from "../src/modules/auditLogs/auditLog.service.js";

// --------------------------------------------------
// MOCK AUTH USER
// --------------------------------------------------

const mockUser = {
  _id: "507f1f77bcf86cd799439033",

  organizationId: "507f1f77bcf86cd799439032",

  role: "admin",
};

// --------------------------------------------------
// MOCK AUTH MIDDLEWARE
// --------------------------------------------------

vi.mock("../src/middleware/auth.middleware.js", () => ({
  authMiddleware: (req, res, next) => {
    req.user = mockUser;

    next();
  },
}));

// --------------------------------------------------
// AUDIT LOG TESTS
// --------------------------------------------------

describe("Audit Log API", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    // Reset user for every test
    mockUser._id = "507f1f77bcf86cd799439033";

    mockUser.organizationId = "507f1f77bcf86cd799439032";

    mockUser.role = "admin";
  });

  // ------------------------------------------------
  // CREATE AUDIT LOG — SUCCESS
  // ------------------------------------------------

  it("should create an audit log successfully", async () => {
    const fakeAuditLog = {
      _id: "507f1f77bcf86cd799439030",

      ticketId: "507f1f77bcf86cd799439031",

      organizationId: "507f1f77bcf86cd799439032",

      actorId: "507f1f77bcf86cd799439033",

      action: "status_changed",

      oldValue: "pending",

      newValue: "in_progress",

      metadata: {
        source: "ticket_status_update",
      },
    };

    const createSpy = vi
      .spyOn(AuditLog, "create")
      .mockResolvedValue(fakeAuditLog);

    const result = await createAuditLog({
      ticketId: fakeAuditLog.ticketId,

      organizationId: fakeAuditLog.organizationId,

      actorId: fakeAuditLog.actorId,

      action: fakeAuditLog.action,

      oldValue: fakeAuditLog.oldValue,

      newValue: fakeAuditLog.newValue,

      metadata: fakeAuditLog.metadata,
    });

    expect(result).toEqual(fakeAuditLog);

    expect(createSpy).toHaveBeenCalledOnce();

    expect(createSpy).toHaveBeenCalledWith({
      ticketId: fakeAuditLog.ticketId,

      organizationId: fakeAuditLog.organizationId,

      actorId: fakeAuditLog.actorId,

      action: "status_changed",

      oldValue: "pending",

      newValue: "in_progress",

      metadata: {
        source: "ticket_status_update",
      },
    });
  });

  // ------------------------------------------------
  // GET TICKET HISTORY — ADMIN SUCCESS
  // ------------------------------------------------

  it("should allow admin to view ticket history", async () => {
    const ticketId = "507f1f77bcf86cd799439031";

    const fakeTicket = {
      _id: ticketId,

      organizationId: mockUser.organizationId,

      createdBy: "507f1f77bcf86cd799439011",

      assignedTo: "507f1f77bcf86cd799439034",
    };

    const fakeHistory = [
      {
        _id: "507f1f77bcf86cd799439040",

        ticketId,

        organizationId: mockUser.organizationId,

        actorId: {
          _id: mockUser._id,

          name: "Admin User",

          email: "admin@test.com",

          role: "admin",
        },

        action: "ticket_created",

        oldValue: null,

        newValue: null,

        metadata: {},
      },

      {
        _id: "507f1f77bcf86cd799439041",

        ticketId,

        organizationId: mockUser.organizationId,

        actorId: {
          _id: "507f1f77bcf86cd799439034",

          name: "Agent User",

          email: "agent@test.com",

          role: "agent",
        },

        action: "status_changed",

        oldValue: "pending",

        newValue: "in_progress",

        metadata: {},
      },
    ];

    vi.spyOn(Ticket, "findOne").mockResolvedValue(fakeTicket);

    const mockQuery = {
      populate: vi.fn().mockReturnThis(),

      sort: vi.fn().mockResolvedValue(fakeHistory),
    };

    vi.spyOn(AuditLog, "find").mockReturnValue(mockQuery);

    const response = await request(app).get(`/api/tickets/${ticketId}/history`);

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Ticket history fetched successfully");

    expect(response.body.data).toHaveLength(2);

    expect(response.body.data[0].action).toBe("ticket_created");

    expect(response.body.data[1].action).toBe("status_changed");

    expect(Ticket.findOne).toHaveBeenCalledWith({
      _id: ticketId,

      organizationId: mockUser.organizationId,
    });

    expect(AuditLog.find).toHaveBeenCalledWith({
      ticketId: fakeTicket._id,

      organizationId: mockUser.organizationId,
    });

    expect(mockQuery.populate).toHaveBeenCalledWith(
      "actorId",
      "name email role",
    );

    expect(mockQuery.sort).toHaveBeenCalledWith({
      createdAt: 1,
    });
  });

  // ------------------------------------------------
  // GET TICKET HISTORY — REQUESTER OWN TICKET
  // ------------------------------------------------

  it("should allow requester to view history of their own ticket", async () => {
    mockUser._id = "507f1f77bcf86cd799439011";
    mockUser.organizationId = "507f1f77bcf86cd799439032";
    mockUser.role = "requester";

    const ticketId = "507f1f77bcf86cd799439031";

    const fakeTicket = {
      _id: ticketId,

      organizationId: mockUser.organizationId,

      createdBy: mockUser._id,

      assignedTo: "507f1f77bcf86cd799439034",
    };

    const fakeHistory = [
      {
        _id: "507f1f77bcf86cd799439042",

        ticketId,

        organizationId: mockUser.organizationId,

        actorId: {
          _id: mockUser._id,
          name: "Requester User",
          email: "requester@test.com",
          role: "requester",
        },

        action: "ticket_created",

        oldValue: null,

        newValue: null,

        metadata: {},
      },
    ];

    vi.spyOn(Ticket, "findOne").mockResolvedValue(fakeTicket);

    const mockQuery = {
      populate: vi.fn().mockReturnThis(),

      sort: vi.fn().mockResolvedValue(fakeHistory),
    };

    vi.spyOn(AuditLog, "find").mockReturnValue(mockQuery);

    const response = await request(app).get(`/api/tickets/${ticketId}/history`);

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Ticket history fetched successfully");

    expect(response.body.data).toHaveLength(1);

    expect(response.body.data[0].action).toBe("ticket_created");

    expect(Ticket.findOne).toHaveBeenCalledWith({
      _id: ticketId,
      organizationId: mockUser.organizationId,
    });

    expect(AuditLog.find).toHaveBeenCalledWith({
      ticketId: fakeTicket._id,
      organizationId: mockUser.organizationId,
    });

    expect(mockQuery.populate).toHaveBeenCalledWith(
      "actorId",
      "name email role",
    );

    expect(mockQuery.sort).toHaveBeenCalledWith({
      createdAt: 1,
    });
  });

  // ------------------------------------------------
  // GET TICKET HISTORY — REQUESTER ACCESS DENIED
  // ------------------------------------------------

  it("should reject requester from viewing another requester's ticket history", async () => {
    mockUser._id = "507f1f77bcf86cd799439011";
    mockUser.organizationId = "507f1f77bcf86cd799439032";
    mockUser.role = "requester";

    const ticketId = "507f1f77bcf86cd799439035";

    const fakeTicket = {
      _id: ticketId,

      organizationId: mockUser.organizationId,

      // Different requester
      createdBy: "507f1f77bcf86cd799439099",

      assignedTo: null,
    };

    vi.spyOn(Ticket, "findOne").mockResolvedValue(fakeTicket);

    const auditLogFindSpy = vi.spyOn(AuditLog, "find");

    const response = await request(app).get(`/api/tickets/${ticketId}/history`);

    expect(response.status).toBe(403);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe("Access denied");

    // Audit history must NOT be queried
    expect(auditLogFindSpy).not.toHaveBeenCalled();

    expect(Ticket.findOne).toHaveBeenCalledWith({
      _id: ticketId,

      organizationId: mockUser.organizationId,
    });
  });

  // ------------------------------------------------
  // GET TICKET HISTORY — AGENT ASSIGNED TICKET
  // ------------------------------------------------

  it("should allow agent to view history of an assigned ticket", async () => {
    mockUser._id = "507f1f77bcf86cd799439034";
    mockUser.organizationId = "507f1f77bcf86cd799439032";
    mockUser.role = "agent";

    const ticketId = "507f1f77bcf86cd799439036";

    const fakeTicket = {
      _id: ticketId,

      organizationId: mockUser.organizationId,

      createdBy: "507f1f77bcf86cd799439011",

      // Assigned to current agent
      assignedTo: mockUser._id,
    };

    const fakeHistory = [
      {
        _id: "507f1f77bcf86cd799439043",

        ticketId,

        organizationId: mockUser.organizationId,

        actorId: {
          _id: mockUser._id,
          name: "Agent User",
          email: "agent@test.com",
          role: "agent",
        },

        action: "ticket_assigned",

        oldValue: null,

        newValue: mockUser._id,

        metadata: {},
      },
    ];

    vi.spyOn(Ticket, "findOne").mockResolvedValue(fakeTicket);

    const mockQuery = {
      populate: vi.fn().mockReturnThis(),

      sort: vi.fn().mockResolvedValue(fakeHistory),
    };

    vi.spyOn(AuditLog, "find").mockReturnValue(mockQuery);

    const response = await request(app).get(`/api/tickets/${ticketId}/history`);

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Ticket history fetched successfully");

    expect(response.body.data).toHaveLength(1);

    expect(response.body.data[0].action).toBe("ticket_assigned");

    expect(Ticket.findOne).toHaveBeenCalledWith({
      _id: ticketId,
      organizationId: mockUser.organizationId,
    });

    expect(AuditLog.find).toHaveBeenCalledWith({
      ticketId: fakeTicket._id,
      organizationId: mockUser.organizationId,
    });

    expect(mockQuery.populate).toHaveBeenCalledWith(
      "actorId",
      "name email role",
    );

    expect(mockQuery.sort).toHaveBeenCalledWith({
      createdAt: 1,
    });
  });

  // ------------------------------------------------
  // GET TICKET HISTORY — AGENT ACCESS DENIED
  // ------------------------------------------------

  it("should reject agent from viewing history of a ticket assigned to another agent", async () => {
    mockUser._id = "507f1f77bcf86cd799439034";
    mockUser.organizationId = "507f1f77bcf86cd799439032";
    mockUser.role = "agent";

    const ticketId = "507f1f77bcf86cd799439037";

    const fakeTicket = {
      _id: ticketId,

      organizationId: mockUser.organizationId,

      createdBy: "507f1f77bcf86cd799439011",

      // Assigned to another agent
      assignedTo: "507f1f77bcf86cd799439099",
    };

    vi.spyOn(Ticket, "findOne").mockResolvedValue(fakeTicket);

    const auditLogFindSpy = vi.spyOn(AuditLog, "find");

    const response = await request(app).get(`/api/tickets/${ticketId}/history`);

    expect(response.status).toBe(403);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe("Access denied");

    // Audit history must NOT be queried
    expect(auditLogFindSpy).not.toHaveBeenCalled();

    expect(Ticket.findOne).toHaveBeenCalledWith({
      _id: ticketId,
      organizationId: mockUser.organizationId,
    });
  });

  // ------------------------------------------------
  // GET TICKET HISTORY — AGENT UNASSIGNED TICKET
  // ------------------------------------------------

  it("should reject agent from viewing history of an unassigned ticket", async () => {
    mockUser._id = "507f1f77bcf86cd799439034";
    mockUser.organizationId = "507f1f77bcf86cd799439032";
    mockUser.role = "agent";

    const ticketId = "507f1f77bcf86cd799439038";

    const fakeTicket = {
      _id: ticketId,

      organizationId: mockUser.organizationId,

      createdBy: "507f1f77bcf86cd799439011",

      // Ticket has not been assigned to any agent
      assignedTo: null,
    };

    vi.spyOn(Ticket, "findOne").mockResolvedValue(fakeTicket);

    const auditLogFindSpy = vi.spyOn(AuditLog, "find");

    const response = await request(app).get(`/api/tickets/${ticketId}/history`);

    expect(response.status).toBe(403);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe("Access denied");

    // Audit history must not be queried
    expect(auditLogFindSpy).not.toHaveBeenCalled();

    expect(Ticket.findOne).toHaveBeenCalledWith({
      _id: ticketId,
      organizationId: mockUser.organizationId,
    });
  });

  // ------------------------------------------------
  // GET TICKET HISTORY — TICKET NOT FOUND
  // ------------------------------------------------

  it("should return 404 when ticket does not exist", async () => {
    mockUser._id = "507f1f77bcf86cd799439033";
    mockUser.organizationId = "507f1f77bcf86cd799439032";
    mockUser.role = "admin";

    const ticketId = "507f1f77bcf86cd799439039";

    vi.spyOn(Ticket, "findOne").mockResolvedValue(null);

    const auditLogFindSpy = vi.spyOn(AuditLog, "find");

    const response = await request(app).get(`/api/tickets/${ticketId}/history`);

    expect(response.status).toBe(404);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe("Ticket not found");

    expect(response.body.data).toBeNull();

    // Audit history must not be queried
    expect(auditLogFindSpy).not.toHaveBeenCalled();

    expect(Ticket.findOne).toHaveBeenCalledWith({
      _id: ticketId,
      organizationId: mockUser.organizationId,
    });
  });

  // ------------------------------------------------
  // GET TICKET HISTORY — OTHER ORGANIZATION
  // ------------------------------------------------

  it("should reject access to a ticket from another organization", async () => {
    // Current user belongs to Organization A
    mockUser._id = "507f1f77bcf86cd799439033";
    mockUser.organizationId = "507f1f77bcf86cd799439032";
    mockUser.role = "admin";

    const ticketId = "507f1f77bcf86cd799439040";

    // MongoDB must not find Organization B's ticket
    vi.spyOn(Ticket, "findOne").mockResolvedValue(null);

    const auditLogFindSpy = vi.spyOn(AuditLog, "find");

    const response = await request(app).get(`/api/tickets/${ticketId}/history`);

    expect(response.status).toBe(404);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe("Ticket not found");

    expect(response.body.data).toBeNull();

    // Verify tenant isolation
    expect(Ticket.findOne).toHaveBeenCalledWith({
      _id: ticketId,
      organizationId: mockUser.organizationId,
    });

    // Audit logs must never be queried
    expect(auditLogFindSpy).not.toHaveBeenCalled();
  });
});
