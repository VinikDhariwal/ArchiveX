import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetFavoritesQuery } from '../../app/api.js';
import { selectIsAuthenticated } from '../../features/auth/authSlice.js';
import {
  clearFavorites,
  setFavoriteIds,
  selectFavoritesHydrated,
} from '../../features/favorites/favoriteSlice.js';

/** Sync server favorites into the local slice when a collector is signed in. */
export default function FavoriteHydrator() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const hydrated = useSelector(selectFavoritesHydrated);
  const { data: favorites, isSuccess } = useGetFavoritesQuery(undefined, {
    skip: !isAuthenticated,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      if (hydrated) dispatch(clearFavorites());
      return;
    }
    if (isSuccess && Array.isArray(favorites)) {
      dispatch(setFavoriteIds(favorites.map((row) => row.product?.id).filter(Boolean)));
    }
  }, [dispatch, favorites, hydrated, isAuthenticated, isSuccess]);

  return null;
}
