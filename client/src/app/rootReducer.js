import { combineReducers } from '@reduxjs/toolkit';
import { api } from './api.js';
import favoritesReducer from '../features/favorites/favoriteSlice.js';
import authReducer from '../features/auth/authSlice.js';
import discoverFiltersReducer from '../features/discover/filterSlice.js';
import compareReducer from '../features/compare/compareSlice.js';

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  favorites: favoritesReducer,
  auth: authReducer,
  discoverFilters: discoverFiltersReducer,
  compare: compareReducer,
});

export default rootReducer;
