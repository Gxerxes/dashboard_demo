import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@posttrade/platform/theme';
import { NotificationProvider } from '@posttrade/platform/notification';
import { PermissionProvider } from '@posttrade/platform/permission';
import { AppErrorBoundary } from '@posttrade/platform/error-boundary';
import { createStore } from '@posttrade/platform/state';
import { AuthProvider } from '@posttrade/platform/auth';
import { RouterProvider } from '@posttrade/platform/router';
import { defaultConfig } from '@posttrade/platform/config';
import { logger } from '@posttrade/platform/logging';
import { App } from './App';

// Initialize logger
logger.info('Clearing application starting', {
  environment: defaultConfig.environment,
  version: defaultConfig.version,
});

// Create Redux store
const store = createStore();

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <NotificationProvider>
              <AuthProvider config={defaultConfig.auth}>
                <PermissionProvider>
                  <App />
                </PermissionProvider>
              </AuthProvider>
            </NotificationProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </Provider>
    </AppErrorBoundary>
  </React.StrictMode>,
);