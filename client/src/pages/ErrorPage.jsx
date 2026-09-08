import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function ErrorPage({ error, onRetry }) {
  useDocumentTitle('Error');

  return (
    <main className="state-page" role="alert">
      <div className="state-page__inner">
        <p className="meta">Something went wrong</p>
        <span className="hairline" aria-hidden="true" />
        <h1 className="display state-page__title">The archive could not open this page</h1>
        <p className="state-page__copy">
          {error?.message || 'An unexpected error interrupted the view. Try again, or return to the landing hall.'}
        </p>
        <p className="state-page__actions">
          {typeof onRetry === 'function' ? (
            <button type="button" className="link-cta" onClick={onRetry}>
              Try again
            </button>
          ) : null}
          <Link className="link-cta link-cta--muted" to="/">
            Return home
          </Link>
        </p>
      </div>
    </main>
  );
}
