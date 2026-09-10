import { useState } from 'react';
import {
  useCreateAdminCategoryMutation,
  useDeleteAdminCategoryMutation,
  useGetAdminCategoriesQuery,
  useUpdateAdminCategoryMutation,
} from '../../app/api.js';
import MuseumSelect from '../../components/ui/MuseumSelect.jsx';
import AdminPageShell from './AdminPageShell.jsx';

const empty = {
  name: '',
  slug: '',
  productType: 'car',
  description: '',
  status: 'active',
};

export default function AdminCategoriesPage() {
  const { data: categories = [], isLoading, isError } = useGetAdminCategoriesQuery();
  const [createCategory] = useCreateAdminCategoryMutation();
  const [updateCategory] = useUpdateAdminCategoryMutation();
  const [deleteCategory] = useDeleteAdminCategoryMutation();
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  const reset = () => {
    setForm(empty);
    setEditingId(null);
    setError(null);
  };

  const startEdit = (category) => {
    setEditingId(category.id);
    setForm({
      name: category.name || '',
      slug: category.slug || '',
      productType: category.productType || 'car',
      description: category.description || '',
      status: category.status || 'active',
    });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      if (editingId) await updateCategory({ id: editingId, ...form }).unwrap();
      else await createCategory(form).unwrap();
      reset();
    } catch (err) {
      setError(err?.data?.error?.message || 'Could not save category.');
    }
  };

  return (
    <AdminPageShell
      eyebrow="Admin · Categories"
      title="Category management"
      lede="Maintain domain taxonomy for cars, motorcycles, and watches."
    >
      <form className="admin-form admin-form--compact" onSubmit={onSubmit}>
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
            <span className="meta">Domain</span>
            <MuseumSelect
              ariaLabel="Domain"
              value={form.productType}
              options={['car', 'motorcycle', 'watch']}
              onChange={(productType) => setForm({ ...form, productType })}
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
        {error ? <p className="auth-form__error">{error}</p> : null}
        <div className="admin-row-actions">
          <button type="submit" className="btn">
            {editingId ? 'Save category' : 'Create category'}
          </button>
          {editingId ? (
            <button type="button" className="quiet-action" onClick={reset}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      {isLoading ? <p className="admin-muted">Loading categories…</p> : null}
      {isError ? <p className="auth-form__error">Could not load categories.</p> : null}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Domain</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>
                  {category.name}
                  <div className="admin-muted">{category.slug}</div>
                </td>
                <td>{category.productType}</td>
                <td>
                  <span className={`admin-pill admin-pill--${category.status}`}>{category.status}</span>
                </td>
                <td className="admin-row-actions">
                  <button type="button" className="quiet-action" onClick={() => startEdit(category)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="quiet-action"
                    onClick={() => {
                      if (window.confirm(`Remove ${category.name}?`)) deleteCategory(category.id);
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
