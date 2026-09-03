import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

import app from "../src/app.js";

import Category from "../src/modules/categories/category.model.js";
import Ticket from "../src/modules/tickets/ticket.model.js";
import User from "../src/modules/users/user.model.js";
import Comment from "../src/modules/comments/comment.model.js";
import AuditLog from "../src/modules/auditLogs/auditLog.model.js";

// --------------------------------------------------
// MOCK AUTH MIDDLEWARE
// --------------------------------------------------

const mockUser = {
  _id: "507f1f77bcf86cd799439011",
  organizationId: "507f1f77bcf86cd799439012",
  role: "requester",
};

vi.mock("../src/middleware/auth.middleware.js", () => ({
  authMiddleware: (req, res, next) => {
    req.user = mockUser;
    next();
  },
}));

// --------------------------------------------------
// MOCK AUDIT LOG SERVICE
// --------------------------------------------------

vi.mock("../src/modules/auditLogs/auditLog.service.js", () => ({
  createAuditLog: vi.fn(),
}));

// --------------------------------------------------
// TICKET API TESTS
// --------------------------------------------------

describe("Ticket API", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ------------------------------------------------
  // CREATE TICKET — SUCCESS
  // ------------------------------------------------

  it("should create a ticket successfully", async () => {
    const fakeCategory = {
      _id: "507f1f77bcf86cd799439013",
      name: "Technical Support",
      organizationId: "507f1f77bcf86cd799439012",
      isActive: true,
    };

    const fakeTicket = {
      _id: "507f1f77bcf86cd799439014",
      title: "Unable to login",
      description: "I cannot login to my account",
      priority: "high",
      categoryId: fakeCategory._id,
      organizationId: "507f1f77bcf86cd799439012",
      createdBy: "507f1f77bcf86cd799439011",
      status: "pending",
    };

    vi.spyOn(Category, "findOne").mockResolvedValue(fakeCategory);

    vi.spyOn(Ticket, "create").mockResolvedValue(fakeTicket);

    const response = await request(app).post("/api/tickets").send({
      title: "Unable to login",
      description: "I cannot login to my account",
      categoryId: fakeCategory._id,
      priority: "high",
    });

    expect(response.status).toBe(201);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Ticket created successfully");

    expect(response.body.data).toBeDefined();

    expect(response.body.data.title).toBe("Unable to login");

    expect(response.body.data.priority).toBe("high");

    expect(response.body.data.status).toBe("pending");
  });

  // ------------------------------------------------
  // CREATE TICKET — INVALID CATEGORY
  // ------------------------------------------------

  it("should reject ticket when category does not exist", async () => {
    vi.spyOn(Category, "findOne").mockResolvedValue(null);

    const response = await request(app).post("/api/tickets").send({
      title: "Unable to login",
      description: "I cannot login to my account",
      categoryId: "507f1f77bcf86cd799439013",
      priority: "high",
    });

    expect(response.status).toBe(404);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "Category not found in your organization",
    );
  });

  // ------------------------------------------------
  // CREATE TICKET — VALIDATION ERROR
  // ------------------------------------------------

  it("should reject ticket with invalid data", async () => {
    const response = await request(app).post("/api/tickets").send({
      title: "Bad",
      description: "short",
      categoryId: "",
      priority: "invalid",
    });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
  });

  // GET TICKET — REQUESTER'S OWN TICKET

  it("should allow requester to get their own ticket", async () => {
    const fakeTicket = {
      _id: "507f1f77bcf86cd799439014",
      title: "Unable to login",
      description: "I cannot login to my account",
      priority: "high",
      status: "pending",

      createdBy: {
        _id: "507f1f77bcf86cd799439011",
        name: "Test Requester",
        email: "requester@test.com",
        role: "requester",
      },

      assignedTo: null,

      categoryId: {
        _id: "507f1f77bcf86cd799439013",
        name: "Technical Support",
        description: "Technical issues",
      },

      organizationId: "507f1f77bcf86cd799439012",
    };

    const mockQuery = {
      populate: vi.fn().mockReturnThis(),
    };

    mockQuery.populate
      .mockReturnValueOnce(mockQuery)
      .mockReturnValueOnce(mockQuery)
      .mockReturnValueOnce(mockQuery);

    mockQuery.then = (resolve) => resolve(fakeTicket);

    vi.spyOn(Ticket, "findOne").mockReturnValue(mockQuery);

    const response = await request(app).get(`/api/tickets/${fakeTicket._id}`);

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Ticket fetched successfully");

    expect(response.body.data).toBeDefined();

    expect(response.body.data.title).toBe("Unable to login");
  });

  // --------------------------------------------------
  // GET TICKET — ANOTHER REQUESTER'S TICKET
  // --------------------------------------------------

  it("should reject requester from accessing another requester's ticket", async () => {
    const fakeTicket = {
      _id: "507f1f77bcf86cd799439015",

      title: "Another user's problem",

      description: "This ticket belongs to another requester",

      priority: "high",

      status: "pending",

      // Different requester
      createdBy: {
        _id: "507f1f77bcf86cd799439099",
        name: "Another Requester",
        email: "another@test.com",
        role: "requester",
      },

      assignedTo: null,

      categoryId: {
        _id: "507f1f77bcf86cd799439013",
        name: "Technical Support",
        description: "Technical issues",
      },

      organizationId: "507f1f77bcf86cd799439012",
    };

    // Mock Ticket.findOne()

    const mockQuery = {
      populate: vi.fn().mockReturnThis(),
    };

    // ticket.service.js calls populate() 3 times

    mockQuery.populate
      .mockReturnValueOnce(mockQuery)
      .mockReturnValueOnce(mockQuery)
      .mockReturnValueOnce(mockQuery);

    // Return the other user's ticket

    mockQuery.then = (resolve) => {
      return resolve(fakeTicket);
    };

    vi.spyOn(Ticket, "findOne").mockReturnValue(mockQuery);

    const response = await request(app).get(`/api/tickets/${fakeTicket._id}`);

    expect(response.status).toBe(403);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe("Access denied");
  });

  // --------------------------------------------------
  // MULTI-TENANT — OTHER ORGANIZATION'S TICKET
  // --------------------------------------------------

  it("should reject requester from accessing a ticket from another organization", async () => {
    const ticketId = "507f1f77bcf86cd799439016";

    // Logged-in requester belongs to Organization A
    const organizationA = "507f1f77bcf86cd799439012";

    // Ticket belongs to Organization B
    const organizationB = "507f1f77bcf86cd799439099";

    const mockQuery = {
      populate: vi.fn().mockReturnThis(),
    };

    // Service calls populate() three times
    mockQuery.populate
      .mockReturnValueOnce(mockQuery)
      .mockReturnValueOnce(mockQuery)
      .mockReturnValueOnce(mockQuery);

    // Because this ticket belongs to another organization,
    // MongoDB should return null.
    mockQuery.then = (resolve) => {
      return resolve(null);
    };

    vi.spyOn(Ticket, "findOne").mockReturnValue(mockQuery);

    const response = await request(app).get(`/api/tickets/${ticketId}`);

    expect(response.status).toBe(404);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe("Ticket not found");

    // Verify tenant isolation query
    expect(Ticket.findOne).toHaveBeenCalledWith({
      _id: ticketId,
      organizationId: organizationA,
    });
  });

  // --------------------------------------------------
  // GET ALL TICKETS — ADMIN
  // --------------------------------------------------

  it("should allow admin to get all organization tickets", async () => {
    // Change logged-in user to ADMIN
    mockUser.role = "admin";

    const fakeTickets = [
      {
        _id: "507f1f77bcf86cd799439021",
        title: "Unable to login",
        priority: "high",
        status: "pending",
        organizationId: "507f1f77bcf86cd799439012",
      },
      {
        _id: "507f1f77bcf86cd799439022",
        title: "Server is down",
        priority: "urgent",
        status: "in_progress",
        organizationId: "507f1f77bcf86cd799439012",
      },
    ];

    const mockQuery = {
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    };

    // ticket.service.js uses populate() 3 times
    mockQuery.populate
      .mockReturnValueOnce(mockQuery)
      .mockReturnValueOnce(mockQuery)
      .mockReturnValueOnce(mockQuery);

    // Make query awaitable
    mockQuery.then = (resolve) => resolve(fakeTickets);

    vi.spyOn(Ticket, "find").mockReturnValue(mockQuery);

    vi.spyOn(Ticket, "countDocuments").mockResolvedValue(2);

    const response = await request(app).get("/api/tickets");

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Tickets fetched successfully");

    expect(response.body.data.tickets).toHaveLength(2);

    expect(response.body.data.pagination.total).toBe(2);

    expect(response.body.data.pagination.page).toBe(1);

    expect(response.body.data.pagination.limit).toBe(10);

    // Reset role for next tests
    mockUser.role = "requester";
  });

  // --------------------------------------------------
  // GET ALL TICKETS — REQUESTER
  // --------------------------------------------------

  it("should allow requester to get only their own tickets", async () => {
    mockUser.role = "requester";

    const fakeTickets = [
      {
        _id: "507f1f77bcf86cd799439023",
        title: "My laptop is not working",
        priority: "high",
        status: "pending",
        organizationId: "507f1f77bcf86cd799439012",
        createdBy: mockUser._id,
      },
      {
        _id: "507f1f77bcf86cd799439024",
        title: "My account has an issue",
        priority: "medium",
        status: "pending",
        organizationId: "507f1f77bcf86cd799439012",
        createdBy: mockUser._id,
      },
    ];

    const mockQuery = {
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    };

    mockQuery.populate
      .mockReturnValueOnce(mockQuery)
      .mockReturnValueOnce(mockQuery)
      .mockReturnValueOnce(mockQuery);

    mockQuery.then = (resolve) => resolve(fakeTickets);

    vi.spyOn(Ticket, "find").mockReturnValue(mockQuery);

    vi.spyOn(Ticket, "countDocuments").mockResolvedValue(2);

    const response = await request(app).get("/api/tickets");

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Tickets fetched successfully");

    expect(response.body.data.tickets).toHaveLength(2);

    expect(response.body.data.pagination.total).toBe(2);

    // Verify every returned ticket belongs to logged-in requester
    response.body.data.tickets.forEach((ticket) => {
      expect(ticket.createdBy).toBe(mockUser._id);
    });
  });

  // --------------------------------------------------
  // GET ALL TICKETS — AGENT
  // --------------------------------------------------

  it("should allow agent to get only assigned tickets", async () => {
    // Change logged-in user to AGENT
    mockUser.role = "agent";

    const fakeTickets = [
      {
        _id: "507f1f77bcf86cd799439025",
        title: "Unable to login",
        priority: "high",
        status: "in_progress",
        organizationId: "507f1f77bcf86cd799439012",
        assignedTo: mockUser._id,
      },
      {
        _id: "507f1f77bcf86cd799439026",
        title: "Email is not working",
        priority: "medium",
        status: "in_progress",
        organizationId: "507f1f77bcf86cd799439012",
        assignedTo: mockUser._id,
      },
    ];

    const mockQuery = {
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    };

    mockQuery.populate
      .mockReturnValueOnce(mockQuery)
      .mockReturnValueOnce(mockQuery)
      .mockReturnValueOnce(mockQuery);

    // Make query awaitable
    mockQuery.then = (resolve) => resolve(fakeTickets);

    vi.spyOn(Ticket, "find").mockReturnValue(mockQuery);

    vi.spyOn(Ticket, "countDocuments").mockResolvedValue(2);

    const response = await request(app).get("/api/tickets");

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Tickets fetched successfully");

    expect(response.body.data.tickets).toHaveLength(2);

    expect(response.body.data.pagination.total).toBe(2);

    // Every ticket must be assigned to the logged-in agent
    response.body.data.tickets.forEach((ticket) => {
      expect(ticket.assignedTo).toBe(mockUser._id);
    });

    // Reset role for following tests
    mockUser.role = "requester";
  });

  // --------------------------------------------------
  // GET ALL TICKETS — PAGINATION
  // --------------------------------------------------

  it("should support pagination when fetching tickets", async () => {
    mockUser.role = "admin";

    const fakeTickets = [
      {
        _id: "507f1f77bcf86cd799439027",
        title: "Ticket 3",
        priority: "medium",
        status: "pending",
        organizationId: mockUser.organizationId,
      },
      {
        _id: "507f1f77bcf86cd799439028",
        title: "Ticket 4",
        priority: "low",
        status: "pending",
        organizationId: mockUser.organizationId,
      },
    ];

    const mockQuery = {
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    };

    mockQuery.populate
      .mockReturnValueOnce(mockQuery)
      .mockReturnValueOnce(mockQuery)
      .mockReturnValueOnce(mockQuery);

    mockQuery.then = (resolve) => resolve(fakeTickets);

    vi.spyOn(Ticket, "find").mockReturnValue(mockQuery);

    vi.spyOn(Ticket, "countDocuments").mockResolvedValue(5);

    const response = await request(app).get("/api/tickets").query({
      page: 2,
      limit: 2,
    });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.data.tickets).toHaveLength(2);

    expect(response.body.data.pagination.total).toBe(5);

    expect(response.body.data.pagination.page).toBe(2);

    expect(response.body.data.pagination.limit).toBe(2);

    expect(response.body.data.pagination.totalPages).toBe(3);

    // Verify pagination was actually applied
    expect(mockQuery.skip).toHaveBeenCalledWith(2);

    expect(mockQuery.limit).toHaveBeenCalledWith(2);

    mockUser.role = "requester";
  });

  // --------------------------------------------------
  // GET ALL TICKETS — STATUS FILTER
  // --------------------------------------------------

  it("should filter tickets by status", async () => {
    mockUser.role = "admin";

    const fakeTickets = [
      {
        _id: "507f1f77bcf86cd799439029",
        title: "Pending Ticket 1",
        priority: "high",
        status: "pending",
        organizationId: mockUser.organizationId,
      },
      {
        _id: "507f1f77bcf86cd799439030",
        title: "Pending Ticket 2",
        priority: "medium",
        status: "pending",
        organizationId: mockUser.organizationId,
      },
    ];

    const mockQuery = {
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    };

    mockQuery.populate
      .mockReturnValueOnce(mockQuery)
      .mockReturnValueOnce(mockQuery)
      .mockReturnValueOnce(mockQuery);

    mockQuery.then = (resolve) => resolve(fakeTickets);

    vi.spyOn(Ticket, "find").mockReturnValue(mockQuery);

    vi.spyOn(Ticket, "countDocuments").mockResolvedValue(2);

    const response = await request(app).get("/api/tickets").query({
      status: "pending",
    });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.data.tickets).toHaveLength(2);

    expect(response.body.data.pagination.total).toBe(2);

    // Verify every returned ticket has pending status
    response.body.data.tickets.forEach((ticket) => {
      expect(ticket.status).toBe("pending");
    });

    // Verify MongoDB received status filter
    expect(Ticket.find).toHaveBeenCalledWith({
      organizationId: mockUser.organizationId,
      status: "pending",
    });

    mockUser.role = "requester";
  });

  // --------------------------------------------------
  // GET ALL TICKETS — PRIORITY FILTER
  // --------------------------------------------------

  it("should filter tickets by priority", async () => {
    mockUser.role = "admin";

    const fakeTickets = [
      {
        _id: "507f1f77bcf86cd799439031",
        title: "Server is down",
        priority: "high",
        status: "pending",
        organizationId: mockUser.organizationId,
      },
      {
        _id: "507f1f77bcf86cd799439032",
        title: "Database connection issue",
        priority: "high",
        status: "in_progress",
        organizationId: mockUser.organizationId,
      },
    ];

    const mockQuery = {
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    };

    mockQuery.populate
      .mockReturnValueOnce(mockQuery)
      .mockReturnValueOnce(mockQuery)
      .mockReturnValueOnce(mockQuery);

    mockQuery.then = (resolve) => resolve(fakeTickets);

    vi.spyOn(Ticket, "find").mockReturnValue(mockQuery);

    vi.spyOn(Ticket, "countDocuments").mockResolvedValue(2);

    const response = await request(app).get("/api/tickets").query({
      priority: "high",
    });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.data.tickets).toHaveLength(2);

    expect(response.body.data.pagination.total).toBe(2);

    // Every returned ticket must have high priority
    response.body.data.tickets.forEach((ticket) => {
      expect(ticket.priority).toBe("high");
    });

    // Verify MongoDB received the correct priority filter
    expect(Ticket.find).toHaveBeenCalledWith({
      organizationId: mockUser.organizationId,
      priority: "high",
    });

    mockUser.role = "requester";
  });

  // --------------------------------------------------
  // GET ALL TICKETS — SEARCH
  // --------------------------------------------------

  it("should search tickets by title", async () => {
    mockUser.role = "admin";

    const fakeTickets = [
      {
        _id: "507f1f77bcf86cd799439033",
        title: "Unable to login",
        priority: "high",
        status: "pending",
        organizationId: mockUser.organizationId,
      },
      {
        _id: "507f1f77bcf86cd799439034",
        title: "Login page not working",
        priority: "medium",
        status: "in_progress",
        organizationId: mockUser.organizationId,
      },
    ];

    const mockQuery = {
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    };

    mockQuery.populate
      .mockReturnValueOnce(mockQuery)
      .mockReturnValueOnce(mockQuery)
      .mockReturnValueOnce(mockQuery);

    mockQuery.then = (resolve) => resolve(fakeTickets);

    vi.spyOn(Ticket, "find").mockReturnValue(mockQuery);

    vi.spyOn(Ticket, "countDocuments").mockResolvedValue(2);

    const response = await request(app).get("/api/tickets").query({
      search: "login",
    });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.data.tickets).toHaveLength(2);

    expect(response.body.data.pagination.total).toBe(2);

    // Verify search results
    response.body.data.tickets.forEach((ticket) => {
      expect(ticket.title.toLowerCase()).toContain("login");
    });

    // Verify MongoDB received regex search filter
    expect(Ticket.find).toHaveBeenCalledWith({
      organizationId: mockUser.organizationId,
      title: {
        $regex: "login",
        $options: "i",
      },
    });

    mockUser.role = "requester";
  });

  // --------------------------------------------------
  // ASSIGN TICKET — SUCCESS
  // --------------------------------------------------

  it("should allow admin to assign a ticket to an agent", async () => {
    // Change logged-in user to admin
    mockUser.role = "admin";

    const fakeAgent = {
      _id: "507f1f77bcf86cd799439020",
      name: "Test Agent",
      email: "agent@test.com",
      role: "agent",
      organizationId: mockUser.organizationId,
      isActive: true,
    };

    const fakeTicket = {
      _id: "507f1f77bcf86cd799439021",
      title: "Unable to login",
      description: "User cannot login",
      priority: "high",
      status: "pending",
      organizationId: mockUser.organizationId,
      createdBy: "507f1f77bcf86cd799439011",
      assignedTo: null,

      save: vi.fn().mockResolvedValue(true),
    };

    // Mock Ticket.findOne()
    vi.spyOn(Ticket, "findOne").mockResolvedValue(fakeTicket);

    // Mock User.findOne()
    vi.spyOn(User, "findOne").mockResolvedValue(fakeAgent);

    // Mock audit log
    const auditLogService =
      await import("../src/modules/auditLogs/auditLog.service.js");

    vi.spyOn(auditLogService, "createAuditLog").mockResolvedValue();

    const response = await request(app)
      .patch(`/api/tickets/${fakeTicket._id}/assign`)
      .send({
        agentId: fakeAgent._id,
      });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Ticket assigned successfully");

    expect(response.body.data).toBeDefined();

    // Ticket should now be assigned
    expect(fakeTicket.assignedTo).toBe(fakeAgent._id);

    // Assignment automatically moves ticket to in_progress
    expect(fakeTicket.status).toBe("in_progress");

    // Restore requester for following tests
    mockUser.role = "requester";
  });

  // --------------------------------------------------
  // ASSIGN TICKET — INVALID AGENT
  // --------------------------------------------------

  it("should reject assignment when selected user is not an agent", async () => {
    mockUser.role = "admin";

    const fakeTicket = {
      _id: "507f1f77bcf86cd799439021",
      title: "Unable to login",
      description: "User cannot login",
      priority: "high",
      status: "pending",
      organizationId: mockUser.organizationId,
      createdBy: "507f1f77bcf86cd799439011",
      assignedTo: null,

      save: vi.fn(),
    };

    // Ticket exists
    vi.spyOn(Ticket, "findOne").mockResolvedValue(fakeTicket);

    // Selected user is NOT an agent
    vi.spyOn(User, "findOne").mockResolvedValue(null);

    const response = await request(app)
      .patch(`/api/tickets/${fakeTicket._id}/assign`)
      .send({
        agentId: "507f1f77bcf86cd799439022",
      });

    expect(response.status).toBe(404);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe("Agent not found in your organization");

    // Ticket must not be modified
    expect(fakeTicket.assignedTo).toBeNull();

    expect(fakeTicket.save).not.toHaveBeenCalled();

    mockUser.role = "requester";
  });

  // --------------------------------------------------
  // ASSIGN TICKET — DUPLICATE ASSIGNMENT
  // --------------------------------------------------

  it("should reject assigning a ticket to the same agent again", async () => {
    mockUser.role = "admin";

    const agentId = "507f1f77bcf86cd799439020";

    const fakeTicket = {
      _id: "507f1f77bcf86cd799439021",
      title: "Unable to login",
      description: "User cannot login",
      priority: "high",
      status: "in_progress",

      organizationId: mockUser.organizationId,

      createdBy: "507f1f77bcf86cd799439011",

      // Already assigned to this agent
      assignedTo: agentId,

      save: vi.fn(),
    };

    const fakeAgent = {
      _id: agentId,
      name: "Test Agent",
      email: "agent@test.com",
      role: "agent",
      organizationId: mockUser.organizationId,
      isActive: true,
    };

    // Ticket exists
    vi.spyOn(Ticket, "findOne").mockResolvedValue(fakeTicket);

    // Agent exists and is valid
    vi.spyOn(User, "findOne").mockResolvedValue(fakeAgent);

    const response = await request(app)
      .patch(`/api/tickets/${fakeTicket._id}/assign`)
      .send({
        agentId,
      });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "Ticket is already assigned to this agent",
    );

    // Ticket should not be saved again
    expect(fakeTicket.save).not.toHaveBeenCalled();

    mockUser.role = "requester";
  });

  // --------------------------------------------------
  // UPDATE TICKET STATUS — RESOLVED
  // --------------------------------------------------

  it("should allow assigned agent to resolve a ticket", async () => {
    mockUser.role = "agent";

    const fakeTicket = {
      _id: "507f1f77bcf86cd799439040",

      title: "Unable to login",

      description: "User cannot login",

      priority: "high",

      // Current status
      status: "in_progress",

      organizationId: mockUser.organizationId,

      createdBy: "507f1f77bcf86cd799439011",

      // Assigned to logged-in agent
      assignedTo: mockUser._id,

      save: vi.fn().mockResolvedValue(true),
    };

    // Ticket exists
    vi.spyOn(Ticket, "findOne").mockResolvedValue(fakeTicket);

    // Audit log is already mocked at the top of the file
    const response = await request(app)
      .patch(`/api/tickets/${fakeTicket._id}/status`)
      .send({
        status: "resolved",
      });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Ticket status updated successfully");

    expect(response.body.data).toBeDefined();

    expect(response.body.data.status).toBe("resolved");

    // Verify ticket was saved
    expect(fakeTicket.save).toHaveBeenCalled();

    mockUser.role = "requester";
  });

  // --------------------------------------------------
  // UPDATE TICKET STATUS — AGENT ACCESS DENIED
  // --------------------------------------------------

  it("should reject agent from updating another agent's ticket", async () => {
    mockUser.role = "agent";

    const fakeTicket = {
      _id: "507f1f77bcf86cd799439041",

      title: "Another agent ticket",

      description: "This ticket belongs to another agent",

      priority: "high",

      status: "in_progress",

      organizationId: mockUser.organizationId,

      createdBy: "507f1f77bcf86cd799439011",

      // Different agent
      assignedTo: "507f1f77bcf86cd799439099",

      save: vi.fn().mockResolvedValue(true),
    };

    vi.spyOn(Ticket, "findOne").mockResolvedValue(fakeTicket);

    const response = await request(app)
      .patch(`/api/tickets/${fakeTicket._id}/status`)
      .send({
        status: "resolved",
      });

    expect(response.status).toBe(403);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "You can only update tickets assigned to you",
    );

    // Ticket must not be modified
    expect(fakeTicket.status).toBe("in_progress");

    expect(fakeTicket.save).not.toHaveBeenCalled();

    mockUser.role = "requester";
  });

  // --------------------------------------------------
  // UPDATE TICKET STATUS — ONLY ADMIN CAN CLOSE
  // --------------------------------------------------

  it("should reject agent from closing a ticket", async () => {
    mockUser.role = "agent";

    const fakeTicket = {
      _id: "507f1f77bcf86cd799439042",

      title: "Login issue",

      description: "User is unable to login",

      priority: "high",

      status: "resolved",

      organizationId: mockUser.organizationId,

      createdBy: "507f1f77bcf86cd799439011",

      // Assigned to logged-in agent
      assignedTo: mockUser._id,

      save: vi.fn().mockResolvedValue(true),
    };

    vi.spyOn(Ticket, "findOne").mockResolvedValue(fakeTicket);

    const response = await request(app)
      .patch(`/api/tickets/${fakeTicket._id}/status`)
      .send({
        status: "closed",
      });

    expect(response.status).toBe(403);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe("Only admin can close a ticket");

    // Ticket must remain unchanged
    expect(fakeTicket.status).toBe("resolved");

    expect(fakeTicket.save).not.toHaveBeenCalled();

    mockUser.role = "requester";
  });

  // --------------------------------------------------
  // UPDATE TICKET STATUS — ADMIN CLOSE SUCCESS
  // --------------------------------------------------

  it("should allow admin to close a resolved ticket", async () => {
    mockUser.role = "admin";

    const fakeTicket = {
      _id: "507f1f77bcf86cd799439043",

      title: "Login issue",

      description: "User was unable to login",

      priority: "high",

      status: "resolved",

      organizationId: mockUser.organizationId,

      createdBy: "507f1f77bcf86cd799439011",

      assignedTo: "507f1f77bcf86cd799439099",

      save: vi.fn().mockResolvedValue(true),
    };

    vi.spyOn(Ticket, "findOne").mockResolvedValue(fakeTicket);

    const response = await request(app)
      .patch(`/api/tickets/${fakeTicket._id}/status`)
      .send({
        status: "closed",
      });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Ticket status updated successfully");

    expect(fakeTicket.status).toBe("closed");

    expect(fakeTicket.save).toHaveBeenCalled();

    mockUser.role = "requester";
  });

  // --------------------------------------------------
  // UPDATE TICKET STATUS — REQUESTER ACCESS DENIED
  // --------------------------------------------------

  it("should reject requester from changing ticket status", async () => {
    mockUser.role = "requester";

    const response = await request(app)
      .patch("/api/tickets/507f1f77bcf86cd799439044/status")
      .send({
        status: "in_progress",
      });

    expect(response.status).toBe(403);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "Role 'requester' is not allowed to access this resource",
    );
  });

  // --------------------------------------------------
  // UPDATE TICKET STATUS — INVALID TRANSITION
  // --------------------------------------------------

  it("should reject invalid ticket status transition", async () => {
    mockUser.role = "agent";

    const fakeTicket = {
      _id: "507f1f77bcf86cd799439045",

      title: "Internet issue",

      description: "Internet is not working properly",

      priority: "medium",

      // Current status
      status: "pending",

      organizationId: mockUser.organizationId,

      createdBy: "507f1f77bcf86cd799439011",

      // Assigned to logged-in agent
      assignedTo: mockUser._id,

      save: vi.fn().mockResolvedValue(true),
    };

    vi.spyOn(Ticket, "findOne").mockResolvedValue(fakeTicket);

    const response = await request(app)
      .patch(`/api/tickets/${fakeTicket._id}/status`)
      .send({
        // Invalid:
        // pending → resolved
        status: "resolved",
      });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "Cannot change status from pending to resolved",
    );

    // Ticket must remain unchanged
    expect(fakeTicket.status).toBe("pending");

    expect(fakeTicket.save).not.toHaveBeenCalled();
  });

  // --------------------------------------------------
  // UPDATE TICKET STATUS — UNASSIGNED TICKET
  // --------------------------------------------------

  it("should reject agent from updating an unassigned ticket", async () => {
    mockUser.role = "agent";

    const fakeTicket = {
      _id: "507f1f77bcf86cd799439046",

      title: "Internet issue",

      description: "Internet is not working properly",

      priority: "medium",

      status: "pending",

      organizationId: mockUser.organizationId,

      createdBy: "507f1f77bcf86cd799439011",

      // Ticket is not assigned to any agent
      assignedTo: null,

      save: vi.fn().mockResolvedValue(true),
    };

    vi.spyOn(Ticket, "findOne").mockResolvedValue(fakeTicket);

    const response = await request(app)
      .patch(`/api/tickets/${fakeTicket._id}/status`)
      .send({
        status: "in_progress",
      });

    expect(response.status).toBe(403);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "You can only update tickets assigned to you",
    );

    expect(fakeTicket.status).toBe("pending");

    expect(fakeTicket.save).not.toHaveBeenCalled();
  });

  // --------------------------------------------------
  // UPDATE TICKET STATUS — PENDING → IN_PROGRESS
  // --------------------------------------------------

  it("should allow assigned agent to move a ticket to in_progress", async () => {
    mockUser.role = "agent";

    const fakeTicket = {
      _id: "507f1f77bcf86cd799439047",

      title: "Internet issue",

      description: "Internet is not working properly",

      priority: "medium",

      status: "pending",

      organizationId: mockUser.organizationId,

      createdBy: "507f1f77bcf86cd799439011",

      // Assigned to the logged-in agent
      assignedTo: mockUser._id,

      save: vi.fn().mockResolvedValue(true),
    };

    vi.spyOn(Ticket, "findOne").mockResolvedValue(fakeTicket);

    const response = await request(app)
      .patch(`/api/tickets/${fakeTicket._id}/status`)
      .send({
        status: "in_progress",
      });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Ticket status updated successfully");

    expect(fakeTicket.status).toBe("in_progress");

    expect(fakeTicket.save).toHaveBeenCalledTimes(1);
  });

  // --------------------------------------------------
  // UPDATE TICKET STATUS — IN_PROGRESS → RESOLVED
  // --------------------------------------------------

  it("should allow assigned agent to resolve an in_progress ticket", async () => {
    mockUser.role = "agent";

    const fakeTicket = {
      _id: "507f1f77bcf86cd799439048",

      title: "Internet issue",

      description: "Internet is not working properly",

      priority: "medium",

      status: "in_progress",

      organizationId: mockUser.organizationId,

      createdBy: "507f1f77bcf86cd799439011",

      // Assigned to the logged-in agent
      assignedTo: mockUser._id,

      save: vi.fn().mockResolvedValue(true),
    };

    vi.spyOn(Ticket, "findOne").mockResolvedValue(fakeTicket);

    const response = await request(app)
      .patch(`/api/tickets/${fakeTicket._id}/status`)
      .send({
        status: "resolved",
      });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Ticket status updated successfully");

    expect(fakeTicket.status).toBe("resolved");

    expect(fakeTicket.save).toHaveBeenCalledTimes(1);
  });

  // --------------------------------------------------
  // UPDATE TICKET STATUS — INVALID TRANSITION
  // --------------------------------------------------

  it("should reject invalid status transition from pending to resolved", async () => {
    mockUser.role = "agent";

    const fakeTicket = {
      _id: "507f1f77bcf86cd799439049",

      title: "Internet issue",

      description: "Internet is not working properly",

      priority: "medium",

      status: "pending",

      organizationId: mockUser.organizationId,

      createdBy: "507f1f77bcf86cd799439011",

      // Assigned to the logged-in agent
      assignedTo: mockUser._id,

      save: vi.fn().mockResolvedValue(true),
    };

    vi.spyOn(Ticket, "findOne").mockResolvedValue(fakeTicket);

    const response = await request(app)
      .patch(`/api/tickets/${fakeTicket._id}/status`)
      .send({
        status: "resolved",
      });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "Cannot change status from pending to resolved",
    );

    // Ticket must remain unchanged
    expect(fakeTicket.status).toBe("pending");

    expect(fakeTicket.save).not.toHaveBeenCalled();
  });

  // --------------------------------------------------
  // UPDATE TICKET STATUS — RESOLVED → CLOSED BY ADMIN
  // --------------------------------------------------

  it("should allow admin to close a resolved ticket", async () => {
    mockUser.role = "admin";

    const fakeTicket = {
      _id: "507f1f77bcf86cd799439050",

      title: "Internet issue",

      description: "Internet issue has been resolved",

      priority: "medium",

      status: "resolved",

      organizationId: mockUser.organizationId,

      createdBy: "507f1f77bcf86cd799439011",

      assignedTo: "507f1f77bcf86cd799439099",

      save: vi.fn().mockResolvedValue(true),
    };

    vi.spyOn(Ticket, "findOne").mockResolvedValue(fakeTicket);

    const response = await request(app)
      .patch(`/api/tickets/${fakeTicket._id}/status`)
      .send({
        status: "closed",
      });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Ticket status updated successfully");

    expect(fakeTicket.status).toBe("closed");

    expect(fakeTicket.save).toHaveBeenCalledTimes(1);
  });

  // --------------------------------------------------
  // UPDATE TICKET STATUS — AGENT CANNOT CLOSE
  // --------------------------------------------------

  it("should reject agent from closing a resolved ticket", async () => {
    mockUser.role = "agent";

    const fakeTicket = {
      _id: "507f1f77bcf86cd799439051",

      title: "Internet issue",

      description: "Internet issue has been resolved",

      priority: "medium",

      status: "resolved",

      organizationId: mockUser.organizationId,

      createdBy: "507f1f77bcf86cd799439011",

      // Assigned to the logged-in agent
      assignedTo: mockUser._id,

      save: vi.fn().mockResolvedValue(true),
    };

    vi.spyOn(Ticket, "findOne").mockResolvedValue(fakeTicket);

    const response = await request(app)
      .patch(`/api/tickets/${fakeTicket._id}/status`)
      .send({
        status: "closed",
      });

    expect(response.status).toBe(403);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe("Only admin can close a ticket");

    // Ticket must remain unchanged
    expect(fakeTicket.status).toBe("resolved");

    expect(fakeTicket.save).not.toHaveBeenCalled();
  });

  // --------------------------------------------------
  // UPDATE TICKET STATUS — CLOSED TICKET CANNOT CHANGE
  // --------------------------------------------------

  it("should reject status change for a closed ticket", async () => {
    mockUser.role = "agent";

    const fakeTicket = {
      _id: "507f1f77bcf86cd799439052",

      title: "Internet issue",

      description: "This ticket has already been closed",

      priority: "medium",

      status: "closed",

      organizationId: mockUser.organizationId,

      createdBy: "507f1f77bcf86cd799439011",

      // Assigned to the logged-in agent
      assignedTo: mockUser._id,

      save: vi.fn().mockResolvedValue(true),
    };

    vi.spyOn(Ticket, "findOne").mockResolvedValue(fakeTicket);

    const response = await request(app)
      .patch(`/api/tickets/${fakeTicket._id}/status`)
      .send({
        status: "in_progress",
      });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "Cannot change status from closed to in_progress",
    );

    // Ticket must remain closed
    expect(fakeTicket.status).toBe("closed");

    expect(fakeTicket.save).not.toHaveBeenCalled();
  });

  // --------------------------------------------------
  // GET TICKET DETAILS — TICKET + COMMENTS + HISTORY
  // --------------------------------------------------

  it("should return ticket details with comments and audit history", async () => {
    mockUser.role = "requester";

    const fakeTicket = {
      _id: "507f1f77bcf86cd799439053",

      title: "Internet issue",

      description: "Internet is not working properly",

      priority: "medium",

      status: "pending",

      organizationId: mockUser.organizationId,

      createdBy: {
        _id: mockUser._id,
        name: "Test Requester",
        email: "requester@test.com",
        role: "requester",
      },

      assignedTo: null,

      categoryId: {
        _id: "507f1f77bcf86cd799439013",
        name: "Technical Support",
        description: "Technical issues",
      },
    };

    const fakeComments = [
      {
        _id: "507f1f77bcf86cd799439054",
        ticketId: fakeTicket._id,
        organizationId: mockUser.organizationId,
        message: "We are checking your issue.",
        authorId: {
          _id: "507f1f77bcf86cd799439055",
          name: "Support Agent",
          email: "agent@test.com",
          role: "agent",
        },
      },
    ];

    const fakeHistory = [
      {
        _id: "507f1f77bcf86cd799439056",
        ticketId: fakeTicket._id,
        organizationId: mockUser.organizationId,
        action: "ticket_created",
        actorId: {
          _id: mockUser._id,
          name: "Test Requester",
          email: "requester@test.com",
          role: "requester",
        },
      },
    ];

    // --------------------------------------------------
    // MOCK TICKET QUERY
    // --------------------------------------------------

    const ticketQuery = {
      populate: vi.fn().mockReturnThis(),
    };

    ticketQuery.populate
      .mockReturnValueOnce(ticketQuery)
      .mockReturnValueOnce(ticketQuery)
      .mockReturnValueOnce(ticketQuery);

    ticketQuery.then = (resolve) => resolve(fakeTicket);

    vi.spyOn(Ticket, "findOne").mockReturnValue(ticketQuery);

    // --------------------------------------------------
    // MOCK COMMENT QUERY
    // --------------------------------------------------

    const commentQuery = {
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
    };

    commentQuery.then = (resolve) => resolve(fakeComments);

    vi.spyOn(Comment, "find").mockReturnValue(commentQuery);

    // --------------------------------------------------
    // MOCK AUDIT HISTORY QUERY
    // --------------------------------------------------

    const historyQuery = {
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
    };

    historyQuery.then = (resolve) => resolve(fakeHistory);

    vi.spyOn(AuditLog, "find").mockReturnValue(historyQuery);

    // --------------------------------------------------
    // REQUEST
    // --------------------------------------------------

    const response = await request(app).get(
      `/api/tickets/${fakeTicket._id}/details`,
    );

    // --------------------------------------------------
    // ASSERT RESPONSE
    // --------------------------------------------------

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Ticket details fetched successfully");

    expect(response.body.data).toBeDefined();

    // Ticket
    expect(response.body.data.ticket).toBeDefined();

    expect(response.body.data.ticket.title).toBe("Internet issue");

    // Comments
    expect(response.body.data.comments).toBeDefined();

    expect(response.body.data.comments).toHaveLength(1);

    expect(response.body.data.comments[0].message).toBe(
      "We are checking your issue.",
    );

    // Audit history
    expect(response.body.data.history).toBeDefined();

    expect(response.body.data.history).toHaveLength(1);

    expect(response.body.data.history[0].action).toBe("ticket_created");
  });
});
