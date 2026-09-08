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
        {articles.map((article, index) => (
          <article
            key={article.id}
            className={`journal-card ${index === 0 ? 'journal-card--feature' : ''}`}
          >
            <div className="journal-card__media">
              <MuseumFrame>
                <img
                  src={article.image.url}
                  alt={article.image.alt}
                  width={article.image.width}
                  height={article.image.height}
                  loading="lazy"
                />
              </MuseumFrame>
            </div>
            <p className="meta">{article.type}</p>
            <h3>{article.title}</h3>
            <p>{article.excerpt}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
