import { createCommentSchema } from "./comment.validation.js";

import { createCommentService, getTicketCommentsService } from "./comment.service.js";

// CREATE COMMENT
export const createComment = async (req, res, next) => {
  try {
    const data = createCommentSchema.parse(req.body);

    const comment = await createCommentService(
      req.params.ticketId,
      data.message,
      req.user,
    );

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

// GET TICKET COMMENTS
export const getTicketComments = async (req, res, next) => {
  try {
    const comments = await getTicketCommentsService(
      req.params.ticketId,
      req.user,
    );

    return res.status(200).json({
      success: true,
      message: "Comments fetched successfully",
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};
