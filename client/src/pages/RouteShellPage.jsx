import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

/**
 * Structural route shell for destinations not yet fully implemented.
 * Matches Discover page typography and wide website composition.
 */
export default function RouteShellPage({
  title,
  eyebrow,
  summary,
  nextPhase,
  breadcrumbs = [],
  links = [],
}) {
  useDocumentTitle(title);

  return (
    <main className="route-shell">
      <div className="route-shell__inner">
        {breadcrumbs.length ? <Breadcrumbs items={breadcrumbs} /> : null}
        <header className="page-head">
          {eyebrow ? <p className="meta">{eyebrow}</p> : null}
          <h1 className="display page-head__title">{title}</h1>
          {summary ? <p className="page-lede">{summary}</p> : null}
        </header>
        {nextPhase ? (
          <p className="demo-note route-shell__note">Planned for {nextPhase}. Structural route shell only.</p>
        ) : null}
        <p className="route-shell__actions">
          {links.map((link) => (
            <Link key={link.to} className="link-cta" to={link.to}>
              {link.label}
            </Link>
          ))}
          <Link className="link-cta link-cta--muted" to="/">
            Back to archive
          </Link>
        </p>
      </div>
    </main>
  );
}
