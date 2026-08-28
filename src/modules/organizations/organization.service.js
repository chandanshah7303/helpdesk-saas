import Organization from "./organization.model.js";
import { ApiError } from "../../utils/ApiError.js";

// CREATE ORGANIZATION
export const createOrganizationService = async (data) => {
  const existingOrganization = await Organization.findOne({
    slug: data.slug,
  });

  if (existingOrganization) {
    throw new ApiError("Organization with this slug already exists", 409);
  }

  const organization = await Organization.create({
    name: data.name,
    slug: data.slug,
    description: data.description || "",
  });

  return organization;
};

// GET ORGANIZATION BY ID
export const getOrganizationByIdService = async (organizationId) => {
  const organization = await Organization.findById(organizationId);

  if (!organization) {
    throw new ApiError("Organization not found", 404);
  }

  return organization;
};

// UPDATE ORGANIZATION
export const updateOrganizationService = async (organizationId, data) => {
  const organization = await Organization.findById(organizationId);

  if (!organization) {
    throw new ApiError("Organization not found", 404);
  }

  // Update name
  if (data.name !== undefined) {
    organization.name = data.name;
  }

  // Update description
  if (data.description !== undefined) {
    organization.description = data.description;
  }

  // Update slug
  if (data.slug !== undefined) {
    const existingOrganization = await Organization.findOne({
      slug: data.slug,
      _id: { $ne: organizationId },
    });

    if (existingOrganization) {
      throw new ApiError("Organization with this slug already exists", 409);
    }

    organization.slug = data.slug;
  }

  await organization.save();

  return organization;
};

// DEACTIVATE ORGANIZATION
export const deactivateOrganizationService = async (organizationId) => {
  const organization = await Organization.findById(organizationId);

  if (!organization) {
    throw new ApiError("Organization not found", 404);
  }

  if (!organization.isActive) {
    throw new ApiError("Organization is already inactive", 400);
  }

  organization.isActive = false;

  await organization.save();

  return organization;
};
