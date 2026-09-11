import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import ObjectCard from '../components/archive/ObjectCard.jsx';
import LoadingState from '../components/feedback/LoadingState.jsx';
import ErrorState from '../components/feedback/ErrorState.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useGetCategoryBySlugQuery, useGetProductsQuery } from '../app/api.js';

export default function CategoryDetailPage() {
  const { slug } = useParams();
  const { data: category, isLoading, isError, refetch } = useGetCategoryBySlugQuery(slug, {
    skip: !slug,
  });
  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
  } = useGetProductsQuery(
    { category: slug, limit: 24, sort: 'newest' },
    { skip: !slug }
  );

  useDocumentTitle(category?.name || (isLoading ? 'Loading…' : 'Missing category'));

  const products = productsData?.items || [];

  if (isLoading) {
    return (
      <main className="taxonomy-page">
        <div className="section-inner taxonomy-page__inner">
          <LoadingState />
        </div>
      </main>
    );
  }

  if (isError || !category) {
    return (
      <main className="taxonomy-page">
        <div className="section-inner taxonomy-page__inner">
          <Breadcrumbs
            items={[
              { label: 'Home', to: '/' },
              { label: 'Categories', to: '/categories' },
              { label: 'Missing' },
            ]}
          />
          <header className="page-head">
            <p className="meta">Missing path</p>
            <h1 className="display page-head__title">This category is not in the public archive</h1>
          </header>
          {isError ? <ErrorState message="Could not load this category." onRetry={refetch} /> : null}
          <p className="route-shell__actions">
            <Link className="link-cta" to="/categories">
              Back to categories
            </Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="taxonomy-page">
      <div className="section-inner taxonomy-page__inner">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Categories', to: '/categories' },
            { label: category.name },
          ]}
        />

        <header className="page-head">
          <p className="meta">{category.productType} · Category</p>
          <h1 className="display page-head__title">{category.name}</h1>
          <p className="page-lede">
            {category.description || 'A taxonomy path through the ArchiveX catalog.'}
          </p>
          <p className="taxonomy-meta">
            {category.productCount != null
              ? `${category.productCount} public object${category.productCount === 1 ? '' : 's'}`
              : null}
          </p>
        </header>

        <div className="taxonomy-page__actions">
          <Link className="btn" to={`/discover?domain=${category.productType}`}>
            Discover {category.productType}
          </Link>
          <Link className="link-cta link-cta--muted" to="/categories">
            All categories
          </Link>
        </div>

        <section className="taxonomy-objects" aria-labelledby="category-objects-title">
          <h2 id="category-objects-title" className="product-section__title">
            Objects in this path
          </h2>
          {productsLoading ? <LoadingState /> : null}
          {productsError ? <ErrorState message="Could not load objects for this category." /> : null}
          {!productsLoading && !productsError && !products.length ? (
            <div className="collector-empty">
              <p>No objects are catalogued in this category yet.</p>
              <Link className="link-cta" to="/discover">
                Browse discover
              </Link>
            </div>
          ) : null}
          {products.length ? (
            <div className="object-grid object-grid--discover">
              {products.map((product) => (
                <ObjectCard key={product.id} object={product} />
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
