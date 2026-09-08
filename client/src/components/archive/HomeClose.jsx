import { Link } from 'react-router-dom';

export default function HomeClose({ close }) {
  return (
    <section className="home-close" aria-labelledby="home-close-title" data-reveal>
      <div className="home-close__inner">
        <p className="meta">{close.eyebrow}</p>
        <span className="hairline" aria-hidden="true" />
        <h2 id="home-close-title" className="display home-close__title">
          {close.title}
        </h2>
        <div className="home-close__grid">
          {close.paths.map((path) => (
            <article key={path.href} className="home-close__card">
              <p className="meta">{path.label}</p>
              <h3>{path.title}</h3>
              <p>{path.summary}</p>
              <Link className="btn btn--soft" to={path.href}>
                {path.cta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
