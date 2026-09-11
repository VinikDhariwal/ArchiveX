import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useGetAdminArticlesQuery,
  useGetAdminHomeQuery,
  useGetAdminProductsQuery,
  useUpdateAdminHomeMutation,
} from '../../app/api.js';
import MuseumSelect from '../../components/ui/MuseumSelect.jsx';
import AdminPageShell from './AdminPageShell.jsx';

function SectionCard({ id, title, enabled, onToggle, children }) {
  return (
    <section className="admin-home-section" id={id}>
      <header className="admin-home-section__head">
        <h2>{title}</h2>
        <label className="admin-home-section__toggle">
          <input type="checkbox" checked={Boolean(enabled)} onChange={onToggle} />
          <span>Visible on home</span>
        </label>
      </header>
      <div className="admin-home-section__body">{children}</div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="admin-home-field">
      <span className="meta">{label}</span>
      {children}
    </label>
  );
}

export default function AdminHomePage() {
  const { data, isLoading, isError, refetch } = useGetAdminHomeQuery();
  const { data: productsResult } = useGetAdminProductsQuery({ limit: 100, status: 'approved' });
  const { data: articles = [] } = useGetAdminArticlesQuery();
  const [updateHome, { isLoading: saving }] = useUpdateAdminHomeMutation();

  const [form, setForm] = useState(null);
  const [error, setError] = useState(null);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    if (data) setForm(structuredClone(data));
  }, [data]);

  const products = productsResult?.items || [];
  const productOptions = useMemo(
    () => [
      { value: '', label: 'Auto (featured / fallback)' },
      ...products.map((product) => ({
        value: product.id,
        label: `${product.name} · ${product.productType}${product.featured ? ' · featured' : ''}`,
      })),
    ],
    [products]
  );

  const articleOptions = useMemo(
    () => [
      { value: '', label: 'Latest approved article' },
      ...articles
        .filter((article) => article.status === 'approved' || !article.status)
        .map((article) => ({
          value: article.id,
          label: article.title,
        })),
    ],
    [articles]
  );

  const patchSection = (key, patch) => {
    setForm((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...patch },
    }));
  };

  const setHeroPlateId = (index, productId) => {
    setForm((prev) => {
      const ids = [...(prev.hero.plateProductIds || [])];
      while (ids.length < 5) ids.push('');
      ids[index] = productId;
      return {
        ...prev,
        hero: {
          ...prev.hero,
          plateProductIds: ids.filter((id, i) => id || i < index + 1).slice(0, 5),
        },
      };
    });
  };

  const onSave = async (event) => {
    event.preventDefault();
    if (!form) return;
    setError(null);
    try {
      const payload = {
        hero: {
          ...form.hero,
          plateProductIds: (form.hero.plateProductIds || []).filter(Boolean).slice(0, 5),
        },
        brands: form.brands,
        promise: form.promise,
        domains: form.domains,
        signatures: form.signatures,
        featured: form.featured,
        editorial: form.editorial,
        close: form.close,
      };
      const next = await updateHome(payload).unwrap();
      setForm(structuredClone(next));
      setSavedAt(new Date());
    } catch (err) {
      setError(err?.data?.error?.message || 'Could not save home configuration.');
    }
  };

  if (isLoading || !form) {
    return (
      <AdminPageShell eyebrow="Admin · Home" title="Home page" lede="Loading configuration…">
        <p className="meta">Fetching home CMS…</p>
      </AdminPageShell>
    );
  }

  if (isError) {
    return (
      <AdminPageShell eyebrow="Admin · Home" title="Home page" lede="Could not load home config.">
        <button type="button" className="btn" onClick={() => refetch()}>
          Retry
        </button>
      </AdminPageShell>
    );
  }

  const plateIds = [...(form.hero.plateProductIds || [])];
  while (plateIds.length < 5) plateIds.push('');

  return (
    <AdminPageShell
      eyebrow="Admin · Home"
      title="Home page"
      lede="Edit every home section — copy, CTAs, images, and which archive objects appear. Section order stays fixed."
      actions={
        <Link className="btn btn--soft" to="/" target="_blank" rel="noreferrer">
          View live home
        </Link>
      }
    >
      <form className="admin-form admin-home-form" onSubmit={onSave}>
        <nav className="admin-home-nav" aria-label="Home sections">
          {[
            ['hero', 'Hero'],
            ['brands', 'Brands'],
            ['promise', 'Promise'],
            ['domains', 'Domains'],
            ['signatures', 'Signatures'],
            ['featured', 'Featured'],
            ['editorial', 'Editorial'],
            ['close', 'Close'],
          ].map(([id, label]) => (
            <a key={id} href={`#home-${id}`}>
              {label}
            </a>
          ))}
        </nav>

        <SectionCard
          id="home-hero"
          title="Hero"
          enabled={form.hero.enabled}
          onToggle={(e) => patchSection('hero', { enabled: e.target.checked })}
        >
          <div className="admin-form__grid">
            <Field label="Brand mark">
              <input
                value={form.hero.brand || ''}
                onChange={(e) => patchSection('hero', { brand: e.target.value })}
              />
            </Field>
            <Field label="Headline line 1">
              <input
                value={form.hero.headlineLine1 || ''}
                onChange={(e) => patchSection('hero', { headlineLine1: e.target.value })}
              />
            </Field>
            <Field label="Headline line 2">
              <input
                value={form.hero.headlineLine2 || ''}
                onChange={(e) => patchSection('hero', { headlineLine2: e.target.value })}
              />
            </Field>
            <Field label="Primary CTA label">
              <input
                value={form.hero.primaryCta?.label || ''}
                onChange={(e) =>
                  patchSection('hero', {
                    primaryCta: { ...form.hero.primaryCta, label: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Primary CTA href">
              <input
                value={form.hero.primaryCta?.href || ''}
                onChange={(e) =>
                  patchSection('hero', {
                    primaryCta: { ...form.hero.primaryCta, href: e.target.value },
                  })
                }
              />
            </Field>
          </div>
          <Field label="Lede">
            <textarea
              rows={3}
              value={form.hero.lede || ''}
              onChange={(e) => patchSection('hero', { lede: e.target.value })}
            />
          </Field>
          <p className="meta" style={{ marginTop: '1rem' }}>
            Hero plates (up to 5). Leave empty to auto-pick featured cars & motorcycles.
          </p>
          <div className="admin-form__grid">
            {plateIds.map((id, index) => (
              <Field key={`plate-${index}`} label={`Plate ${index + 1}`}>
                <MuseumSelect
                  ariaLabel={`Hero plate ${index + 1}`}
                  value={id}
                  options={productOptions}
                  onChange={(value) => setHeroPlateId(index, value)}
                />
              </Field>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          id="home-brands"
          title="Brands ribbon"
          enabled={form.brands.enabled}
          onToggle={(e) => patchSection('brands', { enabled: e.target.checked })}
        >
          <div className="admin-form__grid">
            <Field label="Label">
              <input
                value={form.brands.label || ''}
                onChange={(e) => patchSection('brands', { label: e.target.value })}
              />
            </Field>
            <Field label="CTA label">
              <input
                value={form.brands.ctaLabel || ''}
                onChange={(e) => patchSection('brands', { ctaLabel: e.target.value })}
              />
            </Field>
            <Field label="CTA href">
              <input
                value={form.brands.ctaHref || ''}
                onChange={(e) => patchSection('brands', { ctaHref: e.target.value })}
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard
          id="home-promise"
          title="Archive promise"
          enabled={form.promise.enabled}
          onToggle={(e) => patchSection('promise', { enabled: e.target.checked })}
        >
          <div className="admin-form__grid">
            <Field label="Eyebrow">
              <input
                value={form.promise.eyebrow || ''}
                onChange={(e) => patchSection('promise', { eyebrow: e.target.value })}
              />
            </Field>
            <Field label="Title">
              <input
                value={form.promise.title || ''}
                onChange={(e) => patchSection('promise', { title: e.target.value })}
              />
            </Field>
            <Field label="Quote credit">
              <input
                value={form.promise.quoteCredit || ''}
                onChange={(e) => patchSection('promise', { quoteCredit: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Body">
            <textarea
              rows={4}
              value={form.promise.body || ''}
              onChange={(e) => patchSection('promise', { body: e.target.value })}
            />
          </Field>
          <Field label="Quote">
            <textarea
              rows={3}
              value={form.promise.quote || ''}
              onChange={(e) => patchSection('promise', { quote: e.target.value })}
            />
          </Field>
        </SectionCard>

        <SectionCard
          id="home-domains"
          title="Domain chambers"
          enabled={form.domains.enabled}
          onToggle={(e) => patchSection('domains', { enabled: e.target.checked })}
        >
          <div className="admin-form__grid">
            <Field label="Meta">
              <input
                value={form.domains.meta || ''}
                onChange={(e) => patchSection('domains', { meta: e.target.value })}
              />
            </Field>
            <Field label="Title">
              <input
                value={form.domains.title || ''}
                onChange={(e) => patchSection('domains', { title: e.target.value })}
              />
            </Field>
            <Field label="Feed CTA label">
              <input
                value={form.domains.feedCtaLabel || ''}
                onChange={(e) => patchSection('domains', { feedCtaLabel: e.target.value })}
              />
            </Field>
            <Field label="Feed CTA href">
              <input
                value={form.domains.feedCtaHref || ''}
                onChange={(e) => patchSection('domains', { feedCtaHref: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Lede">
            <textarea
              rows={2}
              value={form.domains.lede || ''}
              onChange={(e) => patchSection('domains', { lede: e.target.value })}
            />
          </Field>
          {(form.domains.chambers || []).map((chamber, index) => (
            <div key={chamber.id} className="admin-home-chamber">
              <h3>{chamber.label || chamber.id}</h3>
              <div className="admin-form__grid">
                <Field label="Label">
                  <input
                    value={chamber.label || ''}
                    onChange={(e) => {
                      const chambers = [...form.domains.chambers];
                      chambers[index] = { ...chamber, label: e.target.value };
                      patchSection('domains', { chambers });
                    }}
                  />
                </Field>
                <Field label="Title">
                  <input
                    value={chamber.title || ''}
                    onChange={(e) => {
                      const chambers = [...form.domains.chambers];
                      chambers[index] = { ...chamber, title: e.target.value };
                      patchSection('domains', { chambers });
                    }}
                  />
                </Field>
                <Field label="Href">
                  <input
                    value={chamber.href || ''}
                    onChange={(e) => {
                      const chambers = [...form.domains.chambers];
                      chambers[index] = { ...chamber, href: e.target.value };
                      patchSection('domains', { chambers });
                    }}
                  />
                </Field>
                <Field label="Image from product">
                  <MuseumSelect
                    ariaLabel={`${chamber.id} image product`}
                    value={chamber.imageProductId || ''}
                    options={productOptions}
                    onChange={(value) => {
                      const chambers = [...form.domains.chambers];
                      chambers[index] = { ...chamber, imageProductId: value };
                      patchSection('domains', { chambers });
                    }}
                  />
                </Field>
                <Field label="Image URL override">
                  <input
                    value={chamber.image?.url || ''}
                    onChange={(e) => {
                      const chambers = [...form.domains.chambers];
                      chambers[index] = {
                        ...chamber,
                        image: { ...chamber.image, url: e.target.value },
                      };
                      patchSection('domains', { chambers });
                    }}
                  />
                </Field>
              </div>
              <Field label="Summary">
                <textarea
                  rows={2}
                  value={chamber.summary || ''}
                  onChange={(e) => {
                    const chambers = [...form.domains.chambers];
                    chambers[index] = { ...chamber, summary: e.target.value };
                    patchSection('domains', { chambers });
                  }}
                />
              </Field>
            </div>
          ))}
        </SectionCard>

        <SectionCard
          id="home-signatures"
          title="Signatures intro"
          enabled={form.signatures.enabled}
          onToggle={(e) => patchSection('signatures', { enabled: e.target.checked })}
        >
          <div className="admin-form__grid">
            <Field label="Meta">
              <input
                value={form.signatures.meta || ''}
                onChange={(e) => patchSection('signatures', { meta: e.target.value })}
              />
            </Field>
            <Field label="Title">
              <input
                value={form.signatures.title || ''}
                onChange={(e) => patchSection('signatures', { title: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Lede">
            <textarea
              rows={2}
              value={form.signatures.lede || ''}
              onChange={(e) => patchSection('signatures', { lede: e.target.value })}
            />
          </Field>
        </SectionCard>

        <SectionCard
          id="home-featured"
          title="Featured plates"
          enabled={form.featured.enabled}
          onToggle={(e) => patchSection('featured', { enabled: e.target.checked })}
        >
          {(form.featured.slots || []).map((slot, index) => (
            <div key={`slot-${index}`} className="admin-home-chamber">
              <h3>Slot {index + 1}</h3>
              <div className="admin-form__grid">
                <Field label="Product">
                  <MuseumSelect
                    ariaLabel={`Featured slot ${index + 1}`}
                    value={slot.productId || ''}
                    options={productOptions}
                    onChange={(value) => {
                      const slots = [...form.featured.slots];
                      slots[index] = { ...slot, productId: value };
                      patchSection('featured', { slots });
                    }}
                  />
                </Field>
                <Field label="Fallback type">
                  <MuseumSelect
                    ariaLabel={`Featured slot ${index + 1} type`}
                    value={slot.productType || ''}
                    options={[
                      { value: '', label: 'None' },
                      { value: 'car', label: 'Car' },
                      { value: 'motorcycle', label: 'Motorcycle' },
                      { value: 'watch', label: 'Watch' },
                    ]}
                    onChange={(value) => {
                      const slots = [...form.featured.slots];
                      slots[index] = { ...slot, productType: value };
                      patchSection('featured', { slots });
                    }}
                  />
                </Field>
                <Field label="Eyebrow">
                  <input
                    value={slot.eyebrow || ''}
                    onChange={(e) => {
                      const slots = [...form.featured.slots];
                      slots[index] = { ...slot, eyebrow: e.target.value };
                      patchSection('featured', { slots });
                    }}
                  />
                </Field>
                <label className="admin-home-section__toggle">
                  <input
                    type="checkbox"
                    checked={Boolean(slot.flipped)}
                    onChange={(e) => {
                      const slots = [...form.featured.slots];
                      slots[index] = { ...slot, flipped: e.target.checked };
                      patchSection('featured', { slots });
                    }}
                  />
                  <span>Flipped layout</span>
                </label>
              </div>
            </div>
          ))}
        </SectionCard>

        <SectionCard
          id="home-editorial"
          title="Editorial story"
          enabled={form.editorial.enabled}
          onToggle={(e) => patchSection('editorial', { enabled: e.target.checked })}
        >
          <div className="admin-form__grid">
            <Field label="Pinned article">
              <MuseumSelect
                ariaLabel="Pinned editorial article"
                value={form.editorial.articleId || ''}
                options={articleOptions}
                onChange={(value) => patchSection('editorial', { articleId: value })}
              />
            </Field>
            <Field label="CTA label">
              <input
                value={form.editorial.cta || ''}
                onChange={(e) => patchSection('editorial', { cta: e.target.value })}
              />
            </Field>
            <Field label="Fallback type">
              <input
                value={form.editorial.type || ''}
                onChange={(e) => patchSection('editorial', { type: e.target.value })}
              />
            </Field>
            <Field label="Fallback title">
              <input
                value={form.editorial.title || ''}
                onChange={(e) => patchSection('editorial', { title: e.target.value })}
              />
            </Field>
            <Field label="Fallback href">
              <input
                value={form.editorial.href || ''}
                onChange={(e) => patchSection('editorial', { href: e.target.value })}
              />
            </Field>
            <Field label="Fallback image URL">
              <input
                value={form.editorial.image?.url || ''}
                onChange={(e) =>
                  patchSection('editorial', {
                    image: { ...form.editorial.image, url: e.target.value },
                  })
                }
              />
            </Field>
          </div>
          <Field label="Fallback excerpt">
            <textarea
              rows={3}
              value={form.editorial.excerpt || ''}
              onChange={(e) => patchSection('editorial', { excerpt: e.target.value })}
            />
          </Field>
        </SectionCard>

        <SectionCard
          id="home-close"
          title="Home close"
          enabled={form.close.enabled}
          onToggle={(e) => patchSection('close', { enabled: e.target.checked })}
        >
          <div className="admin-form__grid">
            <Field label="Eyebrow">
              <input
                value={form.close.eyebrow || ''}
                onChange={(e) => patchSection('close', { eyebrow: e.target.value })}
              />
            </Field>
            <Field label="Title">
              <input
                value={form.close.title || ''}
                onChange={(e) => patchSection('close', { title: e.target.value })}
              />
            </Field>
          </div>
          {(form.close.paths || []).map((path, index) => (
            <div key={`path-${index}`} className="admin-home-chamber">
              <h3>Path {index + 1}</h3>
              <div className="admin-form__grid">
                <Field label="Label">
                  <input
                    value={path.label || ''}
                    onChange={(e) => {
                      const paths = [...form.close.paths];
                      paths[index] = { ...path, label: e.target.value };
                      patchSection('close', { paths });
                    }}
                  />
                </Field>
                <Field label="Title">
                  <input
                    value={path.title || ''}
                    onChange={(e) => {
                      const paths = [...form.close.paths];
                      paths[index] = { ...path, title: e.target.value };
                      patchSection('close', { paths });
                    }}
                  />
                </Field>
                <Field label="Href">
                  <input
                    value={path.href || ''}
                    onChange={(e) => {
                      const paths = [...form.close.paths];
                      paths[index] = { ...path, href: e.target.value };
                      patchSection('close', { paths });
                    }}
                  />
                </Field>
                <Field label="CTA">
                  <input
                    value={path.cta || ''}
                    onChange={(e) => {
                      const paths = [...form.close.paths];
                      paths[index] = { ...path, cta: e.target.value };
                      patchSection('close', { paths });
                    }}
                  />
                </Field>
              </div>
              <Field label="Summary">
                <textarea
                  rows={2}
                  value={path.summary || ''}
                  onChange={(e) => {
                    const paths = [...form.close.paths];
                    paths[index] = { ...path, summary: e.target.value };
                    patchSection('close', { paths });
                  }}
                />
              </Field>
            </div>
          ))}
        </SectionCard>

        {error ? <p className="admin-form__error">{error}</p> : null}
        {savedAt ? (
          <p className="meta">Saved {savedAt.toLocaleTimeString()}.</p>
        ) : null}

        <div className="admin-form__actions">
          <button type="submit" className="btn" disabled={saving}>
            {saving ? 'Saving…' : 'Save home page'}
          </button>
        </div>
      </form>
    </AdminPageShell>
  );
}
