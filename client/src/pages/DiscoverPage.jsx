import { useEffect, useMemo } from 'react';
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
  storeShuffleSeed,
} from '../features/products/productApi.js';
import { selectProductItems, selectProductMeta } from '../features/products/productSelectors.js';
import {
  selectDraftQuery,
  selectMobileFiltersOpen,
  setDraftQuery,
  setMobileFiltersOpen,
} from '../features/discover/filterSlice.js';

export default function DiscoverPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const draftQuery = useSelector(selectDraftQuery);
  const mobileFiltersOpen = useSelector(selectMobileFiltersOpen);
  useDocumentTitle('Discover');

  const params = useMemo(() => parseDiscoverSearchParams(searchParams), [searchParams]);
  const queryArgs = useMemo(() => buildProductsQueryArgs(params), [params]);
  const activeFilterCount = countActiveFilters(params);

  const { data, isLoading, isError, refetch, isFetching } = useGetProductsQuery(queryArgs);
  const { data: brands = [] } = useGetBrandsQuery(
    params.domain !== 'all' ? { domain: params.domain } : {}
  );

  const products = selectProductItems(data);
  const meta = selectProductMeta(data);

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

  const updateParams = (patch) => {
    const next = { ...params, ...patch };
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
      next.page = '1';
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
      page: '1',
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
      page: '1',
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
              <button type="button" className="discover-page__action" onClick={handleReshuffle}>
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
                isLoading={isLoading || isFetching}
                onChange={(sort) =>
                  updateParams({
                    sort,
                    page: '1',
                    seed: sort === 'shuffle' ? String(Number(params.seed || 1) + 1) : params.seed,
                  })
                }
              />
            </div>

            {isLoading ? <ProductGridSkeleton /> : null}
            {isError ? <ErrorState message="Could not load the feed." onRetry={refetch} /> : null}

            {!isLoading && !isError ? <ProductGrid products={products} /> : null}

            {!isLoading && !isError && !products.length ? (
              <p className="discover-page__empty">
                No approved objects match these filters. Clear filters or try another chamber.
              </p>
            ) : null}

            {!isLoading && !isError && meta.totalPages > 1 ? (
              <nav className="discover-page__pagination" aria-label="Discover pagination">
                <button
                  type="button"
                  className="discover-page__action"
                  disabled={Number(params.page) <= 1}
                  onClick={() => updateParams({ page: String(Number(params.page) - 1) })}
                >
                  Previous
                </button>
                <p className="product-sort__count">
                  Page {meta.page} of {meta.totalPages}
                </p>
                <button
                  type="button"
                  className="discover-page__action"
                  disabled={Number(params.page) >= meta.totalPages}
                  onClick={() => updateParams({ page: String(Number(params.page) + 1) })}
                >
                  Next
                </button>
              </nav>
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
