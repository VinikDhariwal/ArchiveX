import { Link } from 'react-router-dom';
import { getPrimaryImage, getPublisher } from '../../utils/archiveObject.js';

export default function ObjectCard({ object }) {
  const primary = getPrimaryImage(object);
  const publisher = getPublisher(object);
  const href = object.slug ? `/products/${object.slug}` : '/discover';

  if (!primary) return null;

  return (
    <article className="object-card" data-type={object.productType}>
      <Link
        className="object-card__surface object-card__surface--button object-card__surface--link"
        to={href}
        aria-label={`Open full archive page for ${object.name}`}
      >
        <div className="object-card__media" aria-hidden="true">
          <img
            src={primary.url}
            alt=""
            loading="lazy"
            style={{ objectPosition: primary.objectPosition || 'center' }}
          />
        </div>
        <div className="object-card__body">
          <span className="object-card__badge">{object.productType}</span>
          <p className="meta">
            {object.brand} · {object.year}
          </p>
          <h3>{object.name}</h3>
          <p>{object.shortDescription}</p>
        </div>
      </Link>
      <div className="object-card__actions">
        <Link className="btn btn--soft" to={href}>
          Details
        </Link>
        <span className="object-card__publisher" title="Publisher">
          {publisher}
        </span>
      </div>
    </article>
  );
}
