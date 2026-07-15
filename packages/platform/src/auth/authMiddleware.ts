import type { Middleware } from '@reduxjs/toolkit';
import { authActions } from './authSlice';

export const authMiddleware: Middleware = (_store) => (next) => (action) => {
  const result = next(action);

  // Sync auth state to session storage on relevant actions
  if (authActions.setTokens.match(action)) {
    const { accessToken, refreshToken, idToken, expiresAt } = action.payload;
    sessionStorage.setItem('auth_access_token', accessToken);
    if (refreshToken) sessionStorage.setItem('auth_refresh_token', refreshToken);
    if (idToken) sessionStorage.setItem('auth_id_token', idToken);
    sessionStorage.setItem('auth_expires_at', String(expiresAt));
  }

  if (authActions.clearAuth.match(action)) {
    sessionStorage.removeItem('auth_access_token');
    sessionStorage.removeItem('auth_refresh_token');
    sessionStorage.removeItem('auth_id_token');
    sessionStorage.removeItem('auth_expires_at');
    sessionStorage.removeItem('auth_user');
  }

  return result;
};