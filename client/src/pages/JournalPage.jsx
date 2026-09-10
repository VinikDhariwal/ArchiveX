import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import JournalPreview from '../components/archive/JournalPreview.jsx';
import LoadingState from '../components/feedback/LoadingState.jsx';
import ErrorState from '../components/feedback/ErrorState.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useGetArticlesQuery } from '../app/api.js';

export default function JournalPage() {
  const { data, isLoading, isError, refetch } = useGetArticlesQuery({ limit: 24 });
  const articles = data?.items || [];
  useDocumentTitle('Journal');

  return (
    <main className="journal-page">
      <div className="section-inner journal-page__inner">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Journal' },
          ]}
        />
        <header className="page-head">
          <p className="meta">Editorial archive</p>
          <h1 className="display page-head__title">Journal</h1>
          <p className="page-lede">
            Essays, model histories, and design studies from the quieter side of collecting —
            cars and motorcycles first, watches in careful secondary light.
          </p>
        </header>

        {isLoading ? <LoadingState /> : null}
        {isError ? <ErrorState message="Could not load journal essays." onRetry={refetch} /> : null}

        {!isLoading && !isError && !articles.length ? (
          <div className="collector-empty">
            <p>No published essays yet.</p>
            <Link className="btn btn--soft" to="/discover">
              Browse the archive
            </Link>
          </div>
        ) : null}

        {articles.length ? <JournalPreview articles={articles} /> : null}
      </div>
    </main>
  );
}
