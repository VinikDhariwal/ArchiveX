import { Link } from 'react-router-dom';
import {
  useGetAdminProductsQuery,
  useSetAdminProductStatusMutation,
} from '../../app/api.js';
import AdminPageShell from './AdminPageShell.jsx';

export default function AdminApprovalsPage() {
  const { data, isLoading, isError } = useGetAdminProductsQuery({ status: 'pending', limit: 100 });
  const [setStatus, { isLoading: isSaving }] = useSetAdminProductStatusMutation();
  const items = data?.items || [];

  return (
    <AdminPageShell
      eyebrow="Admin · Approvals"
      title="Approval queue"
      lede="Contributor and draft submissions wait here. Nothing appears publicly until approved."
      actions={
        <Link className="link-cta link-cta--muted" to="/admin/products">
          All products
        </Link>
      }
    >
      {isLoading ? <p className="admin-muted">Loading queue…</p> : null}
      {isError ? <p className="auth-form__error">Could not load approvals.</p> : null}
      {!isLoading && !items.length ? (
        <p className="admin-muted">Queue is clear — no pending products.</p>
      ) : null}

      <ul className="admin-queue">
        {items.map((item) => (
          <li key={item.id} className="admin-queue__item">
            <div>
              <p className="meta">
                {item.productType} · {item.brand}
              </p>
              <h2 className="admin-queue__title">{item.name}</h2>
              <p className="admin-muted">{item.shortDescription || item.slug}</p>
            </div>
            <div className="admin-row-actions">
              <button
                type="button"
                className="link-cta"
                disabled={isSaving}
                onClick={() => setStatus({ id: item.id, status: 'approved' })}
              >
                Approve
              </button>
              <button
                type="button"
                className="quiet-action"
                disabled={isSaving}
                onClick={() => setStatus({ id: item.id, status: 'rejected' })}
              >
                Reject
              </button>
              <Link className="quiet-action" to={`/admin/products/${item.id}/edit`}>
                Review
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </AdminPageShell>
  );
}
