import { createSlice } from '@reduxjs/toolkit';

const favoriteSlice = createSlice({
  name: 'favorites',
  initialState: {
    ids: [],
  },
  reducers: {
    toggleFavorite(state, action) {
      const id = action.payload;
      if (state.ids.includes(id)) {
        state.ids = state.ids.filter((item) => item !== id);
      } else {
        state.ids.push(id);
      }
    },
  },
});

export const { toggleFavorite } = favoriteSlice.actions;
export const selectFavoriteIds = (state) => state.favorites.ids;
export const selectIsFavorite = (id) => (state) => state.favorites.ids.includes(id);
export default favoriteSlice.reducer;
