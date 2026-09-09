import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import ProductGallery from '../components/archive/ProductGallery.jsx';
import LoadingState from '../components/feedback/LoadingState.jsx';
import ErrorState from '../components/feedback/ErrorState.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useGetProductBySlugQuery } from '../app/api.js';
import { getPublisher } from '../utils/archiveObject.js';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { data: object, isLoading, isError, refetch } = useGetProductBySlugQuery(slug, {
    skip: !slug,
  });
  const publisher = object ? getPublisher(object) : 'ArchiveX';

  useDocumentTitle(object?.name || (isLoading ? 'Loading…' : 'Missing object'));

  if (isLoading) {
    return (
      <main className="route-shell">
        <div className="route-shell__inner">
          <LoadingState />
        </div>
      </main>
    );
  }

  if (isError || !object) {
    return (
      <main className="route-shell">
        <div className="route-shell__inner">
          <Breadcrumbs
            items={[
              { label: 'Home', to: '/' },
              { label: 'Discover', to: '/discover' },
              { label: 'Missing' },
            ]}
          />
          <header className="page-head">
            <p className="meta">Missing object</p>
            <h1 className="display page-head__title">This object is not in the public archive</h1>
          </header>
          {isError ? <ErrorState message="Could not load this object." onRetry={refetch} /> : null}
          <p className="route-shell__actions">
            <Link className="link-cta" to="/discover">
              Back to discover
            </Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="product-detail">
      <div className="product-detail__inner section-inner">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Discover', to: '/discover' },
            { label: object.productType, to: `/discover?domain=${object.productType}` },
            { label: object.name },
          ]}
        />

        <div className="product-detail__grid">
          <ProductGallery images={object.images} productName={object.name} />

          <div className="product-detail__identity">
            <header className="page-head">
              <p className="meta">{object.brand}</p>
              <h1 className="display product-detail__title">{object.name}</h1>
              <p className="product-detail__lede">{object.shortDescription}</p>
            </header>
            <div className="featured-object__meta-row">
              <span>{object.productType}</span>
              <span>{object.year}</span>
              <span className="rarity">{object.rarity}</span>
              <span>{object.images?.length || 0} plates</span>
            </div>

            <p className="product-detail__publisher">
              <span className="meta">Publisher</span>
              <strong>{publisher}</strong>
            </p>

            <div className="featured-object__actions">
              <Link className="link-cta" to="/discover">
                Back to discover
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
