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

export default function ComparisonTray() {
  const dispatch = useDispatch();
  const ids = useSelector(selectCompareIds);
  const { data } = useGetProductsQuery(
    { ids: ids.join(','), limit: MAX_COMPARE_ITEMS },
    { skip: !ids.length }
  );

  const byId = new Map((data?.items || []).map((item) => [item.id, item]));
  const items = ids.map((id) => byId.get(id)).filter(Boolean);
  const visible = ids.length > 0;

  return (
    <div
      className={`compare-tray ${visible ? 'is-visible' : ''}`}
      role="region"
      aria-label="Comparison tray"
      aria-hidden={!visible}
      // The tray is hidden with a transform, so its buttons stay in the tab
      // order; inert removes them for keyboard/AT users while hidden.
      inert={!visible}
    >
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
        {Array.from({ length: Math.max(0, MAX_COMPARE_ITEMS - ids.length) }).map((_, index) => (
          <div className="compare-tray__slot" key={`empty-${index}`} aria-hidden="true">
            <span>Empty</span>
          </div>
        ))}
      </div>
      <div className="compare-tray__actions">
        <span className="compare-tray__count">
          {ids.length}/{MAX_COMPARE_ITEMS}
        </span>
        <button type="button" className="quiet-action" onClick={() => dispatch(clearCompare())}>
          Clear
        </button>
        <Link
          className="btn btn--soft compare-tray__cta"
          to="/compare"
          aria-disabled={items.length < 2}
          onClick={(event) => {
            if (items.length < 2) event.preventDefault();
          }}
        >
          Compare
        </Link>
      </div>
    </div>
  );
}
