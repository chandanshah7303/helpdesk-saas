import { z } from "zod";

// CREATE ORGANIZATION
export const createOrganizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Organization name must be at least 2 characters")
    .max(150, "Organization name cannot exceed 150 characters"),

  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Organization slug must be at least 2 characters")
    .max(150, "Organization slug cannot exceed 150 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can contain only lowercase letters, numbers and hyphens",
    ),

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
});

// UPDATE ORGANIZATION
export const updateOrganizationSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Organization name must be at least 2 characters")
      .max(150, "Organization name cannot exceed 150 characters")
      .optional(),

    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(2, "Organization slug must be at least 2 characters")
      .max(150, "Organization slug cannot exceed 150 characters")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug can contain only lowercase letters, numbers and hyphens",
      )
      .optional(),

    description: z
      .string()
      .trim()
      .max(500, "Description cannot exceed 500 characters")
      .optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.slug !== undefined ||
      data.description !== undefined,
    {
      message: "At least one field is required for update",
    },
  );
