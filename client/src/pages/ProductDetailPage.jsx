import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import AppShell from '../components/layout/AppShell.jsx';
import ProductGallery from '../components/archive/ProductGallery.jsx';
import { getObjectBySlug } from '../data/demoData.js';
import { toggleFavorite } from '../features/favorites/favoriteSlice.js';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const object = getObjectBySlug(slug);
  const dispatch = useDispatch();
  const favorited = useSelector((state) =>
    object ? state.favorites.ids.includes(object.id) : false
  );

  if (!object) {
    return (
      <AppShell>
        <main className="section-pad" style={{ paddingTop: '4.5rem', paddingBottom: '6rem' }}>
          <div className="section-inner">
            <p className="meta">Missing object</p>
            <h1 className="display" style={{ fontSize: '2.5rem' }}>
              This object is not in the demonstration archive.
            </h1>
            <p style={{ marginTop: '1.5rem' }}>
              <Link className="link-cta" to="/">
                Back home
              </Link>
            </p>
          </div>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main className="product-detail section-pad">
        <div className="product-detail__inner section-inner">
          <p className="meta">
            <Link to="/">Home</Link>
            {' · '}
            <Link to="/discover">Discover</Link>
            {' · '}
            {object.productType}
          </p>

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
    </AppShell>
  );
}
