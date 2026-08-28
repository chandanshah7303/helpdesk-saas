import { z } from "zod";

export const ticketFilterSchema = z.object({
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(10),

  status: z.enum(["pending", "in_progress", "resolved", "closed"]).optional(),

  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),

  search: z
    .string()
    .trim()
    .max(100, "Search cannot exceed 100 characters")
    .optional(),
});
