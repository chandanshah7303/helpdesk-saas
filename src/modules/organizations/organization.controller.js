import {
  createOrganizationService,
  getOrganizationByIdService,
  updateOrganizationService,
  deactivateOrganizationService,
} from "./organization.service.js";

import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from "./organization.validation.js";

// CREATE ORGANIZATION
export const createOrganization = async (req, res, next) => {
  try {
    const data = createOrganizationSchema.parse(req.body);

    const organization = await createOrganizationService(data);

    return res.status(201).json({
      success: true,
      message: "Organization created successfully",
      data: organization,
    });
  } catch (error) {
    return next(error);
  }
};

// GET ORGANIZATION
export const getOrganizationById = async (req, res, next) => {
  try {
    const organization = await getOrganizationByIdService(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Organization fetched successfully",
      data: organization,
    });
  } catch (error) {
    return next(error);
  }
};

// UPDATE ORGANIZATION
export const updateOrganization = async (req, res, next) => {
  try {
    const data = updateOrganizationSchema.parse(req.body);

    const organization = await updateOrganizationService(req.params.id, data);

    return res.status(200).json({
      success: true,
      message: "Organization updated successfully",
      data: organization,
    });
  } catch (error) {
    return next(error);
  }
};

// DEACTIVATE ORGANIZATION
export const deactivateOrganization = async (req, res, next) => {
  try {
    const organization = await deactivateOrganizationService(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Organization deactivated successfully",
      data: organization,
    });
  } catch (error) {
    return next(error);
  }
};
