import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import ProductGallery from '../components/archive/ProductGallery.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { getObjectBySlug, getPublisher } from '../data/demoData.js';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const object = getObjectBySlug(slug);
  const publisher = object ? getPublisher(object) : 'ArchiveX';

  useDocumentTitle(object?.name || 'Missing object');

  if (!object) {
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
            <h1 className="display page-head__title">This object is not in the demonstration archive</h1>
          </header>
          <p className="route-shell__actions">
            <Link className="link-cta" to="/">
              Back home
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
            { label: object.productType, to: '/categories' },
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
              <span>{object.images.length} plates</span>
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

            <p className="demo-note" style={{ marginTop: '1.5rem' }}>
              Multi-image gallery is demonstration data. Full domain specifications arrive in Phase 8.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
