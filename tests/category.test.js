import { describe, it, expect, vi, beforeEach } from "vitest";

import request from "supertest";

import app from "../src/app.js";

import Category from "../src/modules/categories/category.model.js";

// --------------------------------------------------
// MOCK USER
// --------------------------------------------------

const mockUser = {
  _id: "507f1f77bcf86cd799439011",

  organizationId: "507f1f77bcf86cd799439012",

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
// CATEGORY API TESTS
// --------------------------------------------------

describe("Category API", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    mockUser._id = "507f1f77bcf86cd799439011";

    mockUser.organizationId = "507f1f77bcf86cd799439012";

    mockUser.role = "admin";
  });

  // ------------------------------------------------
  // CREATE CATEGORY — SUCCESS
  // ------------------------------------------------

  it("should create a category successfully", async () => {
    const fakeCategory = {
      _id: "507f1f77bcf86cd799439020",

      name: "Technical Issue",

      description: "Technical support related issues",

      organizationId: mockUser.organizationId,

      isActive: true,
    };

    vi.spyOn(Category, "findOne").mockResolvedValue(null);

    vi.spyOn(Category, "create").mockResolvedValue(fakeCategory);

    const response = await request(app).post("/api/categories").send({
      name: "Technical Issue",
      description: "Technical support related issues",
    });

    expect(response.status).toBe(201);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Category created successfully");

    expect(response.body.data).toEqual(fakeCategory);

    expect(Category.findOne).toHaveBeenCalledWith({
      organizationId: mockUser.organizationId,

      name: "Technical Issue",
    });

    expect(Category.create).toHaveBeenCalledWith({
      name: "Technical Issue",

      description: "Technical support related issues",

      organizationId: mockUser.organizationId,
    });
  });

  // ------------------------------------------------
  // CREATE CATEGORY — DUPLICATE NAME
  // ------------------------------------------------

  it("should reject duplicate category name in the same organization", async () => {
    const existingCategory = {
      _id: "507f1f77bcf86cd799439021",

      name: "Technical Issue",

      description: "Existing category",

      organizationId: mockUser.organizationId,

      isActive: true,
    };

    vi.spyOn(Category, "findOne").mockResolvedValue(existingCategory);

    const createSpy = vi.spyOn(Category, "create");

    const response = await request(app).post("/api/categories").send({
      name: "Technical Issue",

      description: "Another description",
    });

    expect(response.status).toBe(409);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "Category with this name already exists in your organization",
    );

    expect(Category.findOne).toHaveBeenCalledWith({
      organizationId: mockUser.organizationId,

      name: "Technical Issue",
    });

    // Database create must not happen
    expect(createSpy).not.toHaveBeenCalled();
  });

  // ------------------------------------------------
  // CREATE CATEGORY — INVALID DATA
  // ------------------------------------------------

  it("should reject category with invalid data", async () => {
    const findOneSpy = vi.spyOn(Category, "findOne");

    const createSpy = vi.spyOn(Category, "create");

    const response = await request(app).post("/api/categories").send({
      name: "A",
      description: "Invalid category name",
    });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);

    // Database methods must not be reached
    expect(findOneSpy).not.toHaveBeenCalled();

    expect(createSpy).not.toHaveBeenCalled();
  });

  // ------------------------------------------------
  // GET ALL CATEGORIES — SUCCESS
  // ------------------------------------------------

  it("should get all active categories of the user's organization", async () => {
    mockUser.role = "requester";

    const fakeCategories = [
      {
        _id: "507f1f77bcf86cd799439022",

        name: "Account Issue",

        description: "Account related problems",

        organizationId: mockUser.organizationId,

        isActive: true,
      },
      {
        _id: "507f1f77bcf86cd799439023",

        name: "Technical Issue",

        description: "Technical support issues",

        organizationId: mockUser.organizationId,

        isActive: true,
      },
    ];

    const mockQuery = {
      sort: vi.fn().mockResolvedValue(fakeCategories),
    };

    vi.spyOn(Category, "find").mockReturnValue(mockQuery);

    const response = await request(app).get("/api/categories");

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Categories fetched successfully");

    expect(response.body.data).toHaveLength(2);

    expect(response.body.data[0].name).toBe("Account Issue");

    expect(response.body.data[1].name).toBe("Technical Issue");

    expect(Category.find).toHaveBeenCalledWith({
      organizationId: mockUser.organizationId,

      isActive: true,
    });

    expect(mockQuery.sort).toHaveBeenCalledWith({
      name: 1,
    });
  });

  // ------------------------------------------------
  // GET ALL CATEGORIES — ORGANIZATION ISOLATION
  // ------------------------------------------------

  it("should fetch categories only from the user's organization", async () => {
    mockUser.role = "agent";

    const fakeCategories = [
      {
        _id: "507f1f77bcf86cd799439024",

        name: "Network Issue",

        description: "Network related problems",

        organizationId: mockUser.organizationId,

        isActive: true,
      },
    ];

    const mockQuery = {
      sort: vi.fn().mockResolvedValue(fakeCategories),
    };

    const findSpy = vi.spyOn(Category, "find").mockReturnValue(mockQuery);

    const response = await request(app).get("/api/categories");

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.data).toHaveLength(1);

    expect(response.body.data[0].organizationId).toBe(mockUser.organizationId);

    // Critical multi-tenant check
    expect(findSpy).toHaveBeenCalledWith({
      organizationId: mockUser.organizationId,

      isActive: true,
    });

    expect(mockQuery.sort).toHaveBeenCalledWith({
      name: 1,
    });
  });

  // ------------------------------------------------
  // UPDATE CATEGORY — SUCCESS
  // ------------------------------------------------

  it("should update a category successfully", async () => {
    mockUser.role = "admin";

    const categoryId = "507f1f77bcf86cd799439025";

    const fakeCategory = {
      _id: categoryId,

      name: "Technical Issue",

      description: "Old description",

      organizationId: mockUser.organizationId,

      isActive: true,

      save: vi.fn().mockResolvedValue(true),
    };

    const findOneSpy = vi
      .spyOn(Category, "findOne")
      .mockResolvedValueOnce(fakeCategory)
      .mockResolvedValueOnce(null);

    const response = await request(app)
      .patch(`/api/categories/${categoryId}`)
      .send({
        name: "Technical Support",

        description: "Updated technical support issues",
      });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Category updated successfully");

    // Check response data fields
    expect(response.body.data._id).toBe(categoryId);

    expect(response.body.data.name).toBe("Technical Support");

    expect(response.body.data.description).toBe(
      "Updated technical support issues",
    );

    expect(response.body.data.organizationId).toBe(mockUser.organizationId);

    expect(response.body.data.isActive).toBe(true);

    // First find → existing category
    expect(findOneSpy).toHaveBeenNthCalledWith(1, {
      _id: categoryId,

      organizationId: mockUser.organizationId,

      isActive: true,
    });

    // Second find → duplicate name check
    expect(findOneSpy).toHaveBeenNthCalledWith(2, {
      organizationId: mockUser.organizationId,

      name: "Technical Support",

      _id: { $ne: categoryId },
    });

    // Verify actual object was updated
    expect(fakeCategory.name).toBe("Technical Support");

    expect(fakeCategory.description).toBe("Updated technical support issues");

    expect(fakeCategory.save).toHaveBeenCalledOnce();
  });

  // ------------------------------------------------
  // UPDATE CATEGORY — NOT FOUND
  // ------------------------------------------------

  it("should return 404 when category does not exist", async () => {
    mockUser.role = "admin";

    const categoryId = "507f1f77bcf86cd799439026";

    const findOneSpy = vi.spyOn(Category, "findOne").mockResolvedValue(null);

    const response = await request(app)
      .patch(`/api/categories/${categoryId}`)
      .send({
        name: "Updated Category",
      });

    expect(response.status).toBe(404);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "Category not found in your organization",
    );

    expect(response.body.data).toBeNull();

    expect(findOneSpy).toHaveBeenCalledOnce();

    expect(findOneSpy).toHaveBeenCalledWith({
      _id: categoryId,

      organizationId: mockUser.organizationId,

      isActive: true,
    });
  });

  // ------------------------------------------------
  // UPDATE CATEGORY — DUPLICATE NAME
  // ------------------------------------------------

  it("should reject category update when the new name already exists", async () => {
    mockUser.role = "admin";

    const categoryId = "507f1f77bcf86cd799439027";

    const fakeCategory = {
      _id: categoryId,

      name: "Technical Issue",

      description: "Current category",

      organizationId: mockUser.organizationId,

      isActive: true,

      save: vi.fn().mockResolvedValue(true),
    };

    const existingCategory = {
      _id: "507f1f77bcf86cd799439028",

      name: "Network Issue",

      organizationId: mockUser.organizationId,

      isActive: true,
    };

    const findOneSpy = vi
      .spyOn(Category, "findOne")
      .mockResolvedValueOnce(fakeCategory)
      .mockResolvedValueOnce(existingCategory);

    const response = await request(app)
      .patch(`/api/categories/${categoryId}`)
      .send({
        name: "Network Issue",
      });

    expect(response.status).toBe(409);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "Category with this name already exists in your organization",
    );

    // Original category must remain unchanged
    expect(fakeCategory.name).toBe("Technical Issue");

    // Database save must NOT happen
    expect(fakeCategory.save).not.toHaveBeenCalled();

    // First call → find current category
    expect(findOneSpy).toHaveBeenNthCalledWith(1, {
      _id: categoryId,

      organizationId: mockUser.organizationId,

      isActive: true,
    });

    // Second call → check duplicate name
    expect(findOneSpy).toHaveBeenNthCalledWith(2, {
      organizationId: mockUser.organizationId,

      name: "Network Issue",

      _id: { $ne: categoryId },
    });
  });

  // ------------------------------------------------
  // UPDATE CATEGORY — EMPTY BODY
  // ------------------------------------------------

  it("should reject category update when no fields are provided", async () => {
    mockUser.role = "admin";

    const categoryId = "507f1f77bcf86cd799439029";

    const findOneSpy = vi.spyOn(Category, "findOne");

    const response = await request(app)
      .patch(`/api/categories/${categoryId}`)
      .send({});

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);

    // Validation must stop the request before database access
    expect(findOneSpy).not.toHaveBeenCalled();
  });

  // ------------------------------------------------
  // DEACTIVATE CATEGORY — SUCCESS
  // ------------------------------------------------

  it("should deactivate a category successfully", async () => {
    mockUser.role = "admin";

    const categoryId = "507f1f77bcf86cd799439030";

    const fakeCategory = {
      _id: categoryId,

      name: "Technical Issue",

      description: "Technical support issues",

      organizationId: mockUser.organizationId,

      isActive: true,

      save: vi.fn().mockResolvedValue(true),
    };

    const findOneSpy = vi
      .spyOn(Category, "findOne")
      .mockResolvedValue(fakeCategory);

    const response = await request(app).delete(
      `/api/categories/${categoryId}/deactivate`,
    );

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Category deactivated successfully");

    expect(response.body.data._id).toBe(categoryId);

    expect(response.body.data.name).toBe("Technical Issue");

    expect(response.body.data.isActive).toBe(false);

    expect(findOneSpy).toHaveBeenCalledWith({
      _id: categoryId,

      organizationId: mockUser.organizationId,

      isActive: true,
    });

    expect(fakeCategory.isActive).toBe(false);

    expect(fakeCategory.save).toHaveBeenCalledOnce();
  });

  // ------------------------------------------------
  // DEACTIVATE CATEGORY — NOT FOUND
  // ------------------------------------------------

  it("should return 404 when category does not exist or is inactive", async () => {
    mockUser.role = "admin";

    const categoryId = "507f1f77bcf86cd799439031";

    const findOneSpy = vi.spyOn(Category, "findOne").mockResolvedValue(null);

    const response = await request(app).delete(
      `/api/categories/${categoryId}/deactivate`,
    );

    expect(response.status).toBe(404);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "Category not found in your organization",
    );

    expect(findOneSpy).toHaveBeenCalledOnce();

    expect(findOneSpy).toHaveBeenCalledWith({
      _id: categoryId,

      organizationId: mockUser.organizationId,

      isActive: true,
    });
  });

  // ------------------------------------------------
  // AUTHORIZATION — AGENT CANNOT CREATE CATEGORY
  // ------------------------------------------------

  it("should reject agent from creating a category", async () => {
    mockUser.role = "agent";

    const createSpy = vi.spyOn(Category, "create");

    const response = await request(app).post("/api/categories").send({
      name: "Network",
      description: "Network related issues",
    });

    expect(response.status).toBe(403);

    expect(response.body.success).toBe(false);

    expect(createSpy).not.toHaveBeenCalled();
  });

  // ------------------------------------------------
  // AUTHORIZATION — REQUESTER CANNOT CREATE CATEGORY
  // ------------------------------------------------

  it("should reject requester from creating a category", async () => {
    mockUser.role = "requester";

    const createSpy = vi.spyOn(Category, "create");

    const response = await request(app).post("/api/categories").send({
      name: "Network",
      description: "Network related issues",
    });

    expect(response.status).toBe(403);

    expect(response.body.success).toBe(false);

    expect(createSpy).not.toHaveBeenCalled();
  });

  // ------------------------------------------------
  // AUTHORIZATION — AGENT CANNOT UPDATE CATEGORY
  // ------------------------------------------------

  it("should reject agent from updating a category", async () => {
    mockUser.role = "agent";

    const categoryId = "507f1f77bcf86cd799439032";

    const findOneSpy = vi.spyOn(Category, "findOne");

    const response = await request(app)
      .patch(`/api/categories/${categoryId}`)
      .send({
        name: "Updated Category",
      });

    expect(response.status).toBe(403);

    expect(response.body.success).toBe(false);

    expect(findOneSpy).not.toHaveBeenCalled();
  });

  // ------------------------------------------------
  // AUTHORIZATION — REQUESTER CANNOT UPDATE CATEGORY
  // ------------------------------------------------

  it("should reject requester from updating a category", async () => {
    mockUser.role = "requester";

    const categoryId = "507f1f77bcf86cd799439033";

    const findOneSpy = vi.spyOn(Category, "findOne");

    const response = await request(app)
      .patch(`/api/categories/${categoryId}`)
      .send({
        name: "Updated Category",
      });

    expect(response.status).toBe(403);

    expect(response.body.success).toBe(false);

    expect(findOneSpy).not.toHaveBeenCalled();
  });

  // ------------------------------------------------
  // AUTHORIZATION — AGENT CANNOT DEACTIVATE CATEGORY
  // ------------------------------------------------

  it("should reject agent from deactivating a category", async () => {
    mockUser.role = "agent";

    const categoryId = "507f1f77bcf86cd799439034";

    const findOneSpy = vi.spyOn(Category, "findOne");

    const response = await request(app).delete(
      `/api/categories/${categoryId}/deactivate`,
    );

    expect(response.status).toBe(403);

    expect(response.body.success).toBe(false);

    expect(findOneSpy).not.toHaveBeenCalled();
  });

  // ------------------------------------------------
  // AUTHORIZATION — REQUESTER CANNOT DEACTIVATE CATEGORY
  // ------------------------------------------------

  it("should reject requester from deactivating a category", async () => {
    mockUser.role = "requester";

    const categoryId = "507f1f77bcf86cd799439035";

    const findOneSpy = vi.spyOn(Category, "findOne");

    const response = await request(app).delete(
      `/api/categories/${categoryId}/deactivate`,
    );

    expect(response.status).toBe(403);

    expect(response.body.success).toBe(false);

    expect(findOneSpy).not.toHaveBeenCalled();
  });
});
