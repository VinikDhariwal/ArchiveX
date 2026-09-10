import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useDeleteAdminProductMutation,
  useGetAdminProductsQuery,
  useSetAdminProductStatusMutation,
} from '../../app/api.js';
import MuseumSelect from '../../components/ui/MuseumSelect.jsx';
import AdminPageShell from './AdminPageShell.jsx';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'pending' },
  { value: 'approved', label: 'approved' },
  { value: 'rejected', label: 'rejected' },
  { value: 'draft', label: 'draft' },
  { value: 'archived', label: 'archived' },
];
const TYPE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'car', label: 'car' },
  { value: 'motorcycle', label: 'motorcycle' },
  { value: 'watch', label: 'watch' },
];

export default function AdminProductsPage() {
  const [status, setStatus] = useState('');
  const [productType, setProductType] = useState('');
  const [q, setQ] = useState('');
  const params = {
    ...(status ? { status } : {}),
    ...(productType ? { productType } : {}),
    ...(q.trim() ? { q: q.trim() } : {}),
    limit: 60,
  };
  const { data, isLoading, isError } = useGetAdminProductsQuery(params);
  const [setStatusMutation] = useSetAdminProductStatusMutation();
  const [deleteProduct] = useDeleteAdminProductMutation();

  return (
    <AdminPageShell
      eyebrow="Admin · Products"
      title="Product catalog"
      lede="Manage multi-domain plates. Pending submissions stay off public routes until approved."
      actions={
        <>
          <Link className="btn" to="/admin/products/new">
            New product
          </Link>
          <Link className="link-cta link-cta--muted" to="/admin/approvals">
            Approvals
          </Link>
        </>
      }
    >
      <div className="admin-toolbar">
        <label>
          <span className="meta">Search</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or slug" />
        </label>
        <label>
          <span className="meta">Status</span>
          <MuseumSelect
            ariaLabel="Status"
            value={status}
            options={STATUS_OPTIONS}
            onChange={setStatus}
          />
        </label>
        <label>
          <span className="meta">Domain</span>
          <MuseumSelect
            ariaLabel="Domain"
            value={productType}
            options={TYPE_OPTIONS}
            onChange={setProductType}
          />
        </label>
      </div>

      {isLoading ? <p className="admin-muted">Loading products…</p> : null}
      {isError ? <p className="auth-form__error">Could not load products.</p> : null}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Domain</th>
              <th>Brand</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items || []).map((item) => (
              <tr key={item.id}>
                <td>
                  <Link to={`/admin/products/${item.id}/edit`}>{item.name}</Link>
                  <div className="admin-muted">{item.slug}</div>
                </td>
                <td>{item.productType}</td>
                <td>{item.brand}</td>
                <td>
                  <span className={`admin-pill admin-pill--${item.status}`}>{item.status}</span>
                </td>
                <td className="admin-row-actions">
                  {item.status === 'pending' ? (
                    <>
                      <button
                        type="button"
                        className="quiet-action"
                        onClick={() => setStatusMutation({ id: item.id, status: 'approved' })}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="quiet-action"
                        onClick={() => setStatusMutation({ id: item.id, status: 'rejected' })}
                      >
                        Reject
                      </button>
                    </>
                  ) : null}
                  <Link className="quiet-action" to={`/admin/products/${item.id}/edit`}>
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="quiet-action"
                    onClick={() => {
                      if (window.confirm(`Archive ${item.name}?`)) deleteProduct(item.id);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && !(data?.items || []).length ? (
          <p className="admin-muted">No products match these filters.</p>
        ) : null}
      </div>
    </AdminPageShell>
  );
}
