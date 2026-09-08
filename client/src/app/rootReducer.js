import { combineReducers } from '@reduxjs/toolkit';
import { api } from './api.js';
import favoritesReducer from '../features/favorites/favoriteSlice.js';

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  favorites: favoritesReducer,
});

export default rootReducer;
