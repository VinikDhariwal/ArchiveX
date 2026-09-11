import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useGetProductsQuery } from '../../app/api.js';
import {
  clearCompare,
  removeCompare,
  selectCompareIds,
  MAX_COMPARE_ITEMS,
} from '../../features/compare/compareSlice.js';
import { getPrimaryImage } from '../../utils/archiveObject.js';

/** Progressive compare dock: hidden when empty, compact at 1, tray at 2+. */
export default function ComparisonTray() {
  const dispatch = useDispatch();
  const ids = useSelector(selectCompareIds);
  const { data } = useGetProductsQuery(
    { ids: ids.join(','), limit: MAX_COMPARE_ITEMS },
    { skip: !ids.length }
  );

  const byId = new Map((data?.items || []).map((item) => [item.id, item]));
  const items = ids.map((id) => byId.get(id)).filter(Boolean);
  const count = ids.length;

  useEffect(() => {
    document.body.classList.toggle('has-compare-dock', count > 0);
    return () => document.body.classList.remove('has-compare-dock');
  }, [count]);

  if (count === 0) return null;

  if (count === 1) {
    const only = items[0];
    const label = only?.name || 'Object';
    return (
      <div className="compare-notice" role="status" aria-live="polite">
        <p className="compare-notice__text">
          Added to comparison · <strong>1 / {MAX_COMPARE_ITEMS}</strong>
          <span className="compare-notice__name">{label}</span>
        </p>
        <div className="compare-notice__actions">
          <Link className="quiet-action" to="/compare">
            View compare
          </Link>
          <button
            type="button"
            className="quiet-action"
            onClick={() => dispatch(clearCompare())}
          >
            Clear
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="compare-tray is-visible" role="region" aria-label="Comparison tray">
      <div className="compare-tray__items">
        {ids.map((id) => {
          const product = byId.get(id);
          const image = product ? getPrimaryImage(product) : null;
          return (
            <div className="compare-tray__item" key={id}>
              {image ? (
                <img src={image.url} alt="" />
              ) : (
                <span className="compare-tray__placeholder" aria-hidden="true" />
              )}
              <div className="compare-tray__meta">
                <strong>{product?.name || 'Loading…'}</strong>
                <span>{product?.brand || '—'}</span>
              </div>
              <button
                type="button"
                className="compare-tray__remove"
                aria-label={`Remove ${product?.name || 'object'} from compare`}
                onClick={() => dispatch(removeCompare(id))}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
      <div className="compare-tray__actions">
        <span className="compare-tray__count">
          {count}/{MAX_COMPARE_ITEMS}
        </span>
        <button type="button" className="quiet-action" onClick={() => dispatch(clearCompare())}>
          Clear
        </button>
        <Link className="btn compare-tray__cta" to="/compare">
          Compare
        </Link>
      </div>
    </div>
  );
}
