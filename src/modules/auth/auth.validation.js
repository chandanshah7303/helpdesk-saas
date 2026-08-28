import { z } from "zod";

// REGISTER
export const registerSchema = z.object({
  organizationId: z.string().trim().min(1, "Organization ID is required"),

  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters long")
    .max(100, "Name cannot exceed 100 characters"),

  email: z
    .email("Invalid email address")
    .transform((value) => value.toLowerCase().trim()),

  password: z.string().min(6, "Password must be at least 6 characters long"),
});

// LOGIN
export const loginSchema = z.object({
  email: z
    .email("Invalid email address")
    .transform((value) => value.toLowerCase().trim()),

  password: z.string().min(6, "Password is required"),
});
