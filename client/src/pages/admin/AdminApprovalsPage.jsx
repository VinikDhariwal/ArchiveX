import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useGetAdminProductsQuery,
  useSetAdminProductStatusMutation,
} from '../../app/api.js';
import AdminPageShell from './AdminPageShell.jsx';

export default function AdminApprovalsPage() {
  const { data, isLoading, isError } = useGetAdminProductsQuery({ status: 'pending', limit: 100 });
  const [setStatus, { isLoading: isSaving }] = useSetAdminProductStatusMutation();
  const [actionError, setActionError] = useState(null);
  const items = data?.items || [];

  const onSetStatus = async (item, status) => {
    setActionError(null);
    try {
      await setStatus({ id: item.id, status }).unwrap();
    } catch (err) {
      setActionError(err?.data?.error?.message || `Could not update ${item.name}.`);
    }
  };

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
      {actionError ? <p className="auth-form__error" role="alert">{actionError}</p> : null}
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
              {item.submittedByUser ? (
                <p className="admin-muted">
                  Submitted by {item.submittedByUser.name || item.submittedByUser.username}
                  {item.submittedByUser.email ? ` · ${item.submittedByUser.email}` : ''}
                </p>
              ) : null}
            </div>
            <div className="admin-row-actions">
              <button
                type="button"
                className="link-cta"
                disabled={isSaving}
                onClick={() => onSetStatus(item, 'approved')}
              >
                Approve
              </button>
              <button
                type="button"
                className="quiet-action"
                disabled={isSaving}
                onClick={() => onSetStatus(item, 'rejected')}
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
