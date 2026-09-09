import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import ObjectCard from '../components/archive/ObjectCard.jsx';
import LoadingState from '../components/feedback/LoadingState.jsx';
import ErrorState from '../components/feedback/ErrorState.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useGetProductsQuery } from '../app/api.js';

const DOMAIN_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'car', label: 'Cars' },
  { id: 'motorcycle', label: 'Motorcycles' },
  { id: 'watch', label: 'Watches' },
];

const VALID_DOMAINS = new Set(['all', 'car', 'motorcycle', 'watch']);

export default function DiscoverPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramDomain = searchParams.get('domain') || 'all';
  const domain = VALID_DOMAINS.has(paramDomain) ? paramDomain : 'all';
  const [shuffleKey, setShuffleKey] = useState(0);
  useDocumentTitle('Discover');

  useEffect(() => {
    if (!VALID_DOMAINS.has(paramDomain)) {
      setSearchParams({}, { replace: true });
    }
  }, [paramDomain, setSearchParams]);

  const queryArgs = useMemo(() => {
    const params = {
      shuffle: 'true',
      seed: String(shuffleKey + 1),
      limit: 48,
    };
    if (domain !== 'all') params.productType = domain;
    return params;
  }, [domain, shuffleKey]);

  const { data, isLoading, isError, refetch, isFetching } = useGetProductsQuery(queryArgs);
  const visible = data?.items || [];

  const setDomain = (next) => {
    if (next === 'all') {
      setSearchParams({});
      return;
    }
    setSearchParams({ domain: next });
  };

  return (
    <main className="discover-page">
      <div className="section-inner discover-page__inner">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Discover' },
          ]}
        />

        <header className="discover-page__head">
          <div>
            <h1 className="display discover-page__title">The mixed archive feed</h1>
            <p className="discover-page__lede">
              Cars and motorcycles lead. Watches follow as a secondary chamber.
            </p>
          </div>
        </header>

        <div className="discover-page__toolbar">
          <div className="discover-page__filters" role="tablist" aria-label="Domain filter">
            {DOMAIN_FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                role="tab"
                aria-selected={domain === filter.id}
                className={`discover-page__filter ${domain === filter.id ? 'is-active' : ''}`}
                onClick={() => setDomain(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="discover-page__toolbar-meta">
            <p className="demo-note discover-page__count">
              {isLoading || isFetching ? 'Loading…' : `${visible.length} approved objects`}
            </p>
            <button
              type="button"
              className="quiet-action"
              onClick={() => setShuffleKey((value) => value + 1)}
            >
              Reshuffle
            </button>
          </div>
        </div>

        {isLoading ? <LoadingState /> : null}
        {isError ? <ErrorState message="Could not load the feed." onRetry={refetch} /> : null}

        {!isLoading && !isError ? (
          <div className="object-grid object-grid--discover">
            {visible.map((object) => (
              <ObjectCard key={object.id || object.slug} object={object} />
            ))}
          </div>
        ) : null}

        {!isLoading && !isError && !visible.length ? (
          <p className="discover-page__empty">No approved objects in this domain yet.</p>
        ) : null}

        <p className="discover-page__foot">
          <Link className="link-cta" to="/brands">
            Browse brands
          </Link>
        </p>
      </div>
    </main>
  );
}
