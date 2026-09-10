import { Link } from 'react-router-dom';
import MuseumFrame from './MuseumFrame.jsx';

export default function JournalPreview({ articles }) {
  return (
    <section className="journal-preview" id="journal" aria-labelledby="journal-title" data-reveal>
      <div className="journal-preview__head">
        <div>
          <p className="meta">Journal</p>
          <span className="hairline" aria-hidden="true" />
          <h2 id="journal-title">Stories from the archive</h2>
        </div>
      </div>
      <div className="journal-preview__grid">
        {articles.map((article, index) => {
          const href = article.slug ? `/journal/${article.slug}` : null;
          const media = article.image?.url ? (
            <div className="journal-card__media">
              <MuseumFrame>
                <img
                  src={article.image.url}
                  alt={article.image.alt || article.title}
                  width={article.image.width || 1200}
                  height={article.image.height || 750}
                  loading="lazy"
                />
              </MuseumFrame>
            </div>
          ) : null;

          const body = (
            <>
              {media}
              <p className="meta">{article.type || 'Essay'}</p>
              <h3>{article.title}</h3>
              <p>{article.excerpt}</p>
            </>
          );

          return href ? (
            <Link
              key={article.id || article.slug}
              to={href}
              className={`journal-card journal-card--link ${index === 0 ? 'journal-card--feature' : ''}`}
            >
              {body}
            </Link>
          ) : (
            <article
              key={article.id || article.slug}
              className={`journal-card ${index === 0 ? 'journal-card--feature' : ''}`}
            >
              {body}
            </article>
          );
        })}
      </div>
    </section>
  );
}
