import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import LoadingState from '../components/feedback/LoadingState.jsx';
import ErrorState from '../components/feedback/ErrorState.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useGetBrandsQuery } from '../app/api.js';

const DOMAIN_FILTERS = [
  { value: '', label: 'All' },
  { value: 'car', label: 'Cars' },
  { value: 'motorcycle', label: 'Motorcycles' },
  { value: 'watch', label: 'Watches' },
];

const DOMAIN_LABELS = {
  car: 'Car',
  motorcycle: 'Motorcycle',
  watch: 'Watch',
};

function letterFor(name = '') {
  const ch = String(name).trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(ch) ? ch : '#';
}

function domainLabel(domains = []) {
  if (!domains.length) return null;
  return domains.map((domain) => DOMAIN_LABELS[domain] || domain).join(' · ');
}

export default function BrandsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const domain = searchParams.get('domain') || '';
  const [query, setQuery] = useState('');
  const { data: brands = [], isLoading, isError, refetch } = useGetBrandsQuery(
    domain ? { domain } : {}
  );
  useDocumentTitle('Brands');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return brands;
    return brands.filter(
      (brand) =>
        brand.name.toLowerCase().includes(q) ||
        (brand.country || '').toLowerCase().includes(q) ||
        (brand.slug || '').toLowerCase().includes(q)
    );
  }, [brands, query]);

  const groups = useMemo(() => {
    const map = new Map();
    filtered.forEach((brand) => {
      const letter = letterFor(brand.name);
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter).push(brand);
    });
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const letters = groups.map(([letter]) => letter);

  function setDomain(next) {
    const params = new URLSearchParams(searchParams);
    if (next) params.set('domain', next);
    else params.delete('domain');
    setSearchParams(params, { replace: true });
  }

  return (
    <main className="brands-page">
      <div className="section-inner brands-page__inner">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Brands' },
          ]}
        />

        <header className="brands-page__head">
          <div className="brands-page__intro">
            <p className="meta">Houses, A–Z</p>
            <h1 className="display brands-page__title">Brands</h1>
            <p className="brands-page__lede">
              An alphabetical index of collector houses in the archive.
            </p>
          </div>
          <div className="brands-page__head-meta">
            <p className="brands-page__count">
              {isLoading ? '…' : `${filtered.length} house${filtered.length === 1 ? '' : 's'}`}
            </p>
            <Link className="link-cta link-cta--muted" to="/categories">
              Categories
            </Link>
          </div>
        </header>

        <div className="brands-page__controls">
          <div className="taxonomy-pills" role="group" aria-label="Filter by domain">
            {DOMAIN_FILTERS.map((item) => (
              <button
                key={item.value || 'all'}
                type="button"
                className={`taxonomy-pill${domain === item.value ? ' is-active' : ''}`}
                onClick={() => setDomain(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <label className="brands-page__search">
            <span className="visually-hidden">Search brands</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or country"
            />
          </label>
        </div>

        {letters.length > 1 ? (
          <nav className="brands-page__letters" aria-label="Jump by letter">
            {letters.map((letter) => (
              <a key={letter} href={`#brand-letter-${letter}`}>
                {letter}
              </a>
            ))}
          </nav>
        ) : null}

        {isLoading ? <LoadingState /> : null}
        {isError ? <ErrorState message="Could not load brands." onRetry={refetch} /> : null}

        {!isLoading && !isError && !filtered.length ? (
          <div className="collector-empty">
            <p>No brands match this filter.</p>
            <button type="button" className="quiet-action" onClick={() => setDomain('')}>
              Show all brands
            </button>
          </div>
        ) : null}

        {groups.length ? (
          <div className="brands-directory">
            {groups.map(([letter, items]) => (
              <section
                key={letter}
                id={`brand-letter-${letter}`}
                className="brands-directory__section"
                aria-labelledby={`brand-letter-title-${letter}`}
              >
                <div className="brands-directory__rail">
                  <h2 id={`brand-letter-title-${letter}`} className="brands-directory__letter">
                    {letter}
                  </h2>
                  <p className="brands-directory__section-count">{items.length}</p>
                </div>
                <ul className="brands-directory__list">
                  {items.map((brand) => {
                    const domainText = domainLabel(brand.primaryDomains || []);
                    return (
                      <li key={brand.id || brand.slug}>
                        <Link className="brands-directory__item" to={`/brands/${brand.slug}`}>
                          {brand.coverImage?.url || brand.logo?.url ? (
                            <span className="brands-directory__thumb" aria-hidden="true">
                              <img
                                src={brand.coverImage?.url || brand.logo.url}
                                alt=""
                                loading="lazy"
                                onError={(event) => {
                                  event.currentTarget.style.display = 'none';
                                }}
                              />
                            </span>
                          ) : (
                            <span className="brands-directory__monogram" aria-hidden="true">
                              {letterFor(brand.name)}
                            </span>
                          )}
                          <span className="brands-directory__copy">
                            <span className="brands-directory__name">{brand.name}</span>
                            <span className="brands-directory__meta">
                              <span className="brands-directory__country">
                                {brand.country || '—'}
                              </span>
                              <span className="brands-directory__sep" aria-hidden="true">
                                ·
                              </span>
                              <span className="brands-directory__domain">
                                {domainText || 'House'}
                              </span>
                            </span>
                          </span>
                          {brand.productCount ? (
                            <span className="brands-directory__objects">{brand.productCount}</span>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
