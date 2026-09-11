import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import rootReducer from './rootReducer.js';
import { api } from './api.js';
import { clearCredentials } from '../features/auth/authSlice.js';

// When a session ends (logout, account deletion, refresh failure), wipe the
// RTK Query cache so the next account never sees the previous account's
// favorites, collections, or admin data.
const sessionListener = createListenerMiddleware();
sessionListener.startListening({
  actionCreator: clearCredentials,
  effect: (_action, { dispatch, getOriginalState }) => {
    const hadSession = Boolean(getOriginalState().auth?.accessToken);
    if (hadSession) {
      dispatch(api.util.resetApiState());
    }
  },
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(sessionListener.middleware).concat(api.middleware),
  devTools: import.meta.env.MODE !== 'production',
});

setupListeners(store.dispatch);

export default store;
