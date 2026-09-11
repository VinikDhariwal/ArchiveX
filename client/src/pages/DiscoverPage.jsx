import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import ProductFilters from '../components/discover/ProductFilters.jsx';
import ProductSort from '../components/discover/ProductSort.jsx';
import ProductGrid from '../components/discover/ProductGrid.jsx';
import ProductGridSkeleton from '../components/discover/ProductGridSkeleton.jsx';
import ErrorState from '../components/feedback/ErrorState.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useGetBrandsQuery, useGetProductsQuery } from '../app/api.js';
import {
  buildProductsQueryArgs,
  countActiveFilters,
  discoverParamsToSearchParams,
  parseDiscoverSearchParams,
  selectProductItems,
  selectProductMeta,
  storeShuffleSeed,
} from '../features/products/productApi.js';
import {
  selectDraftQuery,
  selectMobileFiltersOpen,
  setDraftQuery,
  setMobileFiltersOpen,
} from '../features/discover/filterSlice.js';

function discoverFilterKey(params) {
  const { page: _page, ...rest } = params;
  return JSON.stringify(rest);
}

export default function DiscoverPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const draftQuery = useSelector(selectDraftQuery);
  const mobileFiltersOpen = useSelector(selectMobileFiltersOpen);
  useDocumentTitle('Discover');

  const params = useMemo(() => parseDiscoverSearchParams(searchParams), [searchParams]);
  const filterKey = useMemo(() => discoverFilterKey(params), [params]);
  const activeFilterCount = countActiveFilters(params);

  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    setPage(1);
    setItems([]);
  }, [filterKey]);

  const queryArgs = useMemo(
    () => buildProductsQueryArgs({ ...params, page: String(page) }),
    [params, page]
  );

  const { data, isLoading, isError, refetch, isFetching } = useGetProductsQuery(queryArgs);
  const { data: brands = [] } = useGetBrandsQuery(
    params.domain !== 'all' ? { domain: params.domain } : {}
  );

  const meta = selectProductMeta(data);
  const hasMore = page < (meta.totalPages || 1);
  const showInitialSkeleton = isLoading && page === 1 && !items.length;

  useEffect(() => {
    dispatch(setDraftQuery(params.q || ''));
  }, [params.q, dispatch]);

  // Keep shuffle seed in the URL + session so refresh / reopening Discover
  // does not jump to a different card order (looks like the page "broke").
  useEffect(() => {
    if (params.sort !== 'shuffle') return;
    const seed = String(params.seed || '1');
    storeShuffleSeed(seed);
    if (searchParams.get('seed') === seed && searchParams.get('sort') === 'shuffle') return;
    setSearchParams(discoverParamsToSearchParams(params), { replace: true });
  }, [params, searchParams, setSearchParams]);

  useEffect(() => {
    if (!data) return;
    const pageItems = selectProductItems(data);
    setItems((prev) => {
      if (page === 1) return pageItems;
      const seen = new Set(prev.map((item) => item.id));
      return [...prev, ...pageItems.filter((item) => item.id && !seen.has(item.id))];
    });
  }, [data, page]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !hasMore) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        if (isFetching || isError) return;
        setPage((current) => current + 1);
      },
      { root: null, rootMargin: '480px 0px', threshold: 0 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isFetching, isError, filterKey]);

  const updateParams = (patch) => {
    const next = { ...params, ...patch };
    delete next.page;
    if (patch.domain && patch.domain !== params.domain) {
      // Drop domain-specific filters when switching chambers.
      delete next.bodyStyle;
      delete next.engine;
      delete next.power;
      delete next.drivetrain;
      delete next.transmission;
      delete next.displacement;
      delete next.movement;
      delete next.caseMaterial;
      delete next.caseSize;
      delete next.dialColor;
      delete next.waterResistance;
      delete next.productionPeriod;
      delete next.brand;
    }
    if (patch.sort === 'shuffle' && !patch.seed) {
      next.seed = String(Number(params.seed || 1));
    }
    if (next.sort === 'shuffle' && next.seed) storeShuffleSeed(next.seed);
    setSearchParams(discoverParamsToSearchParams(next), { replace: false });
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const nextQ = draftQuery.trim();
    updateParams({
      q: nextQ,
      sort: nextQ ? 'relevance' : params.sort === 'relevance' ? 'shuffle' : params.sort,
    });
    dispatch(setMobileFiltersOpen(false));
  };

  const handleClear = () => {
    dispatch(setDraftQuery(''));
    storeShuffleSeed('1');
    setSearchParams({ sort: 'shuffle', seed: '1' });
    dispatch(setMobileFiltersOpen(false));
  };

  const handleReshuffle = () => {
    const nextSeed = String(Number(params.seed || 1) + 1);
    storeShuffleSeed(nextSeed);
    updateParams({
      sort: 'shuffle',
      seed: nextSeed,
    });
  };

  return (
    <main className="discover-page">
      <div className="section-inner discover-page__inner discover-page__inner--wide">
        <div className="discover-page__top">
          <Breadcrumbs
            items={[
              { label: 'Home', to: '/' },
              { label: 'Discover' },
            ]}
          />

          <header className="discover-page__head">
            <div>
              <p className="discover-page__eyebrow">Archive</p>
              <h1 className="discover-page__title">Discover</h1>
              <p className="discover-page__lede">
                Browse and filter the chamber — cars and motorcycles first, watches following.
              </p>
            </div>
            <div className="discover-page__head-actions">
              <button
                type="button"
                className="discover-page__action discover-page__filters-toggle"
                onClick={() => dispatch(setMobileFiltersOpen(!mobileFiltersOpen))}
              >
                {mobileFiltersOpen ? 'Hide filters' : `Filters${activeFilterCount ? ` (${activeFilterCount})` : ''}`}
              </button>
              <button
                type="button"
                className="discover-page__action discover-page__reshuffle"
                onClick={handleReshuffle}
              >
                Reshuffle
              </button>
            </div>
          </header>
        </div>

        <div className={`discover-page__layout ${mobileFiltersOpen ? 'is-filters-open' : ''}`}>
          <div className="discover-page__rail">
            <ProductFilters
              params={params}
              draftQuery={draftQuery}
              onDraftQueryChange={(value) => dispatch(setDraftQuery(value))}
              onSearchSubmit={handleSearchSubmit}
              onChange={updateParams}
              onClear={handleClear}
              brands={brands}
            />
          </div>

          <div className="discover-page__main">
            <div className="discover-page__toolbar">
              <ProductSort
                value={params.sort}
                total={meta.total || 0}
                isLoading={showInitialSkeleton || (isFetching && page === 1)}
                onChange={(sort) =>
                  updateParams({
                    sort,
                    seed: sort === 'shuffle' ? String(Number(params.seed || 1) + 1) : params.seed,
                  })
                }
              />
            </div>

            {showInitialSkeleton ? <ProductGridSkeleton /> : null}
            {isError && !items.length ? (
              <ErrorState message="Could not load the feed." onRetry={refetch} />
            ) : null}

            {!showInitialSkeleton && !isError ? <ProductGrid products={items} /> : null}
            {!showInitialSkeleton && isError && items.length ? (
              <ErrorState message="Could not load more objects." onRetry={refetch} />
            ) : null}

            {!showInitialSkeleton && !isError && !items.length ? (
              <p className="discover-page__empty">
                No approved objects match these filters. Clear filters or try another chamber.
              </p>
            ) : null}

            {items.length ? (
              <div className="discover-page__infinite" aria-live="polite">
                <div ref={loadMoreRef} className="discover-page__infinite-sentinel" />
                {isFetching && page > 1 ? (
                  <p className="discover-page__infinite-status">Loading more from the archive…</p>
                ) : null}
                {!hasMore && !isFetching ? (
                  <p className="discover-page__infinite-status">
                    End of the chamber — {meta.total || items.length} objects shown.
                  </p>
                ) : null}
              </div>
            ) : null}

            <p className="discover-page__foot">
              <Link className="link-cta" to="/brands">
                Browse brands
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
