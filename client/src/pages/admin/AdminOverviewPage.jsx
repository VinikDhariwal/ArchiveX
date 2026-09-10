import { Link } from 'react-router-dom';
import { useGetAdminOverviewQuery } from '../../app/api.js';
import AdminPageShell from './AdminPageShell.jsx';

export default function AdminOverviewPage() {
  const { data, isLoading, isError } = useGetAdminOverviewQuery();
  const pending = data?.productsPending ?? 0;
  const queueClear = !isLoading && !isError && pending === 0;

  const catalog = [
    { label: 'Products', value: data?.productsTotal ?? '—', to: '/admin/products' },
    { label: 'Brands', value: data?.brandsTotal ?? '—', to: '/admin/brands' },
    { label: 'Categories', value: data?.categoriesTotal ?? '—', to: '/admin/categories' },
    { label: 'Articles', value: data?.articlesTotal ?? '—', to: '/admin/articles' },
    { label: 'Users', value: data?.usersTotal ?? '—', to: '/admin/users' },
  ];

  return (
    <AdminPageShell
      eyebrow="Admin"
      title="Operations overview"
      lede="Curate what the public archive shows. Approvals first, then catalog and editorial."
      actions={
        <>
          <Link className="btn" to="/admin/approvals">
            Approval queue
          </Link>
          <Link className="link-cta link-cta--muted" to="/admin/products/new">
            New product
          </Link>
        </>
      }
    >
      {isLoading ? <p className="admin-muted">Loading overview…</p> : null}
      {isError ? <p className="auth-form__error">Could not load overview.</p> : null}

      {!isLoading && !isError ? (
        <>
          <section className={`admin-queue-panel ${queueClear ? 'is-clear' : 'is-waiting'}`}>
            <div className="admin-queue-panel__copy">
              <p className="meta">{queueClear ? 'Queue clear' : 'Needs review'}</p>
              <h2 className="admin-queue-panel__title">
                {queueClear ? 'No pending submissions' : `${pending} awaiting approval`}
              </h2>
              <p className="admin-queue-panel__lede">
                {queueClear
                  ? 'Public surfaces remain approved-only. New contributor plates will land here first.'
                  : 'Review pending plates before they appear on Discover, brands, or search.'}
              </p>
            </div>
            <div className="admin-queue-panel__actions">
              <Link className="link-cta" to="/admin/approvals">
                Open queue
              </Link>
              {!queueClear ? (
                <Link className="link-cta link-cta--muted" to="/admin/products">
                  Browse catalog
                </Link>
              ) : (
                <Link className="link-cta link-cta--muted" to="/admin/products/new">
                  Add a plate
                </Link>
              )}
            </div>
          </section>

          <section className="admin-overview-section">
            <header className="admin-overview-section__head">
              <p className="meta">Catalog</p>
              <p className="admin-muted">Live counts across the archive control room.</p>
            </header>
            <ul className="admin-metric-row">
              {catalog.map((item) => (
                <li key={item.label}>
                  <Link className="admin-metric" to={item.to}>
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="admin-overview-section">
            <header className="admin-overview-section__head">
              <p className="meta">Shortcuts</p>
            </header>
            <ul className="admin-shortcut-list">
              <li>
                <Link to="/admin/articles">
                  <span className="admin-shortcut-list__label">Journal</span>
                  <span className="admin-muted">
                    {data?.articlesDraft ?? 0} draft{(data?.articlesDraft ?? 0) === 1 ? '' : 's'}
                  </span>
                </Link>
              </li>
              <li>
                <Link to="/admin/audit">
                  <span className="admin-shortcut-list__label">Audit log</span>
                  <span className="admin-muted">Recent operator actions</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/users">
                  <span className="admin-shortcut-list__label">Users</span>
                  <span className="admin-muted">Create accounts & roles</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/analytics">
                  <span className="admin-shortcut-list__label">Analytics</span>
                  <span className="admin-muted">Phase 15</span>
                </Link>
              </li>
            </ul>
          </section>
        </>
      ) : null}
    </AdminPageShell>
  );
}
