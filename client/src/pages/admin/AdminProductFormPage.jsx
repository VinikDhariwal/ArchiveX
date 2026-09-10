import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  useCreateAdminProductMutation,
  useGetAdminBrandsQuery,
  useGetAdminCategoriesQuery,
  useGetAdminProductQuery,
  useUpdateAdminProductMutation,
} from '../../app/api.js';
import MuseumSelect from '../../components/ui/MuseumSelect.jsx';
import AdminImageList from '../../components/admin/AdminImageList.jsx';
import AdminPageShell from './AdminPageShell.jsx';

const emptyForm = {
  name: '',
  slug: '',
  productType: 'car',
  brand: '',
  category: '',
  reference: '',
  shortDescription: '',
  description: '',
  whyItMatters: '',
  releaseYear: '',
  productionPeriod: '',
  rarity: 'COLLECTIBLE',
  availability: 'unknown',
  status: 'draft',
  featured: false,
  images: [],
};

export default function AdminProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: existing, isLoading: loadingExisting } = useGetAdminProductQuery(id, {
    skip: !isEdit,
  });
  const { data: brands = [] } = useGetAdminBrandsQuery();
  const { data: categories = [] } = useGetAdminCategoriesQuery();
  const [createProduct, createState] = useCreateAdminProductMutation();
  const [updateProduct, updateState] = useUpdateAdminProductMutation();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!existing) return;
    setForm({
      name: existing.name || '',
      slug: existing.slug || '',
      productType: existing.productType || 'car',
      brand: existing.brandSlug || existing.brandId || '',
      category: existing.category?.slug || existing.category?.id || '',
      reference: existing.reference || '',
      shortDescription: existing.shortDescription || '',
      description: existing.description || '',
      whyItMatters: existing.whyItMatters || '',
      releaseYear: existing.year ?? '',
      productionPeriod: existing.productionPeriod || '',
      rarity: existing.rarity || 'COLLECTIBLE',
      availability: existing.availability || 'unknown',
      status: existing.status || 'draft',
      featured: Boolean(existing.featured),
      images: Array.isArray(existing.images)
        ? existing.images.map((image, index) => ({
            url: image.url || '',
            alt: image.alt || '',
            type: image.type || 'gallery',
            sortOrder: image.sortOrder ?? index,
          }))
        : [],
    });
  }, [existing]);

  const setField = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    const payload = {
      ...form,
      releaseYear: form.releaseYear === '' ? undefined : Number(form.releaseYear),
      category: form.category || undefined,
    };
    try {
      if (isEdit) {
        await updateProduct({ id, ...payload }).unwrap();
        navigate('/admin/products');
      } else {
        const created = await createProduct(payload).unwrap();
        navigate(`/admin/products/${created.id}/edit`);
      }
    } catch (err) {
      setError(err?.data?.error?.message || 'Could not save product.');
    }
  };

  const saving = createState.isLoading || updateState.isLoading;
  const typeCategories = categories.filter((row) => row.productType === form.productType);

  return (
    <AdminPageShell
      eyebrow="Admin · Products"
      title={isEdit ? 'Edit product' : 'New product'}
      lede="Domain-aware catalog form with media plates for the public archive."
      actions={
        <>
          <Link className="link-cta link-cta--muted" to="/admin/media">
            Media library
          </Link>
          <Link className="link-cta link-cta--muted" to="/admin/products">
            Back to list
          </Link>
        </>
      }
    >
      {isEdit && loadingExisting ? <p className="admin-muted">Loading product…</p> : null}
      <form className="admin-form" onSubmit={onSubmit}>
        <div className="admin-form__grid">
          <label>
            <span className="meta">Name</span>
            <input required value={form.name} onChange={setField('name')} />
          </label>
          <label>
            <span className="meta">Slug</span>
            <input value={form.slug} onChange={setField('slug')} placeholder="auto from name" />
          </label>
          <label>
            <span className="meta">Domain</span>
            <MuseumSelect
              ariaLabel="Domain"
              value={form.productType}
              options={[
                { value: 'car', label: 'Car' },
                { value: 'motorcycle', label: 'Motorcycle' },
                { value: 'watch', label: 'Watch' },
              ]}
              onChange={(productType) => setForm((prev) => ({ ...prev, productType }))}
            />
          </label>
          <label>
            <span className="meta">Brand</span>
            <MuseumSelect
              ariaLabel="Brand"
              value={form.brand}
              placeholder="Select brand"
              options={[
                { value: '', label: 'Select brand' },
                ...brands.map((brand) => ({ value: brand.slug, label: brand.name })),
              ]}
              onChange={(brand) => setForm((prev) => ({ ...prev, brand }))}
            />
          </label>
          <label>
            <span className="meta">Category</span>
            <MuseumSelect
              ariaLabel="Category"
              value={form.category}
              placeholder="None"
              options={[
                { value: '', label: 'None' },
                ...typeCategories.map((category) => ({
                  value: category.slug,
                  label: category.name,
                })),
              ]}
              onChange={(category) => setForm((prev) => ({ ...prev, category }))}
            />
          </label>
          <label>
            <span className="meta">Reference</span>
            <input value={form.reference} onChange={setField('reference')} />
          </label>
          <label>
            <span className="meta">Release year</span>
            <input
              type="number"
              value={form.releaseYear}
              onChange={setField('releaseYear')}
              min="1880"
              max="2100"
            />
          </label>
          <label>
            <span className="meta">Production period</span>
            <input value={form.productionPeriod} onChange={setField('productionPeriod')} />
          </label>
          <label>
            <span className="meta">Rarity</span>
            <MuseumSelect
              ariaLabel="Rarity"
              value={form.rarity}
              options={['COMMON', 'COLLECTIBLE', 'RARE', 'ICONIC', 'ULTRA-RARE', 'UNIQUE']}
              onChange={(rarity) => setForm((prev) => ({ ...prev, rarity }))}
            />
          </label>
          <label>
            <span className="meta">Availability</span>
            <MuseumSelect
              ariaLabel="Availability"
              value={form.availability}
              options={['unknown', 'museum', 'private', 'auction', 'production', 'discontinued']}
              onChange={(availability) => setForm((prev) => ({ ...prev, availability }))}
            />
          </label>
          <label>
            <span className="meta">Status</span>
            <MuseumSelect
              ariaLabel="Status"
              value={form.status}
              options={['draft', 'pending', 'approved', 'rejected', 'archived']}
              onChange={(status) => setForm((prev) => ({ ...prev, status }))}
            />
          </label>
          <label className="admin-form__check">
            <input type="checkbox" checked={form.featured} onChange={setField('featured')} />
            <span>Featured</span>
          </label>
        </div>

        <label>
          <span className="meta">Short description</span>
          <textarea rows={2} value={form.shortDescription} onChange={setField('shortDescription')} />
        </label>
        <label>
          <span className="meta">Description</span>
          <textarea rows={4} value={form.description} onChange={setField('description')} />
        </label>
        <label>
          <span className="meta">Why it matters</span>
          <textarea rows={3} value={form.whyItMatters} onChange={setField('whyItMatters')} />
        </label>

        <div>
          <p className="meta">Images</p>
          <AdminImageList
            images={form.images}
            onChange={(images) => setForm((prev) => ({ ...prev, images }))}
          />
        </div>

        {error ? <p className="auth-form__error">{error}</p> : null}
        <button type="submit" className="btn" disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
        </button>
      </form>
    </AdminPageShell>
  );
}
