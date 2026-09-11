import { useState } from 'react';
import {
  useCreateAdminBrandMutation,
  useDeleteAdminBrandMutation,
  useGetAdminBrandsQuery,
  useUpdateAdminBrandMutation,
} from '../../app/api.js';
import AdminLogoDropzone from '../../components/admin/AdminLogoDropzone.jsx';
import MuseumSelect from '../../components/ui/MuseumSelect.jsx';
import AdminPageShell from './AdminPageShell.jsx';

const empty = {
  name: '',
  slug: '',
  country: '',
  foundedYear: '',
  description: '',
  primaryDomains: 'car',
  status: 'active',
  logoUrl: '',
};

export default function AdminBrandsPage() {
  const { data: brands = [], isLoading, isError } = useGetAdminBrandsQuery();
  const [createBrand, { isLoading: creating }] = useCreateAdminBrandMutation();
  const [updateBrand, { isLoading: updating }] = useUpdateAdminBrandMutation();
  const [deleteBrand] = useDeleteAdminBrandMutation();
  const saving = creating || updating;
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  const reset = () => {
    setForm(empty);
    setEditingId(null);
    setError(null);
  };

  const startEdit = (brand) => {
    setEditingId(brand.id);
    setForm({
      name: brand.name || '',
      slug: brand.slug || '',
      country: brand.country || '',
      foundedYear: brand.foundedYear ?? '',
      description: brand.description || '',
      primaryDomains: (brand.primaryDomains || []).join(', ') || 'car',
      status: brand.status || 'active',
      logoUrl: brand.logo?.url || '',
    });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    const payload = {
      name: form.name,
      slug: form.slug || undefined,
      country: form.country,
      foundedYear: form.foundedYear === '' ? undefined : Number(form.foundedYear),
      description: form.description,
      primaryDomains: form.primaryDomains
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean),
      status: form.status,
      logo: form.logoUrl ? { url: form.logoUrl, type: 'other' } : null,
    };
    try {
      if (editingId) await updateBrand({ id: editingId, ...payload }).unwrap();
      else await createBrand(payload).unwrap();
      reset();
    } catch (err) {
      setError(err?.data?.error?.message || 'Could not save brand.');
    }
  };

  return (
    <AdminPageShell
      eyebrow="Admin · Brands"
      title="Brand management"
      lede="Create and edit houses in the archive directory."
    >
      <form className="admin-form admin-form--brand" onSubmit={onSubmit}>
        <div className="admin-form__brand-layout">
          <div className="admin-form__brand-fields">
            <div className="admin-form__grid">
              <label>
                <span className="meta">Name</span>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </label>
              <label>
                <span className="meta">Slug</span>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </label>
              <label>
                <span className="meta">Country</span>
                <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              </label>
              <label>
                <span className="meta">Founded</span>
                <input
                  type="number"
                  value={form.foundedYear}
                  onChange={(e) => setForm({ ...form, foundedYear: e.target.value })}
                />
              </label>
              <label>
                <span className="meta">Domains</span>
                <input
                  value={form.primaryDomains}
                  onChange={(e) => setForm({ ...form, primaryDomains: e.target.value })}
                  placeholder="car, motorcycle"
                />
              </label>
              <label>
                <span className="meta">Logo URL</span>
                <input
                  value={form.logoUrl}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                  placeholder="Or paste a URL"
                />
              </label>
              <label>
                <span className="meta">Status</span>
                <MuseumSelect
                  ariaLabel="Status"
                  value={form.status}
                  options={['active', 'inactive']}
                  onChange={(status) => setForm({ ...form, status })}
                />
              </label>
            </div>
            <label>
              <span className="meta">Description</span>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
          </div>

          <AdminLogoDropzone
            url={form.logoUrl}
            alt={form.name ? `${form.name} logo` : 'Brand logo'}
            disabled={saving}
            onUrlChange={(logoUrl) => setForm((prev) => ({ ...prev, logoUrl }))}
            onError={setError}
          />
        </div>

        {error ? <p className="auth-form__error">{error}</p> : null}
        <div className="admin-row-actions">
          <button type="submit" className="btn" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Save brand' : 'Create brand'}
          </button>
          {editingId ? (
            <button type="button" className="quiet-action" onClick={reset}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      {isLoading ? <p className="admin-muted">Loading brands…</p> : null}
      {isError ? <p className="auth-form__error">Could not load brands.</p> : null}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Country</th>
              <th>Domains</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {brands.map((brand) => (
              <tr key={brand.id}>
                <td>
                  {brand.name}
                  <div className="admin-muted">{brand.slug}</div>
                </td>
                <td>{brand.country || '—'}</td>
                <td>{(brand.primaryDomains || []).join(', ')}</td>
                <td>
                  <span className={`admin-pill admin-pill--${brand.status}`}>{brand.status}</span>
                </td>
                <td className="admin-row-actions">
                  <button type="button" className="quiet-action" onClick={() => startEdit(brand)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="quiet-action"
                    onClick={async () => {
                      if (!window.confirm(`Remove ${brand.name}?`)) return;
                      setError(null);
                      try {
                        await deleteBrand(brand.id).unwrap();
                      } catch (err) {
                        setError(err?.data?.error?.message || `Could not delete ${brand.name}.`);
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminPageShell>
  );
}
