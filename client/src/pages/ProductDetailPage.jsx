import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import ProductGallery from '../components/archive/ProductGallery.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { getObjectBySlug } from '../data/demoData.js';
import { toggleFavorite } from '../features/favorites/favoriteSlice.js';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const object = getObjectBySlug(slug);
  const dispatch = useDispatch();
  const favorited = useSelector((state) =>
    object ? state.favorites.ids.includes(object.id) : false
  );

  useDocumentTitle(object?.name || 'Missing object');

  if (!object) {
    return (
      <main className="section-pad route-shell">
        <div className="section-inner route-shell__inner">
          <Breadcrumbs
            items={[
              { label: 'Home', to: '/' },
              { label: 'Discover', to: '/discover' },
              { label: 'Missing' },
            ]}
          />
          <p className="meta">Missing object</p>
          <span className="hairline" aria-hidden="true" />
          <h1 className="display route-shell__title">This object is not in the demonstration archive</h1>
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
    <main className="product-detail section-pad">
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
            <p className="meta">{object.brand}</p>
            <span className="hairline" aria-hidden="true" />
            <h1 className="display product-detail__title">{object.name}</h1>
            <p className="product-detail__lede">{object.shortDescription}</p>

            <div className="featured-object__meta-row">
              <span>{object.productType}</span>
              <span>{object.year}</span>
              <span className="rarity">{object.rarity}</span>
              <span>{object.images.length} plates</span>
            </div>

            <div className="featured-object__actions">
              <button
                type="button"
                className={`quiet-action ${favorited ? 'is-active' : ''}`}
                aria-pressed={favorited}
                onClick={() => dispatch(toggleFavorite(object.id))}
              >
                {favorited ? 'Saved' : 'Save to favorites'}
              </button>
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
