import { Link } from 'react-router-dom';

export default function DomainPaths({ domains, head }) {
  const meta = head?.meta || 'The chambers';
  const title = head?.title || 'Explore domain by domain.';
  const lede =
    head?.lede ||
    'Cars and motorcycles lead the archive. Watches remain a fully supported second chamber.';
  const feedCtaLabel = head?.feedCtaLabel || 'View the full feed';
  const feedCtaHref = head?.feedCtaHref || '/discover';

  return (
    <section className="domain-paths" id="domains" aria-labelledby="domains-title" data-reveal>
      <div className="domain-paths__head">
        <div>
          <p className="meta">{meta}</p>
          <span className="hairline" aria-hidden="true" />
          <h2 id="domains-title" className="display">
            {title}
          </h2>
          <p className="domain-paths__lede">{lede}</p>
        </div>
        <Link className="btn btn--soft" to={feedCtaHref}>
          {feedCtaLabel}
        </Link>
      </div>

      <div className="domain-paths__grid">
        {domains.map((domain) => (
          <Link
            key={domain.id}
            className="domain-path"
            data-domain={domain.id}
            to={domain.href}
          >
            <div className="domain-path__media" aria-hidden="true">
              <img
                src={domain.image.url}
                alt=""
                width={domain.image.width}
                height={domain.image.height}
                loading="lazy"
              />
            </div>
            <div className="domain-path__panel">
              <span className="domain-path__tag">{domain.label}</span>
              <h3>{domain.title}</h3>
              <p>{domain.summary}</p>
              <span className="domain-path__cta">Enter chamber →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
