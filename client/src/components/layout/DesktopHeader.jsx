import { Link } from 'react-router-dom';
import { navLinks } from '../../data/demoData.js';
import { clientConfig } from '../../config/clientConfig.js';
import AccountMenu from './AccountMenu.jsx';

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16.5 16.5 21 21" />
    </svg>
  );
}

export default function DesktopHeader() {
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
        <AccountMenu />
      </div>
    </header>
  );
}
