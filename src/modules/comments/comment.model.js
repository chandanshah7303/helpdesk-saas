import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    ticketId: {type: mongoose.Schema.Types.ObjectId, ref: "Ticket", required: true, index: true},
    organizationId: {type: mongoose.Types.ObjectId, ref: "Organization", required: true, index: true},
    authorId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    message: {type: String, required: true, trim: true, minlength: 1, maxlength: 5000},
},{timestamps: true}
);

// Faster ticket comment queries
commentSchema.index({
  ticketId: 1,
  organizationId: 1,
  createdAt: 1,
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;