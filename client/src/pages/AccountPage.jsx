import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { selectAuthUser, selectIsAdmin } from '../features/auth/authSlice.js';
import { useLogoutMutation } from '../app/api.js';

export default function AccountPage() {
  const user = useSelector(selectAuthUser);
  const isAdmin = useSelector(selectIsAdmin);
  const [logout, { isLoading }] = useLogoutMutation();
  useDocumentTitle('Account');

  if (!user) return null;

  return (
    <main className="account-page">
      <div className="section-inner account-page__inner">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Account' }]} />
        <header className="page-head">
          <p className="meta">Collector account</p>
          <h1 className="display page-head__title">{user.name}</h1>
          <p className="page-lede">{user.email}</p>
        </header>

        <div className="featured-object__meta-row">
          <span>{user.role}</span>
          <span>{user.status}</span>
        </div>

        <div className="featured-object__actions" style={{ marginTop: '1.5rem' }}>
          <Link className="link-cta" to="/favorites">
            Favorites
          </Link>
          <Link className="link-cta link-cta--muted" to="/collections">
            Collections
          </Link>
          <Link className="link-cta link-cta--muted" to="/compare">
            Compare
          </Link>
          {isAdmin ? (
            <Link className="link-cta link-cta--muted" to="/admin">
              Admin
            </Link>
          ) : null}
          <button
            type="button"
            className="quiet-action"
            disabled={isLoading}
            onClick={() => logout()}
          >
            Sign out
          </button>
        </div>
      </div>
    </main>
  );
}
