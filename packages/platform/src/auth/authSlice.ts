import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, UserProfile } from '../types';

const initialState: AuthState = {
  isAuthenticated: false,
  isInitialized: false,
  isLoading: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  idToken: null,
  expiresAt: null,
  error: null,
};

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const storedUser = sessionStorage.getItem('auth_user');
      const storedAccessToken = sessionStorage.getItem('auth_access_token');
      const storedRefreshToken = sessionStorage.getItem('auth_refresh_token');
      const storedIdToken = sessionStorage.getItem('auth_id_token');
      const storedExpiresAt = sessionStorage.getItem('auth_expires_at');

      if (storedUser && storedAccessToken) {
        return {
          user: JSON.parse(storedUser) as UserProfile,
          accessToken: storedAccessToken,
          refreshToken: storedRefreshToken,
          idToken: storedIdToken,
          expiresAt: storedExpiresAt ? Number(storedExpiresAt) : null,
        };
      }
      return null;
    } catch (error) {
      return rejectWithValue('Failed to initialize auth');
    }
  },
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthState(state, action: PayloadAction<Partial<AuthState>>) {
      Object.assign(state, action.payload);
    },
    setUser(state, action: PayloadAction<UserProfile | null>) {
      state.user = action.payload;
      state.isAuthenticated = action.payload !== null;
      if (action.payload) {
        sessionStorage.setItem('auth_user', JSON.stringify(action.payload));
      } else {
        sessionStorage.removeItem('auth_user');
      }
    },
    setTokens(
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string | null;
        idToken: string | null;
        expiresAt: number;
      }>,
    ) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.idToken = action.payload.idToken;
      state.expiresAt = action.payload.expiresAt;

      sessionStorage.setItem('auth_access_token', action.payload.accessToken);
      if (action.payload.refreshToken) {
        sessionStorage.setItem('auth_refresh_token', action.payload.refreshToken);
      }
      if (action.payload.idToken) {
        sessionStorage.setItem('auth_id_token', action.payload.idToken);
      }
      sessionStorage.setItem('auth_expires_at', String(action.payload.expiresAt));
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<{ code: string; message: string; detail?: string } | null>) {
      state.error = action.payload;
    },
    clearAuth(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.idToken = null;
      state.expiresAt = null;
      state.error = null;

      sessionStorage.removeItem('auth_user');
      sessionStorage.removeItem('auth_access_token');
      sessionStorage.removeItem('auth_refresh_token');
      sessionStorage.removeItem('auth_id_token');
      sessionStorage.removeItem('auth_expires_at');
    },
    setInitialized(state) {
      state.isInitialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
          state.idToken = action.payload.idToken;
          state.expiresAt = action.payload.expiresAt;
          state.isAuthenticated = true;
        }
        state.isLoading = false;
        state.isInitialized = true;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.error = { code: 'AUTH_INIT_ERROR', message: 'Failed to initialize authentication' };
      });
  },
});

export const authActions = authSlice.actions;
export const authReducer = authSlice.reducer;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;