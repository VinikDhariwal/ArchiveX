import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function NotFoundPage() {
  useDocumentTitle('Not found');

  return (
    <main className="state-page">
      <div className="state-page__inner">
        <p className="meta">404</p>
        <span className="hairline" aria-hidden="true" />
        <h1 className="display state-page__title">This object is not in the archive</h1>
        <p className="state-page__copy">The route may have moved, or the plate was never catalogued.</p>
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
