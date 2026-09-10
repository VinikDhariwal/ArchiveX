import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import ProductGrid from '../components/discover/ProductGrid.jsx';
import ProductGridSkeleton from '../components/discover/ProductGridSkeleton.jsx';
import LoadingState from '../components/feedback/LoadingState.jsx';
import ErrorState from '../components/feedback/ErrorState.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useGetProductsQuery, useGetRecommendedProductsQuery } from '../app/api.js';
import { selectProductItems, selectProductMeta } from '../features/products/productSelectors.js';

const DOMAIN_FILTERS = [
  { value: '', label: 'All' },
  { value: 'car', label: 'Cars' },
  { value: 'motorcycle', label: 'Motorcycles' },
  { value: 'watch', label: 'Watches' },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = (searchParams.get('q') || '').trim();
  const domain = searchParams.get('domain') || '';
  const page = Number(searchParams.get('page') || 1) || 1;
  const [draft, setDraft] = useState(q);
  const inputRef = useRef(null);

  useDocumentTitle(q ? `Search · ${q}` : 'Search');

  useEffect(() => {
    setDraft(q);
  }, [q]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const hasQuery = Boolean(q);
  const queryArgs = useMemo(() => {
    if (!hasQuery) return null;
    const args = {
      q,
      page,
      limit: 24,
      sort: 'relevance',
    };
    if (domain) args.productType = domain;
    return args;
  }, [hasQuery, q, page, domain]);

  const {
    data: resultsData,
    isLoading: resultsLoading,
    isFetching: resultsFetching,
    isError: resultsError,
    refetch: refetchResults,
  } = useGetProductsQuery(queryArgs, { skip: !queryArgs });

  const {
    data: recommended = [],
    isLoading: recommendedLoading,
    isError: recommendedError,
    refetch: refetchRecommended,
  } = useGetRecommendedProductsQuery({
    limit: 8,
    ...(domain ? { productType: domain } : {}),
  });

  const products = selectProductItems(resultsData);
  const meta = selectProductMeta(resultsData);
  const total = meta.total ?? products.length;
  const totalPages = meta.totalPages || 1;

  function commitSearch(nextQ, patch = {}) {
    const params = new URLSearchParams();
    const trimmed = String(nextQ || '').trim();
    if (trimmed) params.set('q', trimmed);
    const nextDomain = patch.domain !== undefined ? patch.domain : domain;
    if (nextDomain) params.set('domain', nextDomain);
    if (patch.page && Number(patch.page) > 1) params.set('page', String(patch.page));
    setSearchParams(params, { replace: false });
  }

  function handleSubmit(event) {
    event.preventDefault();
    commitSearch(draft, { page: 1 });
  }

  function setDomain(next) {
    commitSearch(q || draft, { domain: next, page: 1 });
  }

  function clearSearch() {
    setDraft('');
    const params = new URLSearchParams();
    if (domain) params.set('domain', domain);
    setSearchParams(params, { replace: false });
    inputRef.current?.focus();
  }

  const showLanding = !hasQuery;
  const showZero = hasQuery && !resultsLoading && !resultsError && products.length === 0;

  return (
    <main className="search-page">
      <div className="section-inner search-page__inner">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Search' },
          ]}
        />

        <header className="search-page__head">
          <p className="meta">Archive search</p>
          <h1 className="display search-page__title">Search</h1>
          <p className="search-page__lede">
            Find objects by name, reference, house, or chamber language across the catalog.
          </p>
        </header>

        <form className="search-page__form" onSubmit={handleSubmit} role="search">
          <label className="search-page__field">
            <span className="visually-hidden">Search the archive</span>
            <input
              ref={inputRef}
              type="search"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Search names, references, houses…"
              autoComplete="off"
            />
          </label>
          <div className="search-page__form-actions">
            <button type="submit" className="btn btn--soft">
              Search
            </button>
            {hasQuery || draft ? (
              <button type="button" className="quiet-action" onClick={clearSearch}>
                Clear
              </button>
            ) : null}
          </div>
        </form>

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

        {showLanding ? (
          <section className="search-page__section" aria-labelledby="search-suggested-title">
            <div className="search-page__section-head">
              <h2 id="search-suggested-title" className="product-section__title">
                Suggested from the archive
              </h2>
              <p className="search-page__section-note">
                Featured and rarity-led recommendations while you decide what to ask.
              </p>
            </div>
            {recommendedLoading ? <LoadingState /> : null}
            {recommendedError ? (
              <ErrorState message="Could not load recommendations." onRetry={refetchRecommended} />
            ) : null}
            {recommended.length ? <ProductGrid products={recommended} /> : null}
            <p className="search-page__alt">
              Or open the quieter chamber on{' '}
              <Link className="link-cta" to="/discover">
                Discover
              </Link>
              .
            </p>
          </section>
        ) : null}

        {hasQuery ? (
          <section className="search-page__section" aria-labelledby="search-results-title">
            <div className="search-page__section-head">
              <h2 id="search-results-title" className="product-section__title">
                Results
              </h2>
              <p className="search-page__section-note">
                {resultsLoading || resultsFetching
                  ? 'Searching…'
                  : `${total} match${total === 1 ? '' : 'es'} for “${q}”`}
                {domain ? ` · ${domain}` : ''}
              </p>
            </div>

            {resultsLoading ? <ProductGridSkeleton /> : null}
            {resultsError ? (
              <ErrorState message="Could not run this search." onRetry={refetchResults} />
            ) : null}

            {!resultsLoading && !resultsError && products.length ? (
              <>
                <ProductGrid products={products} />
                {totalPages > 1 ? (
                  <div className="search-page__pagination">
                    <button
                      type="button"
                      className="btn btn--soft"
                      disabled={page <= 1}
                      onClick={() => commitSearch(q, { page: page - 1 })}
                    >
                      Previous
                    </button>
                    <p className="meta">
                      Page {page} of {totalPages}
                    </p>
                    <button
                      type="button"
                      className="btn btn--soft"
                      disabled={page >= totalPages}
                      onClick={() => commitSearch(q, { page: page + 1 })}
                    >
                      Next
                    </button>
                  </div>
                ) : null}
              </>
            ) : null}

            {showZero ? (
              <div className="collector-empty">
                <p>No objects matched that search.</p>
                <button type="button" className="btn btn--soft" onClick={clearSearch}>
                  Clear search
                </button>
              </div>
            ) : null}
          </section>
        ) : null}

        {showZero ? (
          <section className="search-page__section" aria-labelledby="search-fallback-title">
            <div className="search-page__section-head">
              <h2 id="search-fallback-title" className="product-section__title">
                You might still like
              </h2>
            </div>
            {recommendedLoading ? <LoadingState /> : null}
            {recommended.length ? <ProductGrid products={recommended} /> : null}
          </section>
        ) : null}
      </div>
    </main>
  );
}
