import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function NotFoundPage() {
  useDocumentTitle('Not found');

  return (
    <main className="state-page">
      <div className="state-page__inner">
        <header className="page-head">
          <p className="meta">404</p>
          <h1 className="display page-head__title">This object is not in the archive</h1>
          <p className="page-lede">The route may have moved, or the plate was never catalogued.</p>
        </header>
        <p className="state-page__actions">
          <Link className="link-cta" to="/">
            Return home
          </Link>
          <Link className="link-cta link-cta--muted" to="/discover">
            Browse discover
          </Link>
        </p>
      </div>
    </main>
  );
}
