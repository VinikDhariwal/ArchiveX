import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import ObjectCard from '../components/archive/ObjectCard.jsx';
import LoadingState from '../components/feedback/LoadingState.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { selectAuthUser, selectIsAdmin } from '../features/auth/authSlice.js';
import { selectCompareIds } from '../features/compare/compareSlice.js';
import {
  useGetCollectionsQuery,
  useGetFavoritesQuery,
  useGetRecentlyViewedQuery,
} from '../app/api.js';
import { getSessionKey } from '../utils/productDetail.js';

export default function AccountPage() {
  const user = useSelector(selectAuthUser);
  const isAdmin = useSelector(selectIsAdmin);
  const compareIds = useSelector(selectCompareIds);
  const { data: favorites = [], isLoading: favoritesLoading } = useGetFavoritesQuery();
  const { data: collections = [] } = useGetCollectionsQuery();
  const { data: recent = [] } = useGetRecentlyViewedQuery({
    sessionKey: getSessionKey(),
    limit: 8,
  });

  useDocumentTitle('Profile');

  if (!user) return null;

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.name;
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

  const favoriteProducts = favorites.map((row) => row.product).filter(Boolean);
  const deskProducts = favoriteProducts.length ? favoriteProducts : recent;
  const deskLabel = favoriteProducts.length ? 'Saved favorites' : 'Recently viewed';

  const stats = [
    { label: 'Favorites', value: favorites.length, to: '/favorites' },
    { label: 'Collections', value: collections.length, to: '/collections' },
    { label: 'Compare', value: compareIds.length, to: '/compare' },
  ];

  return (
    <main className="account-page account-page--desk">
      <div className="section-inner account-page__desk">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Profile' }]} />

        <div className="account-page__layout">
          <aside className="account-profile" aria-label="Collector profile">
            <div className="account-profile__avatar" aria-hidden="true">
              {initials || 'A'}
            </div>

            <div className="account-profile__body">
              <p className="meta">Collector profile</p>
              <h1 className="display account-profile__name">{displayName}</h1>
              {user.username ? (
                <p className="account-profile__handle">@{user.username}</p>
              ) : null}
              <p className="account-profile__email">{user.email}</p>
              {isAdmin ? <p className="account-profile__role">Staff · {user.role}</p> : null}

              <ul className="account-profile__stats">
                {stats.map((stat) => (
                  <li key={stat.label}>
                    <Link to={stat.to} className="account-profile__stat">
                      <span className="account-profile__stat-value">{stat.value}</span>
                      <span className="account-profile__stat-label">{stat.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="account-profile__actions">
                <Link className="btn btn--soft" to="/contribute">
                  Contribute
                </Link>
                <Link className="btn btn--soft" to="/account/submissions">
                  My submissions
                </Link>
                <Link className="btn btn--soft" to="/favorites">
                  Favorites
                </Link>
                <Link className="btn btn--soft" to="/collections">
                  Collections
                </Link>
                <Link className="btn btn--soft" to="/compare">
                  Compare
                </Link>
                {isAdmin ? (
                  <Link className="btn btn--soft" to="/admin">
                    Admin
                  </Link>
                ) : null}
              </div>
            </div>
          </aside>

          <section className="account-desk" aria-labelledby="account-desk-title">
            <header className="account-desk__head">
              <div>
                <p className="meta">Your desk</p>
                <h2 id="account-desk-title" className="account-desk__title">
                  {deskLabel}
                </h2>
              </div>
              <Link className="link-cta link-cta--muted" to="/favorites">
                Open all
              </Link>
            </header>

            {favoritesLoading ? <LoadingState /> : null}

            {!favoritesLoading && !deskProducts.length ? (
              <div className="account-desk__empty">
                <p>No saved plates yet. Discover objects and mark favorites to fill this desk.</p>
                <Link className="btn btn--soft" to="/discover">
                  Discover
                </Link>
              </div>
            ) : null}

            {deskProducts.length ? (
              <div className="object-grid object-grid--discover account-desk__grid">
                {deskProducts.map((product) => (
                  <ObjectCard key={product.id} object={product} />
                ))}
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
