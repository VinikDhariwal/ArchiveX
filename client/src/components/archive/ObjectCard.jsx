import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getPrimaryImage } from '../../utils/archiveObject.js';
import { formatProductType } from '../../utils/formatProductType.js';
import {
  selectIsCompared,
  toggleCompare,
  MAX_COMPARE_ITEMS,
} from '../../features/compare/compareSlice.js';

export default function ObjectCard({ object }) {
  const dispatch = useDispatch();
  const primary = getPrimaryImage(object);
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
          <p className="meta object-card__meta">
            {formatProductType(object.productType, { singular: true })}
            {object.brand ? ` · ${object.brand}` : ''}
            {object.year ? ` · ${object.year}` : ''}
          </p>
          <h3>{object.name}</h3>
          {object.shortDescription ? <p>{object.shortDescription}</p> : null}
        </div>
      </Link>
      <div className="object-card__actions">
        <Link className="object-card__primary" to={href}>
          View object →
        </Link>
        <button
          type="button"
          className={`quiet-action ${isCompared ? 'is-active is-compared' : ''}`}
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
      </div>
    </article>
  );
}
