import { describe, it, expect } from "vitest";
import request from "supertest";

import app from "../src/app.js";

describe("Health API", () => {
  it("should return server health status", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Server is running successfully");
  });
});
