import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function UnauthorizedPage() {
  useDocumentTitle('Unauthorized');

  return (
    <main className="state-page">
      <div className="state-page__inner">
        <header className="page-head">
          <p className="meta">401 / 403</p>
          <h1 className="display page-head__title">This chamber is restricted</h1>
          <p className="page-lede">
            Your account does not have access to this area. If you believe you should, contact an
            archive administrator.
          </p>
        </header>
        <p className="state-page__actions">
          <Link className="link-cta" to="/">
            Return home
          </Link>
          <Link className="link-cta link-cta--muted" to="/account">
            Your profile
          </Link>
        </p>
      </div>
    </main>
  );
}
