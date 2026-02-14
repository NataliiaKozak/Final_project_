import type { Middleware } from '@reduxjs/toolkit';
import { setUser, logout } from '../slices/authSlice';

/**
 * Middleware that syncs auth state to localStorage.
 * Keeps reducers pure (no side-effects).
 */
export const authStorageMiddleware: Middleware = () => (next) => (action) => {
  const result = next(action);

  if (setUser.match(action)) {
    localStorage.setItem('token', action.payload.token);
    localStorage.setItem('user', JSON.stringify(action.payload.user));
  }

  if (logout.match(action)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('likedPosts');
  }

  return result;
};
