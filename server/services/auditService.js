import { AuditLog } from '../models/index.js';

export async function recordAudit({
  actorId,
  action,
  entityType,
  entityId = '',
  summary = '',
  meta,
} = {}) {
  if (!action || !entityType) return null;
  return AuditLog.create({
    actor: actorId || undefined,
    action,
    entityType,
    entityId: entityId ? String(entityId) : '',
    summary: summary || '',
    meta,
  });
}

export async function listAuditLogs({ limit = 50 } = {}) {
  const capped = Math.min(Math.max(Number(limit) || 50, 1), 100);
  const rows = await AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(capped)
    .populate('actor', 'name email role')
    .lean();

  return rows.map((row) => ({
    id: String(row._id),
    action: row.action,
    entityType: row.entityType,
    entityId: row.entityId || '',
    summary: row.summary || '',
    meta: row.meta || null,
    createdAt: row.createdAt,
    actor: row.actor
      ? {
          id: String(row.actor._id),
          name: row.actor.name,
          email: row.actor.email,
          role: row.actor.role,
        }
      : null,
  }));
}
