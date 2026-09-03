import { z } from "zod";

// CREATE USER
export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),

  email: z
    .email("Invalid email address")
    .transform((value) => value.toLowerCase().trim()),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password cannot exceed 100 characters"),

  role: z.enum(["agent", "requester"], {
    message: "Role must be agent or requester",
  }),
});

// UPDATE USER
export const updateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .optional(),

  email: z
    .email("Invalid email address")
    .transform((value) => value.toLowerCase().trim())
    .optional(),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password cannot exceed 100 characters")
    .optional(),

  role: z
    .enum(["admin", "agent", "requester"], {
      message: "Invalid role",
    })
    .optional(),

  isActive: z.boolean().optional(),
});

// USER ID
export const userIdSchema = z.object({
  id: z.string().min(1, "User ID is required"),
});
