import { beforeEach, describe, expect, it } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  clearCredentials,
  selectIsAdmin,
  selectIsAuthenticated,
  setCredentials,
} from './authSlice.js';

function createAuthStore() {
  return configureStore({
    reducer: { auth: authReducer },
  });
}

describe('authSlice', () => {
  beforeEach(() => {
    const store = {};
    globalThis.localStorage = {
      getItem: (key) => (Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null),
      setItem: (key, value) => {
        store[key] = String(value);
      },
      removeItem: (key) => {
        delete store[key];
      },
      clear: () => {
        Object.keys(store).forEach((key) => delete store[key]);
      },
    };
  });

  it('marks the session authenticated when credentials are set', () => {
    const store = createAuthStore();
    store.dispatch(
      setCredentials({
        user: { id: '1', email: 'a@test.local', role: 'user' },
        accessToken: 'token-123',
      })
    );

    const state = store.getState();
    expect(selectIsAuthenticated(state)).toBe(true);
    expect(selectIsAdmin(state)).toBe(false);
    expect(localStorage.getItem('archivex_access_token')).toBe('token-123');
  });

  it('recognizes staff roles as admin-capable', () => {
    const store = createAuthStore();
    store.dispatch(
      setCredentials({
        user: { id: '2', email: 'admin@test.local', role: 'editor' },
        accessToken: 'staff-token',
      })
    );
    expect(selectIsAdmin(store.getState())).toBe(true);
  });

  it('clears credentials and storage on logout', () => {
    const store = createAuthStore();
    store.dispatch(
      setCredentials({
        user: { id: '1', email: 'a@test.local', role: 'user' },
        accessToken: 'token-123',
      })
    );
    store.dispatch(clearCredentials());

    const state = store.getState();
    expect(selectIsAuthenticated(state)).toBe(false);
    expect(state.auth.user).toBeNull();
    expect(localStorage.getItem('archivex_access_token')).toBeNull();
  });
});
