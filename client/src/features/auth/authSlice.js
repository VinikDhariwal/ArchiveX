import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'archivex_access_token';

function readStoredToken() {
  try {
    return localStorage.getItem(STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

const initialState = {
  user: null,
  accessToken: readStoredToken(),
  status: 'idle',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.status = 'authenticated';
      try {
        if (accessToken) localStorage.setItem(STORAGE_KEY, accessToken);
        else localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
    },
    clearCredentials(state) {
      state.user = null;
      state.accessToken = null;
      state.status = 'anonymous';
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
    },
    setAuthStatus(state, action) {
      state.status = action.payload;
    },
  },
});

export const { setCredentials, clearCredentials, setAuthStatus } = authSlice.actions;
export const selectAuthUser = (state) => state.auth.user;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectIsAuthenticated = (state) => Boolean(state.auth.accessToken && state.auth.user);
export const selectIsAdmin = (state) =>
  ['admin', 'superadmin', 'moderator', 'editor'].includes(state.auth.user?.role);

export default authSlice.reducer;
