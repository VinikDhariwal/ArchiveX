import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  mobileFiltersOpen: false,
  draftQuery: '',
};

const filterSlice = createSlice({
  name: 'discoverFilters',
  initialState,
  reducers: {
    setMobileFiltersOpen(state, action) {
      state.mobileFiltersOpen = Boolean(action.payload);
    },
    setDraftQuery(state, action) {
      state.draftQuery = String(action.payload ?? '');
    },
    resetDiscoverUi(state) {
      state.mobileFiltersOpen = false;
      state.draftQuery = '';
    },
  },
});

export const { setMobileFiltersOpen, setDraftQuery, resetDiscoverUi } = filterSlice.actions;
export const selectMobileFiltersOpen = (state) => state.discoverFilters.mobileFiltersOpen;
export const selectDraftQuery = (state) => state.discoverFilters.draftQuery;
export default filterSlice.reducer;
