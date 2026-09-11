import { Link, useSearchParams } from 'react-router-dom';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import LoadingState from '../components/feedback/LoadingState.jsx';
import ErrorState from '../components/feedback/ErrorState.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useGetCategoriesQuery } from '../app/api.js';

const TYPE_FILTERS = [
  { value: '', label: 'All' },
  { value: 'car', label: 'Cars' },
  { value: 'motorcycle', label: 'Motorcycles' },
  { value: 'watch', label: 'Watches' },
];

export default function CategoriesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const productType = searchParams.get('productType') || '';
  const { data: categories = [], isLoading, isError, refetch } = useGetCategoriesQuery(
    productType ? { productType } : {}
  );
  useDocumentTitle('Categories');

  function setType(next) {
    const params = new URLSearchParams(searchParams);
    if (next) params.set('productType', next);
    else params.delete('productType');
    setSearchParams(params, { replace: true });
  }

  return (
    <main className="taxonomy-page">
      <div className="section-inner taxonomy-page__inner">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Categories' },
          ]}
        />
        <header className="page-head page-head--split">
          <div>
            <p className="meta">Taxonomy</p>
            <h1 className="display page-head__title">Categories</h1>
            <p className="page-lede">
              Domain paths through the archive — cars and motorcycles first, watches as the
              secondary chamber.
            </p>
          </div>
          <Link className="link-cta link-cta--muted" to="/brands">
            View brands
          </Link>
        </header>

        <div className="taxonomy-toolbar">
          <div className="taxonomy-pills" role="group" aria-label="Filter by product type">
            {TYPE_FILTERS.map((item) => (
              <button
                key={item.value || 'all'}
                type="button"
                className={`taxonomy-pill${productType === item.value ? ' is-active' : ''}`}
                onClick={() => setType(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? <LoadingState /> : null}
        {isError ? <ErrorState message="Could not load categories." onRetry={refetch} /> : null}

        {!isLoading && !isError && !categories.length ? (
          <div className="collector-empty">
            <p>No categories match this filter.</p>
          </div>
        ) : null}

        {categories.length ? (
          <div className="category-grid">
            {categories.map((category) => (
              <Link
                key={category.id}
                className="category-card"
                to={`/categories/${category.slug}`}
              >
                <p className="meta">{category.productType}</p>
                <h2>{category.name}</h2>
                <p>{category.description}</p>
                <span className="demo-note">
                  {category.productCount
                    ? `${category.productCount} object${category.productCount === 1 ? '' : 's'}`
                    : 'Open chamber'}
                </span>
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
