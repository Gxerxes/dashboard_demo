// =================================================================
// Authentication Module
// =================================================================
// Responsibilities:
// - OIDC Authorization Code + PKCE flow
// - Token management (access, refresh, id tokens)
// - Session management
// - Login / Logout
// - Token refresh
// - Auth state management via Redux
// =================================================================

export { AuthProvider } from './AuthProvider';
export { useAuth } from './useAuth';
export { authSlice, authActions, authReducer } from './authSlice';
export { authMiddleware } from './authMiddleware';
export { tokenManager } from './tokenManager';
export { sessionManager } from './sessionManager';
export type { AuthService } from './authService';
export { createAuthService } from './authService';