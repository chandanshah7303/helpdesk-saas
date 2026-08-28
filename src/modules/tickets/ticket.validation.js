import { z } from "zod";

// CREATE TICKET
export const createTicketSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title cannot exceed 100 characters"),

  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description cannot exceed 5000 characters"),

  categoryId: z.string().trim().min(1, "Category ID is required"),

  priority: z.enum(["low", "medium", "high", "urgent"], {
    message: "Invalid priority",
  }),
});

// ASSIGN TICKET
export const assignTicketSchema = z.object({
  agentId: z.string().trim().min(1, "Agent ID is required"),
});

// UPDATE TICKET STATUS
export const updateTicketStatusSchema = z.object({
  status: z.enum(["pending", "in_progress", "resolved", "closed"], {
    message: "Invalid ticket status",
  }),
});
