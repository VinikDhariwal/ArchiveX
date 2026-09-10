import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} from '../../app/api.js';
import { selectIsAuthenticated } from '../../features/auth/authSlice.js';
import { selectIsFavorite, toggleFavorite } from '../../features/favorites/favoriteSlice.js';
import {
  selectIsCompared,
  toggleCompare,
  MAX_COMPARE_ITEMS,
} from '../../features/compare/compareSlice.js';
import AddToCollectionModal from '../collector/AddToCollectionModal.jsx';

export default function ProductActions({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isFavorite = useSelector(selectIsFavorite(product.id));
  const isCompared = useSelector(selectIsCompared(product.id));
  const [addFavorite, { isLoading: adding }] = useAddFavoriteMutation();
  const [removeFavorite, { isLoading: removing }] = useRemoveFavoriteMutation();
  const [collectionOpen, setCollectionOpen] = useState(false);

  async function handleFavorite() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${product.slug}` } });
      return;
    }
    dispatch(toggleFavorite(product.id));
    try {
      if (isFavorite) await removeFavorite(product.id).unwrap();
      else await addFavorite(product.id).unwrap();
    } catch {
      dispatch(toggleFavorite(product.id));
    }
  }

  function handleCollection() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${product.slug}` } });
      return;
    }
    setCollectionOpen(true);
  }

  return (
    <>
      <div className="product-actions" role="group" aria-label="Collector actions">
        <button
          type="button"
          className={`btn btn--soft ${isFavorite ? 'is-active' : ''}`}
          aria-pressed={isFavorite}
          disabled={adding || removing}
          onClick={handleFavorite}
        >
          {isFavorite ? 'Saved' : 'Favorite'}
        </button>
        <button type="button" className="btn btn--soft" onClick={handleCollection}>
          Collection
        </button>
        <button
          type="button"
          className={`btn btn--soft ${isCompared ? 'is-active is-compared' : ''}`}
          aria-pressed={isCompared}
          title={
            isCompared
              ? 'Remove from compare'
              : `Add to compare (up to ${MAX_COMPARE_ITEMS})`
          }
          onClick={() => dispatch(toggleCompare(product.id))}
        >
          {isCompared ? 'In compare' : 'Compare'}
        </button>
        <Link className="btn btn--soft" to="/discover">
          Back to discover
        </Link>
      </div>
      {collectionOpen ? (
        <AddToCollectionModal product={product} onClose={() => setCollectionOpen(false)} />
      ) : null}
    </>
  );
}
