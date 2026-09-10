import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import ObjectCard from '../components/archive/ObjectCard.jsx';
import LoadingState from '../components/feedback/LoadingState.jsx';
import ErrorState from '../components/feedback/ErrorState.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useGetBrandBySlugQuery, useGetProductsQuery } from '../app/api.js';

export default function BrandDetailPage() {
  const { slug } = useParams();
  const { data: brand, isLoading, isError, refetch } = useGetBrandBySlugQuery(slug, {
    skip: !slug,
  });
  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
  } = useGetProductsQuery(
    { brand: slug, limit: 24, sort: 'newest' },
    { skip: !slug }
  );

  useDocumentTitle(brand?.name || (isLoading ? 'Loading…' : 'Missing brand'));

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

  if (isError || !brand) {
    return (
      <main className="taxonomy-page">
        <div className="section-inner taxonomy-page__inner">
          <Breadcrumbs
            items={[
              { label: 'Home', to: '/' },
              { label: 'Brands', to: '/brands' },
              { label: 'Missing' },
            ]}
          />
          <header className="page-head">
            <p className="meta">Missing house</p>
            <h1 className="display page-head__title">This brand is not in the public archive</h1>
          </header>
          {isError ? <ErrorState message="Could not load this brand." onRetry={refetch} /> : null}
          <p className="route-shell__actions">
            <Link className="btn btn--soft" to="/brands">
              Back to brands
            </Link>
          </p>
        </div>
      </main>
    );
  }

  const domains = brand.primaryDomains || [];

  return (
    <main className="taxonomy-page">
      <div className="section-inner taxonomy-page__inner">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Brands', to: '/brands' },
            { label: brand.name },
          ]}
        />

        <header className="page-head">
          <p className="meta">Brand chamber</p>
          <h1 className="display page-head__title">{brand.name}</h1>
          <p className="page-lede">{brand.description || 'A house in the ArchiveX catalog.'}</p>
          <p className="taxonomy-meta">
            {[brand.country, brand.foundedYear ? `Est. ${brand.foundedYear}` : null, domains.join(' · ')]
              .filter(Boolean)
              .join(' · ')}
            {brand.productCount != null ? ` · ${brand.productCount} public objects` : ''}
          </p>
        </header>

        <div className="taxonomy-page__actions">
          {domains.map((domain) => (
            <Link key={domain} className="btn btn--soft" to={`/discover?domain=${domain}`}>
              Discover {domain}
            </Link>
          ))}
          <Link className="btn btn--soft" to="/brands">
            All brands
          </Link>
        </div>

        <section className="taxonomy-objects" aria-labelledby="brand-objects-title">
          <h2 id="brand-objects-title" className="product-section__title">
            Objects in this house
          </h2>
          {productsLoading ? <LoadingState /> : null}
          {productsError ? <ErrorState message="Could not load objects for this brand." /> : null}
          {!productsLoading && !productsError && !products.length ? (
            <div className="collector-empty">
              <p>No objects are catalogued under this brand yet.</p>
              <Link className="btn btn--soft" to="/discover">
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
