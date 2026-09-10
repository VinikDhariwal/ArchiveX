import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import ObjectCard from '../components/archive/ObjectCard.jsx';
import LoadingState from '../components/feedback/LoadingState.jsx';
import ErrorState from '../components/feedback/ErrorState.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import {
  useGetFavoritesQuery,
  useGetRecentlyViewedQuery,
  useRemoveFavoriteMutation,
} from '../app/api.js';
import { getSessionKey } from '../utils/productDetail.js';

export default function FavoritesPage() {
  const { data: favorites = [], isLoading, isError, refetch } = useGetFavoritesQuery();
  const { data: recent = [] } = useGetRecentlyViewedQuery({
    sessionKey: getSessionKey(),
    limit: 8,
  });
  const [removeFavorite] = useRemoveFavoriteMutation();
  useDocumentTitle('Favorites');

  const products = favorites.map((row) => row.product).filter(Boolean);

  return (
    <main className="collector-page">
      <div className="section-inner collector-page__inner">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Account', to: '/account' },
            { label: 'Favorites' },
          ]}
        />
        <header className="page-head">
          <p className="meta">Saved objects</p>
          <h1 className="display page-head__title">Favorites</h1>
          <p className="page-lede">Objects you have marked for return visits across the archive.</p>
        </header>

        {isLoading ? <LoadingState /> : null}
        {isError ? <ErrorState message="Could not load favorites." onRetry={refetch} /> : null}

        {!isLoading && !isError && !products.length ? (
          <div className="collector-empty">
            <p>No favorites yet.</p>
            <Link className="btn btn--soft" to="/discover">
              Discover objects
            </Link>
          </div>
        ) : null}

        {products.length ? (
          <div className="object-grid object-grid--discover">
            {products.map((product) => (
              <div className="collector-card" key={product.id}>
                <ObjectCard object={product} />
                <button
                  type="button"
                  className="quiet-action collector-card__action"
                  onClick={() => removeFavorite(product.id)}
                >
                  Remove favorite
                </button>
              </div>
            ))}
          </div>
        ) : null}

        {recent.length ? (
          <section className="collector-section" aria-labelledby="recently-viewed-title">
            <h2 id="recently-viewed-title" className="product-section__title">
              Recently viewed
            </h2>
            <div className="object-grid object-grid--discover">
              {recent.map((product) => (
                <ObjectCard key={product.id} object={product} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
