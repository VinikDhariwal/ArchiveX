import { Suspense } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clientConfig } from '../config/clientConfig.js';
import PageSkeleton from '../components/feedback/PageSkeleton.jsx';
import Footer from '../components/layout/Footer.jsx';
import { RequireAdmin } from '../components/auth/RequireAuth.jsx';
import { useLogoutMutation } from '../app/api.js';

const adminNav = [
  { label: 'Overview', to: '/admin', end: true },
  { label: 'Home', to: '/admin/home' },
  { label: 'Approvals', to: '/admin/approvals' },
  { label: 'Products', to: '/admin/products' },
  { label: 'Brands', to: '/admin/brands' },
  { label: 'Categories', to: '/admin/categories' },
  { label: 'Articles', to: '/admin/articles' },
  { label: 'Media', to: '/admin/media' },
  { label: 'Users', to: '/admin/users' },
  { label: 'Audit', to: '/admin/audit' },
  { label: 'Analytics', to: '/admin/analytics' },
];

/** Admin layout — requires editor/moderator/admin/superadmin role. */
export default function AdminLayout() {
  const navigate = useNavigate();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  async function handleSignOut() {
    try {
      await logout().unwrap();
    } catch {
      /* credentials cleared in mutation finally */
    }
    navigate('/admin/login', { replace: true });
  }

  return (
    <RequireAdmin>
      <div className="page-shell admin-shell">
        <header className="admin-shell__header">
          <div className="admin-shell__header-inner">
            <Link className="admin-shell__brand" to="/admin">
              <span className="admin-shell__brand-mark">{clientConfig.appName}</span>
              <span className="admin-shell__brand-tag">Admin</span>
            </Link>
            <nav aria-label="Admin">
              <ul className="admin-shell__nav">
                {adminNav.map((item) => (
                  <li key={item.to}>
                    <NavLink to={item.to} end={Boolean(item.end)}>
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="admin-shell__actions">
              <Link className="link-cta link-cta--muted" to="/">
                Back to site
              </Link>
              <button
                type="button"
                className="quiet-action"
                disabled={isLoggingOut}
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </div>
          </div>
        </header>
        <Suspense fallback={<PageSkeleton variant="admin" />}>
          <Outlet />
        </Suspense>
        <Footer />
      </div>
    </RequireAdmin>
  );
}
