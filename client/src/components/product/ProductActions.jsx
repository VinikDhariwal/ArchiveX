import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toggleFavorite, selectIsFavorite } from '../../features/favorites/favoriteSlice.js';

export default function ProductActions({ product }) {
  const dispatch = useDispatch();
  const isFavorite = useSelector(selectIsFavorite(product.id));

  return (
    <div className="product-actions" role="group" aria-label="Collector actions">
      <button
        type="button"
        className={`btn btn--soft ${isFavorite ? 'is-active' : ''}`}
        aria-pressed={isFavorite}
        onClick={() => dispatch(toggleFavorite(product.id))}
      >
        {isFavorite ? 'Saved' : 'Favorite'}
      </button>
      <button
        type="button"
        className="btn btn--soft"
        disabled
        title="Collections sync in Phase 9"
      >
        Collection
      </button>
      <Link className="btn btn--soft" to="/discover">
        Back to discover
      </Link>
    </div>
  );
}
