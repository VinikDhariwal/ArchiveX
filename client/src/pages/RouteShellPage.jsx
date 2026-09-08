import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

/**
 * Structural route shell for destinations not yet fully implemented.
 * Keeps Ivory Museum typography and wide website composition.
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
    <main className="section-pad route-shell">
      <div className="section-inner route-shell__inner">
        {breadcrumbs.length ? <Breadcrumbs items={breadcrumbs} /> : null}
        <p className="meta">{eyebrow}</p>
        <span className="hairline" aria-hidden="true" />
        <h1 className="display route-shell__title">{title}</h1>
        <p className="route-shell__summary">{summary}</p>
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
