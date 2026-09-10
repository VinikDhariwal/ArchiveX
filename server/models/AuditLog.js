import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    action: { type: String, required: true, trim: true, maxlength: 80, index: true },
    entityType: { type: String, required: true, trim: true, maxlength: 40, index: true },
    entityId: { type: String, default: '', maxlength: 64, index: true },
    summary: { type: String, default: '', maxlength: 500 },
    meta: { type: mongoose.Schema.Types.Mixed, default: undefined },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
