import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import ComparisonTable from '../components/compare/ComparisonTable.jsx';
import LoadingState from '../components/feedback/LoadingState.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useGetProductsQuery } from '../app/api.js';
import {
  clearCompare,
  selectCompareIds,
  MAX_COMPARE_ITEMS,
} from '../features/compare/compareSlice.js';

export default function ComparisonPage() {
  const dispatch = useDispatch();
  const ids = useSelector(selectCompareIds);
  const { data, isLoading, isFetching } = useGetProductsQuery(
    { ids: ids.join(','), limit: MAX_COMPARE_ITEMS },
    { skip: !ids.length }
  );

  useDocumentTitle('Compare');

  const byId = new Map((data?.items || []).map((item) => [item.id, item]));
  const products = ids.map((id) => byId.get(id)).filter(Boolean);

  return (
    <main className="compare-page">
      <div className="section-inner compare-page__inner">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Discover', to: '/discover' },
            { label: 'Compare' },
          ]}
        />
        <header className="page-head">
          <p className="meta">Collector compare</p>
          <h1 className="display page-head__title">Side by side</h1>
          <p className="page-lede">
            Compare up to {MAX_COMPARE_ITEMS} archive objects. Shared attributes stay aligned;
            domain-specific specifications open in their own sections.
          </p>
        </header>

        {!ids.length ? (
          <div className="collector-empty">
            <p>No objects in the tray yet.</p>
            <Link className="btn btn--soft" to="/discover">
              Browse discover
            </Link>
          </div>
        ) : null}

        {ids.length > 0 && ids.length < 2 ? (
          <div className="collector-empty">
            <p>Add at least one more object to open a full comparison.</p>
            <Link className="btn btn--soft" to="/discover">
              Continue browsing
            </Link>
          </div>
        ) : null}

        {ids.length >= 2 && (isLoading || isFetching) && !products.length ? <LoadingState /> : null}

        {products.length >= 2 ? (
          <>
            <div className="compare-page__toolbar">
              <p className="meta">
                {products.length} objects · {ids.length}/{MAX_COMPARE_ITEMS} slots
              </p>
              <button type="button" className="quiet-action" onClick={() => dispatch(clearCompare())}>
                Clear tray
              </button>
            </div>
            <ComparisonTable products={products} />
          </>
        ) : null}
      </div>
    </main>
  );
}
