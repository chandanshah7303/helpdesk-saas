import {
  getAdminDashboardService,
  getAgentDashboardService,
  getRequesterDashboardService,
} from "./dashboard.service.js";

export const getAdminDashboard = async (req, res, next) => {
  try {
    const dashboard = await getAdminDashboardService(req.user);

    return res.status(200).json({
      success: true,
      message: "Admin dashboard fetched successfully",
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};

export const getAgentDashboard = async (req, res, next) => {
  try {
    const dashboard = await getAgentDashboardService(req.user);

    return res.status(200).json({
      success: true,
      message: "Agent dashboard fetched successfully",
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};

export const getRequesterDashboard = async (req, res, next) => {
  try {
    const dashboard = await getRequesterDashboardService(req.user);

    return res.status(200).json({
      success: true,
      message: "Requester dashboard fetched successfully",
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};
