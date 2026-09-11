import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { navLinks } from '../../data/demoData.js';
import { clientConfig } from '../../config/clientConfig.js';
import { selectIsAuthenticated } from '../../features/auth/authSlice.js';
import AccountMenu from './AccountMenu.jsx';

export default function MobileHeader({ menuOpen, onOpenMenu, onCloseMenu }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onCloseMenu();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen, onCloseMenu]);

  return (
    <>
      <header className="mobile-header" aria-label="Mobile">
        <Link className="brand-mark" to="/">
          {clientConfig.appName}
        </Link>
        <div className="header-actions">
          <AccountMenu />
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
        // The drawer is hidden by a transform, so its links stay tabbable;
        // inert removes them from keyboard/AT reach while closed.
        inert={!menuOpen}
        aria-label="Mobile navigation"
      >
        <div className="mobile-drawer__top">
          <span className="brand-mark">{clientConfig.appName}</span>
          <button type="button" className="btn btn--ghost" onClick={onCloseMenu}>
            Close
          </button>
        </div>
        <nav aria-label="Mobile">
          <Link to="/search" onClick={onCloseMenu}>
            Search
          </Link>
          {navLinks.map((link) => (
            <Link key={link.href + link.label} to={link.href} onClick={onCloseMenu}>
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <Link to="/account" onClick={onCloseMenu}>
              Profile
            </Link>
          ) : (
            <Link to="/login" onClick={onCloseMenu}>
              Log in
            </Link>
          )}
        </nav>
        <p className="demo-note">Cars and motorcycles lead the archive. Watches follow.</p>
      </div>
    </>
  );
}
