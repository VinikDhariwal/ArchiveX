import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getPrimaryImage, getPublisher } from '../../utils/archiveObject.js';
import { formatProductType } from '../../utils/formatProductType.js';
import {
  selectIsCompared,
  toggleCompare,
  MAX_COMPARE_ITEMS,
} from '../../features/compare/compareSlice.js';

export default function ObjectCard({ object }) {
  const dispatch = useDispatch();
  const primary = getPrimaryImage(object);
  const publisher = getPublisher(object);
  const href = object.slug ? `/products/${object.slug}` : '/discover';
  const isCompared = useSelector(selectIsCompared(object.id));

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
          <span className="object-card__badge">{formatProductType(object.productType)}</span>
          <p className="meta">
            {object.brand} · {object.year}
          </p>
          <h3>{object.name}</h3>
          <p>{object.shortDescription}</p>
        </div>
      </Link>
      <div className="object-card__actions">
        <Link className="btn" to={href}>
          Details
        </Link>
        <button
          type="button"
          className={`btn btn--soft ${isCompared ? 'is-active is-compared' : ''}`}
          aria-pressed={isCompared}
          title={
            isCompared
              ? 'Remove from compare'
              : `Add to compare (up to ${MAX_COMPARE_ITEMS})`
          }
          onClick={() => dispatch(toggleCompare(object.id))}
        >
          {isCompared ? 'In compare' : 'Compare'}
        </button>
        <span className="object-card__publisher" title="Publisher">
          {publisher}
        </span>
      </div>
    </article>
  );
}
