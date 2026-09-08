import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function UnauthorizedPage() {
  useDocumentTitle('Unauthorized');

  return (
    <main className="state-page">
      <div className="state-page__inner">
        <p className="meta">401 / 403</p>
        <span className="hairline" aria-hidden="true" />
        <h1 className="display state-page__title">This chamber is restricted</h1>
        <p className="state-page__copy">
          Authentication and role guards arrive in Phase 6. This page is the structural placeholder for denied access.
        </p>
        <p className="state-page__actions">
          <Link className="link-cta" to="/">
            Return home
          </Link>
          <Link className="link-cta link-cta--muted" to="/account">
            Account shell
          </Link>
        </p>
      </div>
    </main>
  );
}
