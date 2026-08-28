import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

import app from "../src/app.js";

import User from "../src/modules/users/user.model.js";
import Organization from "../src/modules/organizations/organization.model.js";
import bcrypt from "bcrypt";

describe("Authentication API", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should reject login when user does not exist", async () => {
    vi.spyOn(User, "findOne").mockReturnValue({
      select: vi.fn().mockResolvedValue(null),
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "unknown@example.com",
      password: "password123",
    });

    expect(response.status).toBe(401);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe("Invalid email or password");
  });

  it("should reject login with wrong password", async () => {
    const fakeUser = {
      _id: "507f1f77bcf86cd799439011",
      name: "Test Admin",
      email: "admin@test.com",
      password: "hashed-password",
      role: "admin",
      organizationId: "507f1f77bcf86cd799439012",
    };

    vi.spyOn(User, "findOne").mockReturnValue({
      select: vi.fn().mockResolvedValue(fakeUser),
    });

    vi.spyOn(bcrypt, "compare").mockResolvedValue(false);

    const response = await request(app).post("/api/auth/login").send({
      email: "admin@test.com",
      password: "wrongpassword",
    });

    expect(response.status).toBe(401);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe("Invalid email or password");
  });

  it("should login successfully with valid credentials", async () => {
    const fakeUser = {
      _id: "507f1f77bcf86cd799439011",
      name: "Test Admin",
      email: "admin@test.com",
      password: "hashed-password",
      role: "admin",
      organizationId: "507f1f77bcf86cd799439012",
    };

    const fakeOrganization = {
      _id: "507f1f77bcf86cd799439012",
      name: "Test Organization",
      isActive: true,
    };

    vi.spyOn(User, "findOne").mockReturnValue({
      select: vi.fn().mockResolvedValue(fakeUser),
    });

    vi.spyOn(bcrypt, "compare").mockResolvedValue(true);

    vi.spyOn(Organization, "findOne").mockResolvedValue(fakeOrganization);

    const response = await request(app).post("/api/auth/login").send({
      email: "admin@test.com",
      password: "password123",
    });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Login successful");

    expect(response.body.data.token).toBeDefined();

    expect(response.body.data.user).toBeDefined();

    expect(response.body.data.user.email).toBe("admin@test.com");

    expect(response.body.data.user.role).toBe("admin");

    expect(response.body.data.user.password).toBeUndefined();
  });
});
