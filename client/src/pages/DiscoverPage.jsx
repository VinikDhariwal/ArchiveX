import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import ObjectCard from '../components/archive/ObjectCard.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { getShuffledDiscoverFeed } from '../data/demoData.js';

const MAX_COMPARE = 4;
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
  const [compareIds, setCompareIds] = useState([]);
  const [shuffleKey, setShuffleKey] = useState(0);
  useDocumentTitle('Discover');

  useEffect(() => {
    if (!VALID_DOMAINS.has(paramDomain)) {
      setSearchParams({}, { replace: true });
    }
  }, [paramDomain, setSearchParams]);

  const feed = useMemo(() => getShuffledDiscoverFeed(shuffleKey), [shuffleKey]);

  const visible = useMemo(() => {
    if (domain === 'all') return feed;
    return feed.filter((object) => object.productType === domain);
  }, [domain, feed]);

  const setDomain = (next) => {
    if (next === 'all') {
      setSearchParams({});
      return;
    }
    setSearchParams({ domain: next });
  };

  const toggleCompare = (id) => {
    setCompareIds((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }
      if (current.length >= MAX_COMPARE) {
        return current;
      }
      return [...current, id];
    });
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
              {visible.length} objects · demonstration feed
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

        <div className="object-grid object-grid--discover">
          {visible.map((object, index) => (
            <ObjectCard
              key={object.id}
              object={object}
              wide={index === 0}
              onToggleCompare={toggleCompare}
              isCompared={compareIds.includes(object.id)}
            />
          ))}
        </div>

        {!visible.length ? (
          <p className="discover-page__empty">No objects in this domain yet.</p>
        ) : null}

        <p className="discover-page__foot">
          <Link className="link-cta" to="/brands">
            Browse brands
          </Link>
        </p>
      </div>

      <div
        className={`compare-tray ${compareIds.length ? 'is-visible' : ''}`}
        role="status"
        aria-live="polite"
      >
        <span>
          Compare tray · {compareIds.length}/{MAX_COMPARE} objects selected
        </span>
        <div className="compare-tray__actions">
          <Link className="link-cta link-cta--light" to="/compare">
            Open compare
          </Link>
          <button
            type="button"
            className="btn"
            style={{ color: 'var(--paper)', borderColor: 'rgba(241,238,231,0.4)' }}
            onClick={() => setCompareIds([])}
          >
            Clear
          </button>
        </div>
      </div>
    </main>
  );
}
