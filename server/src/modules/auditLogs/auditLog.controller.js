import { getTicketHistoryService } from "./auditLog.service.js";

export const getTicketHistory = async (req, res, next) => {
  try {
    const history = await getTicketHistoryService(
      req.params.ticketId,
      req.user,
    );

    return res.status(200).json({
      success: true,
      message: "Ticket history fetched successfully",
      data: history,
    });
  } catch (error) {
    next(error);
  }
};
