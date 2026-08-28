import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    ticketId: { type: mongoose.Schema.Types.ObjectId,ref: "Ticket",required: true,index: true },

    organizationId: { type: mongoose.Schema.Types.ObjectId,ref: "Organization",required: true,index: true },

    actorId: { type: mongoose.Schema.Types.ObjectId,ref: "User",required: true,index: true },

    action: { type: String, required: true, enum: ["ticket_created", "ticket_assigned", "status_changed", "comment_added", "ticket_closed"] },
    
    oldValue: { type: String, default: null },

    newValue: { type: String, default: null },

    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },

  }, {timestamps: true,},
);

// Fast ticket history queries
auditLogSchema.index({
  ticketId: 1,
  organizationId: 1,
  createdAt: 1,
});

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
