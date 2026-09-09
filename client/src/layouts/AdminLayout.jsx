import { Suspense } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { clientConfig } from '../config/clientConfig.js';
import PageSkeleton from '../components/feedback/PageSkeleton.jsx';
import { RequireAdmin } from '../components/auth/RequireAuth.jsx';

const adminNav = [
  { label: 'Overview', to: '/admin' },
  { label: 'Products', to: '/admin/products' },
  { label: 'Brands', to: '/admin/brands' },
  { label: 'Categories', to: '/admin/categories' },
  { label: 'Articles', to: '/admin/articles' },
  { label: 'Users', to: '/admin/users' },
  { label: 'Audit', to: '/admin/audit' },
  { label: 'Analytics', to: '/admin/analytics' },
];

/** Admin layout — requires editor/moderator/admin/superadmin role. */
export default function AdminLayout() {
  return (
    <RequireAdmin>
      <div className="page-shell admin-shell">
        <header className="admin-shell__header">
          <div className="admin-shell__header-inner">
            <Link className="brand-mark" to="/admin">
              {clientConfig.appName} Admin
            </Link>
            <nav aria-label="Admin">
              <ul className="admin-shell__nav">
                {adminNav.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
            <Link className="link-cta" to="/">
              Back to site
            </Link>
          </div>
        </header>
        <Suspense fallback={<PageSkeleton variant="admin" />}>
          <Outlet />
        </Suspense>
      </div>
    </RequireAdmin>
  );
}
