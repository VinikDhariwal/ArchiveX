import { combineReducers } from '@reduxjs/toolkit';
import { api } from './api.js';

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
});

export default rootReducer;
