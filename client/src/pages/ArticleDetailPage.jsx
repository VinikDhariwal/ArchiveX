import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import MuseumFrame from '../components/archive/MuseumFrame.jsx';
import ObjectCard from '../components/archive/ObjectCard.jsx';
import LoadingState from '../components/feedback/LoadingState.jsx';
import ErrorState from '../components/feedback/ErrorState.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useGetArticleBySlugQuery } from '../app/api.js';

function formatPublishedAt(value) {
  if (!value) return null;
  try {
    return new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(value));
  } catch {
    return null;
  }
}

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const { data: article, isLoading, isError, refetch } = useGetArticleBySlugQuery(slug, {
    skip: !slug,
  });

  useDocumentTitle(article?.title || (isLoading ? 'Loading…' : 'Missing essay'));

  if (isLoading) {
    return (
      <main className="journal-page">
        <div className="section-inner journal-page__inner">
          <LoadingState />
        </div>
      </main>
    );
  }

  if (isError || !article) {
    return (
      <main className="journal-page">
        <div className="section-inner journal-page__inner">
          <Breadcrumbs
            items={[
              { label: 'Home', to: '/' },
              { label: 'Journal', to: '/journal' },
              { label: 'Missing' },
            ]}
          />
          <header className="page-head">
            <p className="meta">Missing essay</p>
            <h1 className="display page-head__title">This article is not in the public journal</h1>
          </header>
          {isError ? <ErrorState message="Could not load this essay." onRetry={refetch} /> : null}
          <p className="route-shell__actions">
            <Link className="btn btn--soft" to="/journal">
              Back to journal
            </Link>
          </p>
        </div>
      </main>
    );
  }

  const published = formatPublishedAt(article.publishedAt);
  const related = article.relatedProducts || [];

  return (
    <main className="article-detail">
      <div className="section-inner article-detail__inner">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Journal', to: '/journal' },
            { label: article.title },
          ]}
        />

        <header className="article-detail__head">
          <p className="meta">{article.type || 'Essay'}</p>
          <h1 className="display article-detail__title">{article.title}</h1>
          <p className="article-detail__lede">{article.excerpt}</p>
          <p className="article-detail__byline">
            <span>{article.byline || 'ArchiveX Editorial'}</span>
            {published ? <span aria-hidden="true"> · </span> : null}
            {published ? <time dateTime={article.publishedAt}>{published}</time> : null}
          </p>
        </header>

        {article.image?.url ? (
          <div className="article-detail__hero">
            <MuseumFrame>
              <img
                src={article.image.url}
                alt={article.image.alt || article.title}
                width={article.image.width || 1200}
                height={article.image.height || 750}
              />
            </MuseumFrame>
          </div>
        ) : null}

        <div className="article-detail__body">
          {(article.sections || []).map((section, index) => (
            <section key={`${section.heading || 'section'}-${index}`} className="article-section">
              {section.heading ? <h2 className="article-section__title">{section.heading}</h2> : null}
              {String(section.body || '')
                .split(/\n\n+/)
                .filter(Boolean)
                .map((paragraph) => (
                  <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                ))}
            </section>
          ))}
        </div>

        {related.length ? (
          <section className="article-detail__related" aria-labelledby="article-related-title">
            <h2 id="article-related-title" className="product-section__title">
              Related objects
            </h2>
            <div className="object-grid object-grid--discover">
              {related.map((product) => (
                <ObjectCard key={product.id} object={product} />
              ))}
            </div>
          </section>
        ) : null}

        <p className="article-detail__footer">
          <Link className="btn btn--soft" to="/journal">
            All journal essays
          </Link>
        </p>
      </div>
    </main>
  );
}
