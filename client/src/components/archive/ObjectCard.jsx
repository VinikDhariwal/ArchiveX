import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectIsFavorite, toggleFavorite } from '../../features/favorites/favoriteSlice.js';
import { getPrimaryImage } from '../../data/demoData.js';
import MuseumFrame from './MuseumFrame.jsx';

export default function ObjectCard({ object, wide = false, onToggleCompare, isCompared }) {
  const dispatch = useDispatch();
  const favorited = useSelector(selectIsFavorite(object.id));
  const primary = getPrimaryImage(object);

  if (!primary) return null;

  return (
    <article className={`object-card ${wide ? 'object-card--wide' : ''}`}>
      <span className="object-card__badge">{object.productType}</span>
      <Link to={`/products/${object.slug}`} className="object-card__media-link">
        <div className="object-card__media">
          <MuseumFrame>
            <img
              src={primary.url}
              alt={primary.alt}
              width={primary.width}
              height={primary.height}
              loading="lazy"
            />
          </MuseumFrame>
        </div>
      </Link>
      <div className="object-card__body">
        <p className="meta">
          {object.brand} · {object.year}
        </p>
        <h3>
          <Link to={`/products/${object.slug}`}>{object.name}</Link>
        </h3>
        <p>{object.shortDescription}</p>
        <div className="object-card__actions quiet-action-group">
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
        </div>
      </div>
    </article>
  );
}
