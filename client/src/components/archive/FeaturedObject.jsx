import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectIsFavorite, toggleFavorite } from '../../features/favorites/favoriteSlice.js';
import { getPrimaryImage } from '../../data/demoData.js';

export default function FeaturedObject({
  object,
  eyebrow,
  sectionId,
  flipped = false,
  onToggleCompare,
  isCompared,
}) {
  const dispatch = useDispatch();
  const favorited = useSelector(selectIsFavorite(object.id));
  const primary = getPrimaryImage(object);

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
        <Link to={`/products/${object.slug}`} aria-label={`View ${object.name}`}>
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
          <Link to={`/products/${object.slug}`}>{object.name}</Link>
        </h2>
        <p>{object.shortDescription}</p>
        <div className="featured-object__meta-row">
          <span>{object.brand}</span>
          <span>{object.productType}</span>
          <span>{object.year}</span>
          <span className="rarity">{object.rarity}</span>
        </div>
        <div className="featured-object__actions">
          <Link className="link-cta" to={`/products/${object.slug}`}>
            View object →
          </Link>
          <span className="quiet-action-group">
            <button
              type="button"
              className={`quiet-action ${favorited ? 'is-active' : ''}`}
              aria-pressed={favorited}
              onClick={() => dispatch(toggleFavorite(object.id))}
            >
              {favorited ? 'Saved' : 'Save'}
            </button>
            <span className="quiet-action__divider" aria-hidden="true" />
            <button
              type="button"
              className={`quiet-action ${isCompared ? 'is-active' : ''}`}
              aria-pressed={isCompared}
              onClick={() => onToggleCompare(object.id)}
            >
              {isCompared ? 'In compare' : 'Compare'}
            </button>
          </span>
        </div>
      </div>
    </section>
  );
}
