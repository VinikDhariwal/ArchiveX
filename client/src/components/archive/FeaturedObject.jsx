import { Link } from 'react-router-dom';
import { getPrimaryImage } from '../../utils/archiveObject.js';
import { formatProductType } from '../../utils/formatProductType.js';

export default function FeaturedObject({ object, eyebrow, sectionId, flipped = false }) {
  const primary = getPrimaryImage(object);
  const href = object.slug ? `/products/${object.slug}` : '/discover';

  if (!primary) return null;

  return (
    <section
      id={sectionId}
      className={`featured-object ${flipped ? 'featured-object--flip' : ''}`}
      data-type={object.productType}
      aria-labelledby={`${sectionId}-title`}
      data-reveal
    >
      <div className="featured-object__media">
        <Link className="featured-object__media-btn" to={href} aria-label={`Open ${object.name}`}>
          <img
            src={primary.url}
            alt={primary.alt}
            width={primary.width}
            height={primary.height}
            loading="lazy"
          />
        </Link>
      </div>
      <div className="featured-object__body">
        <p className="meta">{eyebrow}</p>
        <span className="hairline" aria-hidden="true" />
        <h2 id={`${sectionId}-title`}>
          <Link className="featured-object__title-btn" to={href}>
            {object.name}
          </Link>
        </h2>
        <p>{object.shortDescription}</p>
        <div className="featured-object__meta-row">
          <span>{object.brand}</span>
          <span>{formatProductType(object.productType)}</span>
          <span>{object.year}</span>
          {object.rarity ? <span className="rarity">{object.rarity}</span> : null}
        </div>
        <div className="featured-object__actions">
          <Link className="link-cta" to={href}>
            View object →
          </Link>
        </div>
      </div>
    </section>
  );
}
