import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function LoadingPage({ label = 'Loading the archive' }) {
  useDocumentTitle('Loading');

  return (
    <main className="state-page" aria-busy="true" aria-live="polite">
      <div className="state-page__inner">
        <p className="meta">Please wait</p>
        <span className="hairline" aria-hidden="true" />
        <h1 className="display state-page__title">{label}</h1>
        <p className="state-page__copy">Preparing the next chamber of the collection.</p>
      </div>
    </main>
  );
}
