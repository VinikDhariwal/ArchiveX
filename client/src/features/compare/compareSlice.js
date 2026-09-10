import { createSlice } from '@reduxjs/toolkit';

const MAX_COMPARE = 4;

const compareSlice = createSlice({
  name: 'compare',
  initialState: {
    ids: [],
  },
  reducers: {
    toggleCompare(state, action) {
      const id = action.payload;
      if (state.ids.includes(id)) {
        state.ids = state.ids.filter((item) => item !== id);
        return;
      }
      if (state.ids.length >= MAX_COMPARE) {
        state.ids = [...state.ids.slice(1), id];
        return;
      }
      state.ids.push(id);
    },
    removeCompare(state, action) {
      state.ids = state.ids.filter((item) => item !== action.payload);
    },
    clearCompare(state) {
      state.ids = [];
    },
  },
});

export const { toggleCompare, removeCompare, clearCompare } = compareSlice.actions;
export const selectCompareIds = (state) => state.compare.ids;
export const selectIsCompared = (id) => (state) => state.compare.ids.includes(id);
export const MAX_COMPARE_ITEMS = MAX_COMPARE;
export default compareSlice.reducer;
