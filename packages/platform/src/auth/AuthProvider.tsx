import React, { createContext, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { User } from 'oidc-client-ts';
import { createAuthService, type AuthService } from './authService';
import { authActions, initializeAuth, selectAuth } from './authSlice';
import { tokenManager } from './tokenManager';
import { sessionManager } from './sessionManager';
import type { AuthConfig, UserProfile } from '../types';
import { logger } from '../logging';

export interface AuthContextValue {
  authService: AuthService | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  handleCallback: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  user: UserProfile | null;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  config: AuthConfig;
  children: React.ReactNode;
  onAuthError?: (error: Error) => void;
}

export function AuthProvider({ config, children, onAuthError }: AuthProviderProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, isInitialized, user } = useSelector(selectAuth);
  const authServiceRef = useRef<AuthService | null>(null);

  // Initialize auth service
  useEffect(() => {
    const authService = createAuthService(config);
    authServiceRef.current = authService;
    tokenManager.initialize(authService);
    sessionManager.initialize(authService);

    // Handle OIDC events
    authService.events.addUserLoaded(async (user: User) => {
      const profile = mapUserToProfile(user);
      dispatch(authActions.setUser(profile));
      dispatch(
        authActions.setTokens({
          accessToken: user.access_token,
          refreshToken: user.refresh_token ?? null,
          idToken: user.id_token ?? null,
          expiresAt: user.expires_at ?? 0,
        }),
      );
      logger.info('User session loaded', { userId: profile.id });
    });

    authService.events.addUserUnloaded(() => {
      dispatch(authActions.clearAuth());
      logger.info('User session unloaded');
    });

    authService.events.addAccessTokenExpired(() => {
      dispatch(authActions.clearAuth());
      logger.warn('Access token expired');
    });

    authService.events.addSilentRenewError((error: Error) => {
      logger.error('Silent renew failed', error);
      onAuthError?.(error);
    });

    // Initialize auth state
    dispatch(initializeAuth());

    return () => {
      authService.stopSilentRenew();
    };
  }, [config, dispatch, onAuthError]);

  const login = useCallback(async () => {
    try {
      dispatch(authActions.setLoading(true));
      await authServiceRef.current?.signinRedirect();
    } catch (error) {
      logger.error('Login failed', error as Error);
      dispatch(
        authActions.setError({
          code: 'LOGIN_FAILED',
          message: 'Failed to initiate login',
        }),
      );
    } finally {
      dispatch(authActions.setLoading(false));
    }
  }, [dispatch]);

  const logout = useCallback(async () => {
    try {
      dispatch(authActions.setLoading(true));
      await authServiceRef.current?.signoutRedirect();
      dispatch(authActions.clearAuth());
      navigate('/login');
    } catch (error) {
      logger.error('Logout failed', error as Error);
    } finally {
      dispatch(authActions.setLoading(false));
    }
  }, [dispatch, navigate]);

  const handleCallback = useCallback(async () => {
    try {
      dispatch(authActions.setLoading(true));
      const user = await authServiceRef.current?.signinRedirectCallback();
      if (user) {
        const profile = mapUserToProfile(user);
        dispatch(authActions.setUser(profile));
        dispatch(
          authActions.setTokens({
            accessToken: user.access_token,
            refreshToken: user.refresh_token ?? null,
            idToken: user.id_token ?? null,
            expiresAt: user.expires_at ?? 0,
          }),
        );
        authServiceRef.current?.startSilentRenew();
        navigate('/', { replace: true });
      }
    } catch (error) {
      logger.error('Auth callback failed', error as Error);
      dispatch(
        authActions.setError({
          code: 'CALLBACK_FAILED',
          message: 'Failed to handle authentication callback',
        }),
      );
      navigate('/login', { replace: true });
    } finally {
      dispatch(authActions.setLoading(false));
    }
  }, [dispatch, navigate]);

  const getAccessToken = useCallback(async () => {
    try {
      const user = await authServiceRef.current?.getUser();
      if (user?.expired) {
        const renewedUser = await authServiceRef.current?.renewToken();
        return renewedUser?.access_token ?? null;
      }
      return user?.access_token ?? null;
    } catch {
      return null;
    }
  }, []);

  const contextValue: AuthContextValue = {
    authService: authServiceRef.current,
    login,
    logout,
    handleCallback,
    getAccessToken,
    isAuthenticated,
    isLoading,
    isInitialized,
    user,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

function mapUserToProfile(user: User): UserProfile {
  const profile = user.profile;
  return {
    id: profile.sub ?? '',
    username: profile.preferred_username ?? profile.email ?? '',
    email: profile.email ?? '',
    displayName: profile.name ?? profile.preferred_username ?? '',
    roles: (profile.roles as string[]) ?? [],
    permissions: (profile.permissions as string[]) ?? [],
    department: (profile.department as string) ?? '',
    businessUnit: (profile.business_unit as string) ?? '',
    avatar: profile.picture,
    locale: profile.locale ?? 'en',
    timezone: profile.zoneinfo ?? 'UTC',
  };
}