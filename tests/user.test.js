import { describe, it, expect, vi, beforeEach } from "vitest";

import request from "supertest";

import app from "../src/app.js";

import User from "../src/modules/users/user.model.js";

import Organization from "../src/modules/organizations/organization.model.js";

import bcrypt from "bcrypt";

// --------------------------------------------------
// MOCK AUTH MIDDLEWARE
// --------------------------------------------------

const mockUser = {
  _id: "507f1f77bcf86cd799439011",

  organizationId: "507f1f77bcf86cd799439012",

  role: "admin",
};

vi.mock("../src/middleware/auth.middleware.js", () => ({
  authMiddleware: (req, res, next) => {
    req.user = mockUser;

    next();
  },
}));

// --------------------------------------------------
// USER API TESTS
// --------------------------------------------------

describe("User API", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    mockUser.role = "admin";
  });

  // ------------------------------------------------
  // CREATE USER — SUCCESS
  // ------------------------------------------------

  it("should create a user successfully", async () => {
    const fakeOrganization = {
      _id: mockUser.organizationId,

      name: "Test Organization",

      isActive: true,
    };

    const fakeUser = {
      _id: "507f1f77bcf86cd799439013",

      name: "Agent User",

      email: "agent@test.com",

      password: "hashed-password",

      role: "agent",

      organizationId: mockUser.organizationId,

      isActive: true,

      toObject: vi.fn().mockReturnValue({
        _id: "507f1f77bcf86cd799439013",

        name: "Agent User",

        email: "agent@test.com",

        password: "hashed-password",

        role: "agent",

        organizationId: mockUser.organizationId,

        isActive: true,
      }),
    };

    const organizationSpy = vi
      .spyOn(Organization, "findOne")
      .mockResolvedValue(fakeOrganization);

    const userFindSpy = vi.spyOn(User, "findOne").mockResolvedValue(null);

    const hashSpy = vi
      .spyOn(bcrypt, "hash")
      .mockResolvedValue("hashed-password");

    const createSpy = vi.spyOn(User, "create").mockResolvedValue(fakeUser);

    const response = await request(app).post("/api/users").send({
      name: "Agent User",

      email: "agent@test.com",

      password: "password123",

      role: "agent",
    });

    expect(response.status).toBe(201);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("User created successfully");

    expect(response.body.data.name).toBe("Agent User");

    expect(response.body.data.email).toBe("agent@test.com");

    expect(response.body.data.role).toBe("agent");

    expect(response.body.data.organizationId).toBe(mockUser.organizationId);

    // Password must not be returned
    expect(response.body.data.password).toBeUndefined();

    expect(organizationSpy).toHaveBeenCalledWith({
      _id: mockUser.organizationId,

      isActive: true,
    });

    expect(userFindSpy).toHaveBeenCalledWith({
      organizationId: mockUser.organizationId,

      email: "agent@test.com",
    });

    expect(hashSpy).toHaveBeenCalledWith("password123", 12);

    expect(createSpy).toHaveBeenCalledWith({
      name: "Agent User",

      email: "agent@test.com",

      password: "hashed-password",

      role: "agent",

      organizationId: mockUser.organizationId,
    });
  });

  // ------------------------------------------------
  // CREATE USER — ORGANIZATION NOT FOUND / INACTIVE
  // ------------------------------------------------

  it("should reject user creation when organization is not found or inactive", async () => {
    const organizationSpy = vi
      .spyOn(Organization, "findOne")
      .mockResolvedValue(null);

    const userFindSpy = vi.spyOn(User, "findOne");

    const createSpy = vi.spyOn(User, "create");

    const hashSpy = vi.spyOn(bcrypt, "hash");

    const response = await request(app).post("/api/users").send({
      name: "Agent User",
      email: "agent@test.com",
      password: "password123",
      role: "agent",
    });

    expect(response.status).toBe(404);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe("Organization not found or inactive");

    // Organization check must happen first
    expect(organizationSpy).toHaveBeenCalledWith({
      _id: mockUser.organizationId,
      isActive: true,
    });

    // Database operations after organization check
    // must NOT be reached.
    expect(userFindSpy).not.toHaveBeenCalled();

    expect(hashSpy).not.toHaveBeenCalled();

    expect(createSpy).not.toHaveBeenCalled();
  });

  // ------------------------------------------------
  // CREATE USER — DUPLICATE EMAIL
  // ------------------------------------------------

  it("should reject duplicate email in the same organization", async () => {
    const existingUser = {
      _id: "507f1f77bcf86cd799439014",
      email: "agent@test.com",
      organizationId: mockUser.organizationId,
    };

    vi.spyOn(Organization, "findOne").mockResolvedValue({
      _id: mockUser.organizationId,
      isActive: true,
    });

    const userFindSpy = vi
      .spyOn(User, "findOne")
      .mockResolvedValue(existingUser);

    const hashSpy = vi.spyOn(bcrypt, "hash");

    const createSpy = vi.spyOn(User, "create");

    const response = await request(app).post("/api/users").send({
      name: "Another Agent",
      email: "agent@test.com",
      password: "password123",
      role: "agent",
    });

    expect(response.status).toBe(409);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "User with this email already exists in your organization",
    );

    expect(userFindSpy).toHaveBeenCalledWith({
      organizationId: mockUser.organizationId,
      email: "agent@test.com",
    });

    // Password hashing and creation must not happen.
    expect(hashSpy).not.toHaveBeenCalled();

    expect(createSpy).not.toHaveBeenCalled();
  });

  // ------------------------------------------------
  // CREATE USER — INVALID DATA
  // ------------------------------------------------

  it("should reject user creation with invalid data", async () => {
    const organizationSpy = vi.spyOn(Organization, "findOne");

    const userFindSpy = vi.spyOn(User, "findOne");

    const createSpy = vi.spyOn(User, "create");

    const hashSpy = vi.spyOn(bcrypt, "hash");

    const response = await request(app).post("/api/users").send({
      name: "A",
      email: "invalid-email",
      password: "123",
      role: "invalid-role",
    });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);

    // Validation must stop execution.
    expect(organizationSpy).not.toHaveBeenCalled();

    expect(userFindSpy).not.toHaveBeenCalled();

    expect(hashSpy).not.toHaveBeenCalled();

    expect(createSpy).not.toHaveBeenCalled();
  });

  // ------------------------------------------------
  // GET ALL USERS — SUCCESS + ORGANIZATION ISOLATION
  // ------------------------------------------------

  it("should get users only from admin's organization with pagination", async () => {
    const fakeUsers = [
      {
        _id: "507f1f77bcf86cd799439015",
        name: "Agent One",
        email: "agent1@test.com",
        role: "agent",
        organizationId: mockUser.organizationId,
        isActive: true,
      },
      {
        _id: "507f1f77bcf86cd799439016",
        name: "Requester One",
        email: "requester@test.com",
        role: "requester",
        organizationId: mockUser.organizationId,
        isActive: true,
      },
    ];

    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue(fakeUsers),
    };

    const findSpy = vi.spyOn(User, "find").mockReturnValue(mockQuery);

    const countSpy = vi.spyOn(User, "countDocuments").mockResolvedValue(2);

    const response = await request(app).get("/api/users").query({
      page: 1,
      limit: 10,
    });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Users fetched successfully");

    expect(response.body.data.users).toHaveLength(2);

    expect(response.body.data.pagination).toEqual({
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    // Organization isolation
    expect(findSpy).toHaveBeenCalledWith({
      organizationId: mockUser.organizationId,
    });

    expect(countSpy).toHaveBeenCalledWith({
      organizationId: mockUser.organizationId,
    });

    // Password must never be returned.
    expect(mockQuery.select).toHaveBeenCalledWith("-password");

    expect(mockQuery.sort).toHaveBeenCalledWith({
      createdAt: -1,
    });

    expect(mockQuery.skip).toHaveBeenCalledWith(0);

    expect(mockQuery.limit).toHaveBeenCalledWith(10);
  });

  // ------------------------------------------------
  // GET USER BY ID — SUCCESS
  // ------------------------------------------------

  it("should get a user by ID successfully", async () => {
    const userId = "507f1f77bcf86cd799439017";

    const fakeUser = {
      _id: userId,
      name: "Agent User",
      email: "agent@test.com",
      role: "agent",
      organizationId: mockUser.organizationId,
      isActive: true,
    };

    const mockQuery = {
      select: vi.fn().mockResolvedValue(fakeUser),
    };

    const findOneSpy = vi.spyOn(User, "findOne").mockReturnValue(mockQuery);

    const response = await request(app).get(`/api/users/${userId}`);

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("User fetched successfully");

    expect(response.body.data).toEqual(fakeUser);

    expect(response.body.data.password).toBeUndefined();

    // Multi-tenant isolation
    expect(findOneSpy).toHaveBeenCalledWith({
      _id: userId,
      organizationId: mockUser.organizationId,
    });

    // Password must be excluded.
    expect(mockQuery.select).toHaveBeenCalledWith("-password");
  });

  // ------------------------------------------------
  // GET USER BY ID — NOT FOUND
  // ------------------------------------------------

  it("should return 404 when user does not exist", async () => {
    const userId = "507f1f77bcf86cd799439018";

    const mockQuery = {
      select: vi.fn().mockResolvedValue(null),
    };

    const findOneSpy = vi.spyOn(User, "findOne").mockReturnValue(mockQuery);

    const response = await request(app).get(`/api/users/${userId}`);

    expect(response.status).toBe(404);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe("User not found");

    expect(response.body.data).toBeNull();

    expect(findOneSpy).toHaveBeenCalledWith({
      _id: userId,
      organizationId: mockUser.organizationId,
    });

    expect(mockQuery.select).toHaveBeenCalledWith("-password");
  });

  // ------------------------------------------------
  // UPDATE USER — SUCCESS
  // ------------------------------------------------

  it("should update a user successfully", async () => {
    const userId = "507f1f77bcf86cd799439019";

    const fakeUser = {
      _id: userId,
      name: "Old Name",
      email: "old@test.com",
      password: "old-hashed-password",
      role: "requester",
      organizationId: mockUser.organizationId,
      isActive: true,

      save: vi.fn().mockResolvedValue(),

      toObject: vi.fn(() => ({
        _id: userId,
        name: "Updated User",
        email: "updated@test.com",
        password: "new-hashed-password",
        role: "agent",
        organizationId: mockUser.organizationId,
        isActive: false,
      })),
    };

    const findOneSpy = vi
      .spyOn(User, "findOne")
      .mockResolvedValueOnce(fakeUser)
      .mockResolvedValueOnce(null);

    const hashSpy = vi
      .spyOn(bcrypt, "hash")
      .mockResolvedValue("new-hashed-password");

    const response = await request(app).patch(`/api/users/${userId}`).send({
      name: "Updated User",
      email: "updated@test.com",
      password: "newpassword123",
      role: "agent",
      isActive: false,
    });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("User updated successfully");

    expect(response.body.data.password).toBeUndefined();

    expect(response.body.data.name).toBe("Updated User");

    expect(response.body.data.email).toBe("updated@test.com");

    expect(response.body.data.role).toBe("agent");

    expect(response.body.data.isActive).toBe(false);

    // Password should be hashed.
    expect(fakeUser.password).toBe("new-hashed-password");

    expect(hashSpy).toHaveBeenCalledWith("newpassword123", 12);

    expect(fakeUser.save).toHaveBeenCalledOnce();

    // First find → user being updated
    expect(findOneSpy).toHaveBeenNthCalledWith(1, {
      _id: userId,
      organizationId: mockUser.organizationId,
    });

    // Second find → duplicate email check
    expect(findOneSpy).toHaveBeenNthCalledWith(2, {
      organizationId: mockUser.organizationId,
      email: "updated@test.com",
      _id: { $ne: userId },
    });
  });

  // ------------------------------------------------
  // UPDATE USER — DUPLICATE EMAIL
  // ------------------------------------------------

  it("should reject updating user when email already exists in the organization", async () => {
    const userId = "507f1f77bcf86cd799439020";

    const fakeUser = {
      _id: userId,
      name: "Agent User",
      email: "agent@test.com",
      password: "hashed-password",
      role: "agent",
      organizationId: mockUser.organizationId,
      isActive: true,

      save: vi.fn(),
    };

    const existingUser = {
      _id: "507f1f77bcf86cd799439021",
      email: "existing@test.com",
    };

    const findOneSpy = vi
      .spyOn(User, "findOne")
      .mockResolvedValueOnce(fakeUser)
      .mockResolvedValueOnce(existingUser);

    const response = await request(app).patch(`/api/users/${userId}`).send({
      email: "existing@test.com",
    });

    expect(response.status).toBe(409);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "Email already exists in your organization",
    );

    expect(fakeUser.save).not.toHaveBeenCalled();

    expect(findOneSpy).toHaveBeenNthCalledWith(1, {
      _id: userId,
      organizationId: mockUser.organizationId,
    });

    expect(findOneSpy).toHaveBeenNthCalledWith(2, {
      organizationId: mockUser.organizationId,
      email: "existing@test.com",
      _id: { $ne: userId },
    });
  });

  // ------------------------------------------------
  // DEACTIVATE USER — SUCCESS
  // ------------------------------------------------

  it("should deactivate a user successfully", async () => {
    const userId = "507f1f77bcf86cd799439022";

    const fakeUser = {
      _id: userId,
      name: "Agent User",
      email: "agent@test.com",
      password: "hashed-password",
      role: "agent",
      organizationId: mockUser.organizationId,
      isActive: true,

      save: vi.fn().mockResolvedValue(),

      toObject: vi.fn(() => ({
        _id: userId,
        name: "Agent User",
        email: "agent@test.com",
        password: "hashed-password",
        role: "agent",
        organizationId: mockUser.organizationId,
        isActive: false,
      })),
    };

    const findOneSpy = vi.spyOn(User, "findOne").mockResolvedValue(fakeUser);

    const response = await request(app).patch(
      `/api/users/${userId}/deactivate`,
    );

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("User deactivated successfully");

    expect(response.body.data.isActive).toBe(false);

    expect(response.body.data.password).toBeUndefined();

    expect(fakeUser.isActive).toBe(false);

    expect(fakeUser.save).toHaveBeenCalledOnce();

    expect(findOneSpy).toHaveBeenCalledWith({
      _id: userId,
      organizationId: mockUser.organizationId,
    });
  });

  // ------------------------------------------------
  // DEACTIVATE USER — SELF DEACTIVATION
  // ------------------------------------------------

  it("should reject admin from deactivating himself", async () => {
    const adminId = mockUser._id;

    const findOneSpy = vi.spyOn(User, "findOne");

    const response = await request(app).patch(
      `/api/users/${adminId}/deactivate`,
    );

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "You cannot deactivate your own account",
    );

    // Database should not be touched.
    expect(findOneSpy).not.toHaveBeenCalled();
  });

  // ------------------------------------------------
  // DEACTIVATE USER — ALREADY INACTIVE
  // ------------------------------------------------

  it("should reject deactivating an already inactive user", async () => {
    const userId = "507f1f77bcf86cd799439023";

    const fakeUser = {
      _id: userId,
      name: "Inactive User",
      email: "inactive@test.com",
      password: "hashed-password",
      role: "agent",
      organizationId: mockUser.organizationId,
      isActive: false,

      save: vi.fn(),
    };

    const findOneSpy = vi.spyOn(User, "findOne").mockResolvedValue(fakeUser);

    const response = await request(app).patch(
      `/api/users/${userId}/deactivate`,
    );

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe("User is already inactive");

    // User should not be saved again.
    expect(fakeUser.save).not.toHaveBeenCalled();

    expect(findOneSpy).toHaveBeenCalledWith({
      _id: userId,
      organizationId: mockUser.organizationId,
    });
  });

  // ------------------------------------------------
  // GET USER BY ID — ORGANIZATION ISOLATION
  // ------------------------------------------------

  it("should not return a user from another organization", async () => {
    const userId = "507f1f77bcf86cd799439024";

    const findOneSpy = vi.spyOn(User, "findOne").mockReturnValue({
      select: vi.fn().mockResolvedValue(null),
    });

    const response = await request(app).get(`/api/users/${userId}`);

    expect(response.status).toBe(404);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe("User not found");

    expect(response.body.data).toBeNull();

    expect(findOneSpy).toHaveBeenCalledWith({
      _id: userId,
      organizationId: mockUser.organizationId,
    });
  });
}); 
