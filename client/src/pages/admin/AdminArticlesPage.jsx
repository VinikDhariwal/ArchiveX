import { useState } from 'react';
import {
  useCreateAdminArticleMutation,
  useDeleteAdminArticleMutation,
  useGetAdminArticlesQuery,
  useUpdateAdminArticleMutation,
} from '../../app/api.js';
import MuseumSelect from '../../components/ui/MuseumSelect.jsx';
import AdminPageShell from './AdminPageShell.jsx';

const empty = {
  title: '',
  slug: '',
  articleType: 'Archive Essay',
  excerpt: '',
  byline: 'ArchiveX Editorial',
  domains: 'car',
  status: 'draft',
  featured: false,
  sectionBody: '',
  heroImageUrl: '',
};

export default function AdminArticlesPage() {
  const { data: articles = [], isLoading, isError } = useGetAdminArticlesQuery();
  const [createArticle] = useCreateAdminArticleMutation();
  const [updateArticle] = useUpdateAdminArticleMutation();
  const [deleteArticle] = useDeleteAdminArticleMutation();
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  const reset = () => {
    setForm(empty);
    setEditingId(null);
    setError(null);
  };

  const startEdit = (article) => {
    setEditingId(article.id);
    setForm({
      title: article.title || '',
      slug: article.slug || '',
      articleType: article.articleType || article.type || 'Archive Essay',
      excerpt: article.excerpt || '',
      byline: article.byline || 'ArchiveX Editorial',
      domains: (article.domains || []).join(', ') || 'car',
      status: article.status || 'draft',
      featured: Boolean(article.featured),
      sectionBody: (article.sections || []).map((s) => s.body).join('\n\n') || '',
      heroImageUrl: article.image?.url || article.heroImage?.url || '',
    });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    const payload = {
      title: form.title,
      slug: form.slug || undefined,
      articleType: form.articleType,
      excerpt: form.excerpt,
      byline: form.byline,
      domains: form.domains
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean),
      status: form.status,
      featured: form.featured,
      sections: form.sectionBody.trim()
        ? [{ heading: '', body: form.sectionBody.trim() }]
        : [],
      heroImage: form.heroImageUrl
        ? { url: form.heroImageUrl, type: 'editorial', alt: form.title }
        : null,
    };
    try {
      if (editingId) await updateArticle({ id: editingId, ...payload }).unwrap();
      else await createArticle(payload).unwrap();
      reset();
    } catch (err) {
      setError(err?.data?.error?.message || 'Could not save article.');
    }
  };

  return (
    <AdminPageShell
      eyebrow="Admin · Journal"
      title="Article management"
      lede="Draft and publish archive essays. Public journal shows approved essays only."
    >
      <form className="admin-form admin-form--compact" onSubmit={onSubmit}>
        <div className="admin-form__grid">
          <label>
            <span className="meta">Title</span>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>
          <label>
            <span className="meta">Slug</span>
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </label>
          <label>
            <span className="meta">Type</span>
            <MuseumSelect
              ariaLabel="Article type"
              value={form.articleType}
              options={['Archive Essay', 'Model History', 'Design Study', 'Collector Note']}
              onChange={(articleType) => setForm({ ...form, articleType })}
            />
          </label>
          <label>
            <span className="meta">Status</span>
            <MuseumSelect
              ariaLabel="Status"
              value={form.status}
              options={['draft', 'pending', 'approved', 'rejected', 'archived']}
              onChange={(status) => setForm({ ...form, status })}
            />
          </label>
          <label>
            <span className="meta">Domains</span>
            <input
              value={form.domains}
              onChange={(e) => setForm({ ...form, domains: e.target.value })}
              placeholder="car, motorcycle"
            />
          </label>
          <label>
            <span className="meta">Hero image URL</span>
            <input
              value={form.heroImageUrl}
              onChange={(e) => setForm({ ...form, heroImageUrl: e.target.value })}
              placeholder="Upload via Media, then paste URL"
            />
          </label>
          <label>
            <span className="meta">Byline</span>
            <input value={form.byline} onChange={(e) => setForm({ ...form, byline: e.target.value })} />
          </label>
          <label className="admin-form__check">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            />
            <span>Featured</span>
          </label>
        </div>
        <label>
          <span className="meta">Excerpt</span>
          <textarea
            rows={2}
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          />
        </label>
        <label>
          <span className="meta">Body</span>
          <textarea
            rows={5}
            value={form.sectionBody}
            onChange={(e) => setForm({ ...form, sectionBody: e.target.value })}
          />
        </label>
        {error ? <p className="auth-form__error">{error}</p> : null}
        <div className="admin-row-actions">
          <button type="submit" className="btn">
            {editingId ? 'Save article' : 'Create article'}
          </button>
          {editingId ? (
            <button type="button" className="quiet-action" onClick={reset}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      {isLoading ? <p className="admin-muted">Loading articles…</p> : null}
      {isError ? <p className="auth-form__error">Could not load articles.</p> : null}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id}>
                <td>
                  {article.title}
                  <div className="admin-muted">{article.slug}</div>
                </td>
                <td>{article.articleType || article.type}</td>
                <td>
                  <span className={`admin-pill admin-pill--${article.status}`}>{article.status}</span>
                </td>
                <td className="admin-row-actions">
                  <button type="button" className="quiet-action" onClick={() => startEdit(article)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="quiet-action"
                    onClick={() => {
                      if (window.confirm(`Archive ${article.title}?`)) deleteArticle(article.id);
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
