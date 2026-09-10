import { Link } from 'react-router-dom';

export default function ProductJournal({ items = [], meta = {}, isLoading }) {
  return (
    <section className="product-section" aria-labelledby="product-journal-title">
      <h2 id="product-journal-title" className="product-section__title">
        Journal coverage
      </h2>

      {isLoading ? <p className="product-section__note">Looking for essays…</p> : null}

      {!isLoading && !items.length ? (
        <p className="product-section__note">
          {meta.note || 'No journal essays are linked to this object yet.'}
        </p>
      ) : null}

      {items.length ? (
        <ul className="product-journal">
          {items.map((article) => (
            <li key={article.id || article.slug}>
              <p className="meta">{article.type || 'Essay'}</p>
              {article.slug ? (
                <Link className="product-journal__title" to={`/journal/${article.slug}`}>
                  {article.title}
                </Link>
              ) : (
                <p className="product-journal__title">{article.title}</p>
              )}
              {article.excerpt ? <p className="product-journal__excerpt">{article.excerpt}</p> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
