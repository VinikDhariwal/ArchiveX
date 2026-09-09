import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { navLinks } from '../../data/demoData.js';
import { clientConfig } from '../../config/clientConfig.js';
import { selectIsAuthenticated } from '../../features/auth/authSlice.js';

export default function MobileHeader({ menuOpen, onOpenMenu, onCloseMenu }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <>
      <header className="mobile-header" aria-label="Mobile">
        <Link className="brand-mark" to="/">
          {clientConfig.appName}
        </Link>
        <div className="header-actions">
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={onOpenMenu}
          >
            Menu
          </button>
        </div>
      </header>

      <div
        id="mobile-navigation"
        className={`mobile-drawer ${menuOpen ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!menuOpen}
        aria-label="Mobile navigation"
      >
        <div className="mobile-drawer__top">
          <span className="brand-mark">{clientConfig.appName}</span>
          <button type="button" className="btn btn--ghost" onClick={onCloseMenu}>
            Close
          </button>
        </div>
        <nav aria-label="Mobile">
          {navLinks.map((link) => (
            <Link key={link.href + link.label} to={link.href} onClick={onCloseMenu}>
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <Link to="/account" onClick={onCloseMenu}>
              Account
            </Link>
          ) : (
            <Link to="/login" onClick={onCloseMenu}>
              Sign in
            </Link>
          )}
        </nav>
        <p className="demo-note">Cars and motorcycles lead the archive. Watches follow.</p>
      </div>
    </>
  );
}
