import { useEffect, useMemo, useState } from 'react';
import MuseumSelect from '../ui/MuseumSelect.jsx';
import ContributeImageList from './ContributeImageList.jsx';
import { formatProductType } from '../../utils/formatProductType.js';
import { useGetBrandsQuery, useGetCategoriesQuery } from '../../app/api.js';

const DOMAIN_OPTIONS = [
  { value: 'car', label: 'Car' },
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'watch', label: 'Watch' },
];

const emptyForm = {
  name: '',
  productType: 'car',
  brandSlug: '',
  categorySlug: '',
  reference: '',
  releaseYear: '',
  shortDescription: '',
  description: '',
  whyItMatters: '',
  images: [],
  specEngine: '',
  specBodyStyle: '',
};

function formFromProduct(product) {
  if (!product) return emptyForm;
  const fields = product.specifications?.fields || product.specifications || {};
  return {
    name: product.name || '',
    productType: product.productType || 'car',
    brandSlug: product.brandSlug || '',
    categorySlug: product.category?.slug || '',
    reference: product.reference || '',
    releaseYear: product.year ?? '',
    shortDescription: product.shortDescription || '',
    description: product.description || '',
    whyItMatters: product.whyItMatters || '',
    images: Array.isArray(product.images)
      ? product.images.map((image, index) => ({
          url: image.url || '',
          alt: image.alt || '',
          type: image.type || 'gallery',
          sortOrder: image.sortOrder ?? index,
        }))
      : [],
    specEngine: fields.engine || '',
    specBodyStyle: fields.bodyStyle || '',
  };
}

function buildPayload(form) {
  const images = (form.images || [])
    .map((image, index) => ({
      url: String(image.url || '').trim(),
      alt: String(image.alt || '').trim(),
      type: image.type || (index === 0 ? 'hero' : 'gallery'),
      sortOrder: index,
    }))
    .filter((image) => image.url);

  const payload = {
    name: form.name.trim(),
    productType: form.productType,
    brandSlug: form.brandSlug,
    shortDescription: form.shortDescription.trim(),
    description: form.description.trim(),
    whyItMatters: form.whyItMatters.trim(),
    reference: form.reference.trim(),
    images,
  };

  if (form.categorySlug) payload.categorySlug = form.categorySlug;
  if (form.releaseYear !== '' && form.releaseYear != null) {
    payload.releaseYear = Number(form.releaseYear);
  }

  const fields = {};
  if (form.specEngine.trim()) fields.engine = form.specEngine.trim();
  if (form.specBodyStyle.trim()) fields.bodyStyle = form.specBodyStyle.trim();
  if (Object.keys(fields).length) {
    payload.specifications = { fields };
  }

  return payload;
}

/** Shared create/edit form for collector product submissions. */
export default function ContributionForm({
  initialProduct = null,
  submitLabel = 'Submit for review',
  onSubmit,
  isSaving = false,
}) {
  const [form, setForm] = useState(() => formFromProduct(initialProduct));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialProduct) setForm(formFromProduct(initialProduct));
  }, [initialProduct]);

  const { data: brands = [], isLoading: brandsLoading } = useGetBrandsQuery({
    domain: form.productType,
  });
  const { data: categories = [] } = useGetCategoriesQuery({ productType: form.productType });

  const brandOptions = useMemo(
    () => [
      { value: '', label: brandsLoading ? 'Loading brands…' : 'Select brand' },
      ...brands.map((brand) => ({ value: brand.slug, label: brand.name })),
    ],
    [brands, brandsLoading]
  );

  const categoryOptions = useMemo(
    () => [
      { value: '', label: 'None' },
      ...categories.map((category) => ({ value: category.slug, label: category.name })),
    ],
    [categories]
  );

  const setField = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    if (!form.brandSlug) {
      setError('Choose an active brand for this object.');
      return;
    }
    if (form.shortDescription.trim().length < 8) {
      setError('Short description needs at least a sentence (8+ characters).');
      return;
    }
    try {
      await onSubmit(buildPayload(form));
    } catch (err) {
      setError(err?.data?.error?.message || 'Could not save submission.');
    }
  };

  return (
    <form className="contribute-form account-settings__form" onSubmit={handleSubmit}>
      {error ? (
        <p className="auth-form__error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="contribute-form__grid">
        <label>
          <span className="meta">Domain</span>
          <MuseumSelect
            ariaLabel="Domain"
            value={form.productType}
            options={DOMAIN_OPTIONS}
            onChange={(productType) =>
              setForm((prev) => ({
                ...prev,
                productType,
                brandSlug: '',
                categorySlug: '',
              }))
            }
          />
        </label>

        <label>
          <span className="meta">Brand</span>
          <MuseumSelect
            ariaLabel="Brand"
            value={form.brandSlug}
            placeholder="Select brand"
            options={brandOptions}
            onChange={(brandSlug) => setForm((prev) => ({ ...prev, brandSlug }))}
          />
        </label>

        <label>
          <span className="meta">Category (optional)</span>
          <MuseumSelect
            ariaLabel="Category"
            value={form.categorySlug}
            placeholder="None"
            options={categoryOptions}
            onChange={(categorySlug) => setForm((prev) => ({ ...prev, categorySlug }))}
          />
        </label>

        <label>
          <span className="meta">Name</span>
          <input required value={form.name} onChange={setField('name')} />
        </label>

        <label>
          <span className="meta">Reference</span>
          <input value={form.reference} onChange={setField('reference')} />
        </label>

        <label>
          <span className="meta">Release year</span>
          <input
            type="number"
            inputMode="numeric"
            value={form.releaseYear}
            onChange={setField('releaseYear')}
            placeholder="e.g. 1987"
          />
        </label>
      </div>

      <label>
        <span className="meta">Short description</span>
        <textarea
          required
          rows={3}
          value={form.shortDescription}
          onChange={setField('shortDescription')}
          placeholder={`One clear line about this ${formatProductType(form.productType, { singular: true }).toLowerCase() || 'object'}.`}
        />
      </label>

      <label>
        <span className="meta">Longer description</span>
        <textarea rows={5} value={form.description} onChange={setField('description')} />
      </label>

      <label>
        <span className="meta">Why it matters</span>
        <textarea rows={3} value={form.whyItMatters} onChange={setField('whyItMatters')} />
      </label>

      <fieldset className="contribute-form__fieldset">
        <legend className="meta">Optional specs</legend>
        <div className="contribute-form__grid">
          <label>
            <span className="meta">Engine</span>
            <input value={form.specEngine} onChange={setField('specEngine')} />
          </label>
          <label>
            <span className="meta">Body style</span>
            <input value={form.specBodyStyle} onChange={setField('specBodyStyle')} />
          </label>
        </div>
      </fieldset>

      <fieldset className="contribute-form__fieldset">
        <legend className="meta">Images (http/https URLs)</legend>
        <ContributeImageList
          images={form.images}
          onChange={(images) => setForm((prev) => ({ ...prev, images }))}
        />
      </fieldset>

      <p className="account-settings__note">
        Submissions stay pending until staff approve them. They never appear on public archive
        routes before approval.
      </p>

      <button type="submit" className="btn" disabled={isSaving}>
        {isSaving ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
