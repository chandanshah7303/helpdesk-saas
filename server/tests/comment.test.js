import { describe, it, expect, vi, beforeEach } from "vitest";

import request from "supertest";

import app from "../src/app.js";

import Ticket from "../src/modules/tickets/ticket.model.js";

import Comment from "../src/modules/comments/comment.model.js";

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
// COMMENT API TESTS
// --------------------------------------------------

describe("Comment API", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // --------------------------------------------------
  // CREATE COMMENT — SUCCESS
  // --------------------------------------------------

  it("should create a comment successfully", async () => {
    const fakeTicket = {
      _id: "507f1f77bcf86cd799439014",

      title: "Unable to login",

      status: "pending",

      organizationId: mockUser.organizationId,

      createdBy: mockUser._id,

      assignedTo: null,
    };

    const fakeComment = {
      _id: "507f1f77bcf86cd799439060",

      ticketId: fakeTicket._id,

      organizationId: mockUser.organizationId,

      authorId: mockUser._id,

      message: "I am still unable to login.",
    };

    // Ticket exists in user's organization
    vi.spyOn(Ticket, "findOne").mockResolvedValue(fakeTicket);

    // Create comment
    vi.spyOn(Comment, "create").mockResolvedValue(fakeComment);

    const response = await request(app)
      .post(`/api/tickets/${fakeTicket._id}/comments`)
      .send({
        message: "I am still unable to login.",
      });

    expect(response.status).toBe(201);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Comment added successfully");

    expect(response.body.data).toBeDefined();

    expect(response.body.data.message).toBe("I am still unable to login.");

    expect(response.body.data.ticketId).toBe(fakeTicket._id);

    expect(response.body.data.authorId).toBe(mockUser._id);

    expect(response.body.data.organizationId).toBe(mockUser.organizationId);
  });

  // --------------------------------------------------
  // CREATE COMMENT — EMPTY MESSAGE VALIDATION
  // --------------------------------------------------

  it("should reject an empty comment", async () => {
    const ticketId = "507f1f77bcf86cd799439014";

    // Empty string
    const emptyResponse = await request(app)
      .post(`/api/tickets/${ticketId}/comments`)
      .send({
        message: "",
      });

    expect(emptyResponse.status).toBe(400);

    expect(emptyResponse.body.success).toBe(false);

    // Whitespace only
    const whitespaceResponse = await request(app)
      .post(`/api/tickets/${ticketId}/comments`)
      .send({
        message: "   ",
      });

    expect(whitespaceResponse.status).toBe(400);

    expect(whitespaceResponse.body.success).toBe(false);
  });

  // --------------------------------------------------
  // CREATE COMMENT — TICKET NOT FOUND
  // --------------------------------------------------

  it("should reject comment when ticket does not exist", async () => {
    const ticketId = "507f1f77bcf86cd799439099";

    // Ticket does not exist
    vi.spyOn(Ticket, "findOne").mockResolvedValue(null);

    // Spy on Comment.create so we can verify
    // that comment creation never happens.
    const createCommentSpy = vi.spyOn(Comment, "create").mockResolvedValue();

    const response = await request(app)
      .post(`/api/tickets/${ticketId}/comments`)
      .send({
        message: "I am facing an issue with this ticket.",
      });

    expect(response.status).toBe(404);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe("Ticket not found");

    // Comment must NOT be created
    expect(createCommentSpy).not.toHaveBeenCalled();
  });

  // --------------------------------------------------
  // CREATE COMMENT — CLOSED TICKET
  // --------------------------------------------------

  it("should reject comment when ticket is closed", async () => {
    const fakeTicket = {
      _id: "507f1f77bcf86cd799439050",

      title: "Internet issue",

      description: "Internet is not working",

      status: "closed",

      organizationId: mockUser.organizationId,

      createdBy: mockUser._id,

      assignedTo: null,
    };

    // Ticket exists but is already closed
    vi.spyOn(Ticket, "findOne").mockResolvedValue(fakeTicket);

    // Spy on Comment.create
    const createCommentSpy = vi.spyOn(Comment, "create").mockResolvedValue();

    const response = await request(app)
      .post(`/api/tickets/${fakeTicket._id}/comments`)
      .send({
        message: "I want to add another comment.",
      });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe("Cannot add comment to a closed ticket");

    // Comment must NOT be created
    expect(createCommentSpy).not.toHaveBeenCalled();
  });

  // --------------------------------------------------
  // CREATE COMMENT — REQUESTER ACCESS DENIED
  // --------------------------------------------------

  it("should reject requester from commenting on another user's ticket", async () => {
    const fakeTicket = {
      _id: "507f1f77bcf86cd799439051",

      title: "Another user's issue",

      description: "This ticket belongs to another requester",

      status: "pending",

      organizationId: mockUser.organizationId,

      // Different requester
      createdBy: "507f1f77bcf86cd799439099",

      assignedTo: null,
    };

    // Ticket exists
    vi.spyOn(Ticket, "findOne").mockResolvedValue(fakeTicket);

    // Spy on Comment.create
    const createCommentSpy = vi.spyOn(Comment, "create").mockResolvedValue();

    const response = await request(app)
      .post(`/api/tickets/${fakeTicket._id}/comments`)
      .send({
        message: "I should not be able to add this comment.",
      });

    expect(response.status).toBe(403);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "You can only comment on your own tickets",
    );

    // Comment must NOT be created
    expect(createCommentSpy).not.toHaveBeenCalled();
  });

  // --------------------------------------------------
  // CREATE COMMENT — AGENT ACCESS DENIED
  // --------------------------------------------------

  it("should reject agent from commenting on a ticket not assigned to them", async () => {
    // Change logged-in user to agent
    mockUser.role = "agent";

    const fakeTicket = {
      _id: "507f1f77bcf86cd799439052",

      title: "Server issue",

      description: "Server is not responding",

      status: "in_progress",

      organizationId: mockUser.organizationId,

      createdBy: "507f1f77bcf86cd799439099",

      // Ticket is assigned to ANOTHER agent
      assignedTo: "507f1f77bcf86cd799439098",
    };

    // Ticket exists
    vi.spyOn(Ticket, "findOne").mockResolvedValue(fakeTicket);

    // Spy on Comment.create
    const createCommentSpy = vi.spyOn(Comment, "create").mockResolvedValue();

    const response = await request(app)
      .post(`/api/tickets/${fakeTicket._id}/comments`)
      .send({
        message: "I should not be able to comment here.",
      });

    expect(response.status).toBe(403);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "You can only comment on tickets assigned to you",
    );

    // Comment must NOT be created
    expect(createCommentSpy).not.toHaveBeenCalled();
  });

  // --------------------------------------------------
  // CREATE COMMENT — AGENT SUCCESS
  // --------------------------------------------------

  it("should allow agent to comment on their assigned ticket", async () => {
    // Logged-in user is an agent
    mockUser.role = "agent";

    const fakeTicket = {
      _id: "507f1f77bcf86cd799439053",

      title: "Server issue",

      description: "Server is not responding",

      status: "in_progress",

      organizationId: mockUser.organizationId,

      createdBy: "507f1f77bcf86cd799439099",

      // Assigned to the logged-in agent
      assignedTo: mockUser._id,
    };

    const fakeComment = {
      _id: "507f1f77bcf86cd799439054",

      ticketId: fakeTicket._id,

      organizationId: mockUser.organizationId,

      authorId: mockUser._id,

      message: "I have started working on this issue.",
    };

    // Ticket exists and is assigned to current agent
    vi.spyOn(Ticket, "findOne").mockResolvedValue(fakeTicket);

    // Comment creation succeeds
    const createCommentSpy = vi
      .spyOn(Comment, "create")
      .mockResolvedValue(fakeComment);

    const response = await request(app)
      .post(`/api/tickets/${fakeTicket._id}/comments`)
      .send({
        message: "I have started working on this issue.",
      });

    expect(response.status).toBe(201);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Comment added successfully");

    expect(response.body.data).toBeDefined();

    expect(response.body.data.message).toBe(
      "I have started working on this issue.",
    );

    // Verify Comment.create() was called
    expect(createCommentSpy).toHaveBeenCalledTimes(1);

    expect(createCommentSpy).toHaveBeenCalledWith({
      ticketId: fakeTicket._id,
      organizationId: mockUser.organizationId,
      authorId: mockUser._id,
      message: "I have started working on this issue.",
    });
  });

  // --------------------------------------------------
  // CREATE COMMENT — ADMIN SUCCESS
  // --------------------------------------------------

  it("should allow admin to comment on any ticket in their organization", async () => {
    // Logged-in user is admin
    mockUser.role = "admin";

    const fakeTicket = {
      _id: "507f1f77bcf86cd799439055",

      title: "Database issue",

      description: "Database connection is failing",

      status: "in_progress",

      organizationId: mockUser.organizationId,

      // Ticket belongs to another user
      createdBy: "507f1f77bcf86cd799439099",

      // Assigned to another agent
      assignedTo: "507f1f77bcf86cd799439098",
    };

    const fakeComment = {
      _id: "507f1f77bcf86cd799439056",

      ticketId: fakeTicket._id,

      organizationId: mockUser.organizationId,

      authorId: mockUser._id,

      message: "Admin is reviewing this issue.",
    };

    // Ticket exists in admin's organization
    vi.spyOn(Ticket, "findOne").mockResolvedValue(fakeTicket);

    // Comment creation succeeds
    const createCommentSpy = vi
      .spyOn(Comment, "create")
      .mockResolvedValue(fakeComment);

    const response = await request(app)
      .post(`/api/tickets/${fakeTicket._id}/comments`)
      .send({
        message: "Admin is reviewing this issue.",
      });

    expect(response.status).toBe(201);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Comment added successfully");

    expect(response.body.data).toBeDefined();

    expect(response.body.data.message).toBe("Admin is reviewing this issue.");

    // Verify Comment.create() was called exactly once
    expect(createCommentSpy).toHaveBeenCalledTimes(1);

    expect(createCommentSpy).toHaveBeenCalledWith({
      ticketId: fakeTicket._id,
      organizationId: mockUser.organizationId,
      authorId: mockUser._id,
      message: "Admin is reviewing this issue.",
    });
  });

  // --------------------------------------------------
  // GET COMMENTS — REQUESTER'S OWN TICKET
  // --------------------------------------------------

  it("should allow requester to get comments of their own ticket", async () => {
    mockUser.role = "requester";

    const fakeTicket = {
      _id: "507f1f77bcf86cd799439057",

      title: "Internet issue",

      description: "Internet is not working",

      status: "pending",

      organizationId: mockUser.organizationId,

      // Ticket belongs to logged-in requester
      createdBy: mockUser._id,

      assignedTo: null,
    };

    const fakeComments = [
      {
        _id: "507f1f77bcf86cd799439058",

        ticketId: fakeTicket._id,

        organizationId: mockUser.organizationId,

        authorId: {
          _id: mockUser._id,
          name: "Test Requester",
          email: "requester@test.com",
          role: "requester",
        },

        message: "I am facing an internet issue.",

        createdAt: new Date(),
      },

      {
        _id: "507f1f77bcf86cd799439059",

        ticketId: fakeTicket._id,

        organizationId: mockUser.organizationId,

        authorId: {
          _id: mockUser._id,
          name: "Test Requester",
          email: "requester@test.com",
          role: "requester",
        },

        message: "The issue is still happening.",

        createdAt: new Date(),
      },
    ];

    // Ticket exists and belongs to requester
    vi.spyOn(Ticket, "findOne").mockResolvedValue(fakeTicket);

    // Mock Comment.find() chain
    const mockQuery = {
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
    };

    mockQuery.then = (resolve) => {
      return resolve(fakeComments);
    };

    vi.spyOn(Comment, "find").mockReturnValue(mockQuery);

    const response = await request(app).get(
      `/api/tickets/${fakeTicket._id}/comments`,
    );

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Comments fetched successfully");

    expect(response.body.data).toBeDefined();

    expect(response.body.data).toHaveLength(2);

    expect(response.body.data[0].message).toBe(
      "I am facing an internet issue.",
    );

    expect(response.body.data[1].message).toBe("The issue is still happening.");
  });

  // --------------------------------------------------
  // GET COMMENTS — ANOTHER REQUESTER'S TICKET
  // --------------------------------------------------

  it("should reject requester from viewing comments of another user's ticket", async () => {
    mockUser.role = "requester";

    const fakeTicket = {
      _id: "507f1f77bcf86cd799439060",

      title: "Another user's issue",

      description: "This ticket belongs to another requester",

      status: "pending",

      organizationId: mockUser.organizationId,

      // Different requester
      createdBy: "507f1f77bcf86cd799439099",

      assignedTo: null,
    };

    // Ticket exists but belongs to another requester
    vi.spyOn(Ticket, "findOne").mockResolvedValue(fakeTicket);

    // Comment.find() should never be reached
    const findCommentsSpy = vi.spyOn(Comment, "find").mockReturnValue();

    const response = await request(app).get(
      `/api/tickets/${fakeTicket._id}/comments`,
    );

    expect(response.status).toBe(403);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "You can only view comments of your own tickets",
    );

    // Comments must NOT be fetched
    expect(findCommentsSpy).not.toHaveBeenCalled();
  });

  // --------------------------------------------------
  // GET COMMENTS — AGENT'S ASSIGNED TICKET
  // --------------------------------------------------

  it("should allow agent to get comments of their assigned ticket", async () => {
    mockUser.role = "agent";

    const fakeTicket = {
      _id: "507f1f77bcf86cd799439061",

      title: "Server issue",

      description: "Server is not responding",

      status: "in_progress",

      organizationId: mockUser.organizationId,

      // Ticket belongs to another requester
      createdBy: "507f1f77bcf86cd799439099",

      // But it is assigned to logged-in agent
      assignedTo: mockUser._id,
    };

    const fakeComments = [
      {
        _id: "507f1f77bcf86cd799439062",

        ticketId: fakeTicket._id,

        organizationId: mockUser.organizationId,

        authorId: {
          _id: mockUser._id,
          name: "Test Agent",
          email: "agent@test.com",
          role: "agent",
        },

        message: "I am investigating the server issue.",

        createdAt: new Date(),
      },
    ];

    // Ticket exists and is assigned to current agent
    vi.spyOn(Ticket, "findOne").mockResolvedValue(fakeTicket);

    // Mock Comment.find() chain
    const mockQuery = {
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
    };

    mockQuery.then = (resolve) => {
      return resolve(fakeComments);
    };

    vi.spyOn(Comment, "find").mockReturnValue(mockQuery);

    const response = await request(app).get(
      `/api/tickets/${fakeTicket._id}/comments`,
    );

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Comments fetched successfully");

    expect(response.body.data).toBeDefined();

    expect(response.body.data).toHaveLength(1);

    expect(response.body.data[0].message).toBe(
      "I am investigating the server issue.",
    );
  });
});
