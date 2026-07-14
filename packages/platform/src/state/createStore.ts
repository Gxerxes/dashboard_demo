import { configureStore, type Middleware, type Reducer, type UnknownAction } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authReducer } from '../auth/authSlice';
import { authMiddleware } from '../auth/authMiddleware';
import { layoutReducer } from '../layout/layoutSlice';
import { themeReducer } from '../theme/themeSlice';
import { logger } from '../logging';

export interface StoreConfig {
  additionalReducers?: Record<string, Reducer>;
  additionalMiddleware?: Middleware[];
  devTools?: boolean;
}

export function createStore(config: StoreConfig = {}) {
  const rootReducer: Record<string, Reducer> = {
    auth: authReducer,
    layout: layoutReducer,
    theme: themeReducer,
    ...config.additionalReducers,
  };

  const middleware: Middleware[] = [
    authMiddleware,
    ...(config.additionalMiddleware ?? []),
  ];

  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['auth/setAuthState', 'auth/setTokens'],
          ignoredPaths: ['auth.user'],
        },
      }).concat(middleware),
    devTools: config.devTools ?? true,
  });

  setupListeners(store.dispatch);

  logger.info('Redux store initialized');

  return store;
}

export type RootState = ReturnType<ReturnType<typeof createStore>['getState']>;
export type AppDispatch = ReturnType<typeof createStore>['dispatch'];