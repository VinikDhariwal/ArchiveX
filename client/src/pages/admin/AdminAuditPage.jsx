import { useGetAdminAuditQuery } from '../../app/api.js';
import AdminPageShell from './AdminPageShell.jsx';

function formatWhen(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

export default function AdminAuditPage() {
  const { data: logs = [], isLoading, isError } = useGetAdminAuditQuery({ limit: 80 });

  return (
    <AdminPageShell
      eyebrow="Admin · Audit"
      title="Audit log"
      lede="Thin operational history for catalog, editorial, and user changes."
    >
      {isLoading ? <p className="admin-muted">Loading audit…</p> : null}
      {isError ? <p className="auth-form__error">Could not load audit log.</p> : null}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Summary</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((row) => (
              <tr key={row.id}>
                <td className="admin-muted">{formatWhen(row.createdAt)}</td>
                <td>{row.actor?.email || row.actor?.name || '—'}</td>
                <td>
                  <span className="meta">{row.action}</span>
                </td>
                <td>
                  {row.summary || '—'}
                  <div className="admin-muted">
                    {row.entityType}
                    {row.entityId ? ` · ${row.entityId}` : ''}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && !logs.length ? <p className="admin-muted">No audit events yet.</p> : null}
      </div>
    </AdminPageShell>
  );
}
