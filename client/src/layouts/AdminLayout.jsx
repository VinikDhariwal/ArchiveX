import { Link, Outlet } from 'react-router-dom';
import { clientConfig } from '../config/clientConfig.js';

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

/**
 * Admin layout — structural shell only.
 * No auth guards yet (Phase 6). Preserves ivory museum calm, not a dense SaaS dashboard.
 */
export default function AdminLayout() {
  return (
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
      <div className="layout-banner" role="note">
        <p className="meta">Admin shell · real authorization arrives in Phase 6 · product CRUD in Phase 13</p>
      </div>
      <Outlet />
    </div>
  );
}
