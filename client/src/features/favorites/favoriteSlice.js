import { createSlice } from '@reduxjs/toolkit';

const favoriteSlice = createSlice({
  name: 'favorites',
  initialState: {
    ids: [],
    hydrated: false,
  },
  reducers: {
    setFavoriteIds(state, action) {
      state.ids = Array.isArray(action.payload) ? action.payload.map(String) : [];
      state.hydrated = true;
    },
    toggleFavorite(state, action) {
      const id = String(action.payload);
      if (state.ids.includes(id)) {
        state.ids = state.ids.filter((item) => item !== id);
      } else {
        state.ids.push(id);
      }
    },
    clearFavorites(state) {
      state.ids = [];
      state.hydrated = false;
    },
  },
});

export const { setFavoriteIds, toggleFavorite, clearFavorites } = favoriteSlice.actions;
export const selectFavoriteIds = (state) => state.favorites.ids;
export const selectIsFavorite = (id) => (state) => state.favorites.ids.includes(String(id));
export const selectFavoritesHydrated = (state) => state.favorites.hydrated;
export default favoriteSlice.reducer;
