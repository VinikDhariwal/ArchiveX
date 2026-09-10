import { Link } from 'react-router-dom';
import { useGetAdminAnalyticsQuery } from '../../app/api.js';
import AdminPageShell from './AdminPageShell.jsx';

function RankTable({ rows, emptyLabel }) {
  if (!rows?.length) {
    return <p className="admin-muted">{emptyLabel}</p>;
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Plate</th>
            <th>Domain</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.productId}>
              <td>
                {row.slug ? (
                  <Link to={`/products/${row.slug}`}>{row.name}</Link>
                ) : (
                  row.name
                )}
              </td>
              <td className="admin-muted">{row.productType || '—'}</td>
              <td>
                <strong>{row.count}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const { data, isLoading, isError, refetch } = useGetAdminAnalyticsQuery();

  const viewMetrics = [
    { label: 'Views (all time)', value: data?.views?.total ?? '—' },
    { label: 'Last 7 days', value: data?.views?.last7Days ?? '—' },
    { label: 'Last 30 days', value: data?.views?.last30Days ?? '—' },
    { label: 'Favorites', value: data?.favorites?.total ?? '—' },
    { label: 'Collections', value: data?.collections?.total ?? '—' },
  ];

  const healthMetrics = [
    {
      label: 'Approved products',
      value: data?.catalog?.productsApproved ?? '—',
      to: '/admin/products',
    },
    {
      label: 'Pending review',
      value: data?.catalog?.productsPending ?? '—',
      to: '/admin/approvals',
    },
    {
      label: 'Objects in collections',
      value: data?.collections?.objectsSaved ?? '—',
      to: '/admin/products',
    },
  ];

  return (
    <AdminPageShell
      eyebrow="Admin · Analytics"
      title="Archive signals"
      lede="Basic views, favorites, and catalog health from live Atlas events — informational only."
      actions={
        <button type="button" className="btn btn--ghost" onClick={() => refetch()}>
          Refresh
        </button>
      }
    >
      {isLoading ? <p className="admin-muted">Loading analytics…</p> : null}
      {isError ? <p className="auth-form__error">Could not load analytics.</p> : null}

      {!isLoading && !isError && data ? (
        <>
          <section className="admin-overview-section">
            <header className="admin-overview-section__head">
              <p className="meta">Attention</p>
              <p className="admin-muted">
                Generated {new Date(data.generatedAt).toLocaleString()}
              </p>
            </header>
            <ul className="admin-metric-row">
              {viewMetrics.map((item) => (
                <li key={item.label}>
                  <div className="admin-metric">
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="admin-overview-section">
            <header className="admin-overview-section__head">
              <p className="meta">Catalog health</p>
            </header>
            <ul className="admin-metric-row admin-metric-row--three">
              {healthMetrics.map((item) => (
                <li key={item.label}>
                  <Link className="admin-metric" to={item.to}>
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {data.views?.bySource?.length ? (
            <section className="admin-overview-section">
              <header className="admin-overview-section__head">
                <p className="meta">View sources</p>
              </header>
              <ul className="admin-shortcut-list">
                {data.views.bySource.map((row) => (
                  <li key={row.source}>
                    <div className="admin-shortcut-static">
                      <span className="admin-shortcut-list__label">{row.source}</span>
                      <span className="admin-muted">{row.count} views</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="admin-overview-section">
            <header className="admin-overview-section__head">
              <p className="meta">Most viewed plates</p>
            </header>
            <RankTable rows={data.views?.topProducts} emptyLabel="No product views recorded yet." />
          </section>

          <section className="admin-overview-section">
            <header className="admin-overview-section__head">
              <p className="meta">Most favorited plates</p>
            </header>
            <RankTable
              rows={data.favorites?.topProducts}
              emptyLabel="No favorites recorded yet."
            />
          </section>

          <p className="admin-muted admin-analytics__disclaimer">{data.disclaimer}</p>
        </>
      ) : null}
    </AdminPageShell>
  );
}
