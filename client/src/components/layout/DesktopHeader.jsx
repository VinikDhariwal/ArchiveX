import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { navLinks } from '../../data/demoData.js';
import { clientConfig } from '../../config/clientConfig.js';
import { selectAuthUser, selectIsAuthenticated } from '../../features/auth/authSlice.js';

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16.5 16.5 21 21" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="9" r="3.25" />
      <path d="M5.5 19.5c1.6-3 4-4.5 6.5-4.5s4.9 1.5 6.5 4.5" />
    </svg>
  );
}

export default function DesktopHeader() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectAuthUser);

  return (
    <header className="desktop-header" aria-label="Primary">
      <Link className="brand-mark" to="/">
        {clientConfig.appName}
      </Link>
      <nav aria-label="Desktop">
        <ul className="nav-links">
          {navLinks.map((link) => (
            <li key={link.href + link.label}>
              <Link to={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="header-actions">
        <Link className="icon-btn" to="/search" aria-label="Search">
          <SearchIcon />
        </Link>
        {isAuthenticated ? (
          <Link className="icon-btn" to="/account" aria-label={`Account for ${user?.name || 'collector'}`}>
            <ProfileIcon />
          </Link>
        ) : (
          <Link className="link-cta" to="/login">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
