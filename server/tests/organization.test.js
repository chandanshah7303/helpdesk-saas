import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

import app from "../src/app.js";
import Organization from "../src/modules/organizations/organization.model.js";

// --------------------------------------------------
// ORGANIZATION API TESTS
// --------------------------------------------------

describe("Organization API", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ------------------------------------------------
  // CREATE ORGANIZATION — SUCCESS
  // ------------------------------------------------

  it("should create an organization successfully", async () => {
    const fakeOrganization = {
      _id: "507f1f77bcf86cd799439013",
      name: "Tech Solutions",
      slug: "tech-solutions",
      description: "Technology company",
      isActive: true,
    };

    // Mock duplicate slug check
    vi.spyOn(Organization, "findOne").mockResolvedValue(null);

    // Mock organization creation
    vi.spyOn(Organization, "create").mockResolvedValue(fakeOrganization);

    const response = await request(app).post("/api/organizations").send({
      name: "Tech Solutions",
      slug: "tech-solutions",
      description: "Technology company",
    });

    expect(response.status).toBe(201);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Organization created successfully");

    expect(response.body.data).toBeDefined();

    expect(response.body.data.name).toBe("Tech Solutions");

    expect(response.body.data.slug).toBe("tech-solutions");

    expect(response.body.data.description).toBe("Technology company");

    expect(response.body.data.isActive).toBe(true);
  });

  // ------------------------------------------------
  // CREATE ORGANIZATION — DUPLICATE SLUG
  // ------------------------------------------------

  it("should reject organization when slug already exists", async () => {
    const existingOrganization = {
      _id: "507f1f77bcf86cd799439014",
      name: "Existing Company",
      slug: "tech-solutions",
    };

    // Simulate an existing organization with the same slug
    vi.spyOn(Organization, "findOne").mockResolvedValue(existingOrganization);

    // Organization.create() must NOT be called
    const createSpy = vi.spyOn(Organization, "create").mockResolvedValue();

    const response = await request(app).post("/api/organizations").send({
      name: "Another Company",
      slug: "tech-solutions",
      description: "Another company",
    });

    expect(response.status).toBe(409);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "Organization with this slug already exists",
    );

    expect(createSpy).not.toHaveBeenCalled();
  });

  // ------------------------------------------------
  // CREATE ORGANIZATION — VALIDATION ERROR
  // ------------------------------------------------

  it("should reject organization with invalid data", async () => {
    const findOneSpy = vi
      .spyOn(Organization, "findOne")
      .mockResolvedValue(null);

    const createSpy = vi.spyOn(Organization, "create").mockResolvedValue();

    const response = await request(app).post("/api/organizations").send({
      name: "A",
      slug: "Invalid Slug!",
      description: "Test organization",
    });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);

    // Validation should stop the request
    // before database operations are executed.
    expect(findOneSpy).not.toHaveBeenCalled();

    expect(createSpy).not.toHaveBeenCalled();
  });

  // ------------------------------------------------
  // GET ORGANIZATION — SUCCESS
  // ------------------------------------------------

  it("should get an organization by ID successfully", async () => {
    const fakeOrganization = {
      _id: "507f1f77bcf86cd799439015",
      name: "Tech Solutions",
      slug: "tech-solutions",
      description: "Technology company",
      isActive: true,
    };

    vi.spyOn(Organization, "findById").mockResolvedValue(fakeOrganization);

    const response = await request(app).get(
      `/api/organizations/${fakeOrganization._id}`,
    );

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Organization fetched successfully");

    expect(response.body.data).toBeDefined();

    expect(response.body.data.name).toBe("Tech Solutions");

    expect(response.body.data.slug).toBe("tech-solutions");

    expect(response.body.data.description).toBe("Technology company");

    expect(response.body.data.isActive).toBe(true);

    expect(Organization.findById).toHaveBeenCalledWith(fakeOrganization._id);
  });

  // ------------------------------------------------
  // GET ORGANIZATION — NOT FOUND
  // ------------------------------------------------

  it("should return 404 when organization does not exist", async () => {
    const organizationId = "507f1f77bcf86cd799439016";

    vi.spyOn(Organization, "findById").mockResolvedValue(null);

    const response = await request(app).get(
      `/api/organizations/${organizationId}`,
    );

    expect(response.status).toBe(404);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe("Organization not found");

    expect(response.body.data).toBeNull();

    expect(Organization.findById).toHaveBeenCalledWith(organizationId);
  });

  // ------------------------------------------------
  // UPDATE ORGANIZATION — SUCCESS
  // ------------------------------------------------

  it("should update organization successfully", async () => {
    const organizationId = "507f1f77bcf86cd799439017";

    const fakeOrganization = {
      _id: organizationId,
      name: "Old Company",
      slug: "old-company",
      description: "Old description",
      isActive: true,

      save: vi.fn().mockResolvedValue(true),
    };

    vi.spyOn(Organization, "findById").mockResolvedValue(fakeOrganization);

    const response = await request(app)
      .patch(`/api/organizations/${organizationId}`)
      .send({
        name: "New Company",
        description: "Updated company description",
      });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Organization updated successfully");

    expect(response.body.data).toBeDefined();

    expect(response.body.data.name).toBe("New Company");

    expect(response.body.data.description).toBe("Updated company description");

    expect(fakeOrganization.save).toHaveBeenCalledOnce();

    expect(Organization.findById).toHaveBeenCalledWith(organizationId);
  });

  // ------------------------------------------------
  // UPDATE ORGANIZATION — NOT FOUND
  // ------------------------------------------------

  it("should return 404 when updating a non-existing organization", async () => {
    const organizationId = "507f1f77bcf86cd799439018";

    vi.spyOn(Organization, "findById").mockResolvedValue(null);

    const response = await request(app)
      .patch(`/api/organizations/${organizationId}`)
      .send({
        name: "Updated Company",
      });

    expect(response.status).toBe(404);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe("Organization not found");

    expect(response.body.data).toBeNull();

    expect(Organization.findById).toHaveBeenCalledWith(organizationId);
  });

  // ------------------------------------------------
  // UPDATE ORGANIZATION — DUPLICATE SLUG
  // ------------------------------------------------

  it("should reject update when slug already belongs to another organization", async () => {
    const organizationId = "507f1f77bcf86cd799439019";

    const fakeOrganization = {
      _id: organizationId,
      name: "My Company",
      slug: "my-company",
      description: "My company",
      isActive: true,

      save: vi.fn().mockResolvedValue(true),
    };

    const existingOrganization = {
      _id: "507f1f77bcf86cd799439020",
      name: "Another Company",
      slug: "another-company",
    };

    vi.spyOn(Organization, "findById").mockResolvedValue(fakeOrganization);

    vi.spyOn(Organization, "findOne").mockResolvedValue(existingOrganization);

    const response = await request(app)
      .patch(`/api/organizations/${organizationId}`)
      .send({
        slug: "another-company",
      });

    expect(response.status).toBe(409);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "Organization with this slug already exists",
    );

    // Organization must not be saved
    expect(fakeOrganization.save).not.toHaveBeenCalled();

    expect(Organization.findOne).toHaveBeenCalledWith({
      slug: "another-company",
      _id: { $ne: organizationId },
    });
  });

  // ------------------------------------------------
  // UPDATE ORGANIZATION — VALIDATION ERROR
  // ------------------------------------------------

  it("should reject update when no fields are provided", async () => {
    const organizationId = "507f1f77bcf86cd799439021";

    const findByIdSpy = vi.spyOn(Organization, "findById");

    const response = await request(app)
      .patch(`/api/organizations/${organizationId}`)
      .send({});

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);

    expect(findByIdSpy).not.toHaveBeenCalled();
  });

  // ------------------------------------------------
  // DEACTIVATE ORGANIZATION — SUCCESS
  // ------------------------------------------------

  it("should deactivate an organization successfully", async () => {
    const organizationId = "507f1f77bcf86cd799439022";

    const fakeOrganization = {
      _id: organizationId,
      name: "Tech Solutions",
      slug: "tech-solutions",
      description: "Technology company",
      isActive: true,

      save: vi.fn().mockResolvedValue(true),
    };

    vi.spyOn(Organization, "findById").mockResolvedValue(fakeOrganization);

    const response = await request(app).patch(
      `/api/organizations/${organizationId}/deactivate`,
    );

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Organization deactivated successfully");

    expect(response.body.data).toBeDefined();

    expect(response.body.data.isActive).toBe(false);

    expect(fakeOrganization.isActive).toBe(false);

    expect(fakeOrganization.save).toHaveBeenCalledOnce();

    expect(Organization.findById).toHaveBeenCalledWith(organizationId);
  });

  // ------------------------------------------------
  // DEACTIVATE ORGANIZATION — ALREADY INACTIVE
  // ------------------------------------------------

  it("should reject deactivation when organization is already inactive", async () => {
    const organizationId = "507f1f77bcf86cd799439023";

    const fakeOrganization = {
      _id: organizationId,
      name: "Inactive Company",
      slug: "inactive-company",
      description: "Inactive organization",
      isActive: false,

      save: vi.fn().mockResolvedValue(true),
    };

    vi.spyOn(Organization, "findById").mockResolvedValue(fakeOrganization);

    const response = await request(app).patch(
      `/api/organizations/${organizationId}/deactivate`,
    );

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe("Organization is already inactive");

    // Organization must not be saved again
    expect(fakeOrganization.save).not.toHaveBeenCalled();

    expect(Organization.findById).toHaveBeenCalledWith(organizationId);

    // State must remain unchanged
    expect(fakeOrganization.isActive).toBe(false);
  });

  // ------------------------------------------------
  // DEACTIVATE ORGANIZATION — NOT FOUND
  // ------------------------------------------------

  it("should return 404 when deactivating a non-existing organization", async () => {
    const organizationId = "507f1f77bcf86cd799439024";

    vi.spyOn(Organization, "findById").mockResolvedValue(null);

    const response = await request(app).patch(
      `/api/organizations/${organizationId}/deactivate`,
    );

    expect(response.status).toBe(404);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe("Organization not found");

    expect(response.body.data).toBeNull();

    expect(Organization.findById).toHaveBeenCalledWith(organizationId);
  });
});
