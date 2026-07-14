// =================================================================
// HKEX Post Trade Platform - Main Entry
// =================================================================

// Types
export type * from './types';

// Auth
export { AuthProvider, useAuth, authActions, authReducer, authMiddleware, tokenManager, sessionManager } from './auth';
export type { AuthService } from './auth';
export { createAuthService } from './auth';

// Router
export { RouterProvider, RouteGuard, routeRegistry, createRouteConfig, createIndexRoute, useRouteGuard } from './router';
export type { RegisteredRoute } from './router';

// Layout
export { AppLayout, Sidebar, Header, ContentArea, Breadcrumbs, TabBar, useLayout, layoutActions, layoutReducer } from './layout';
export type { LayoutState } from './layout';

// Theme
export { ThemeProvider, createAppTheme, useTheme, ThemeToggle, themeActions, themeReducer } from './theme';
export type { ThemeState } from './theme';

// State
export { createStore } from './state';
export type { RootState, AppDispatch } from './state';

// API
export { createApiClient, createApiService, useApiQuery, useApiMutation } from './api';
export type { ApiClient } from './api';

// Permission
export { PermissionProvider, usePermission, checkPermission, checkRole, checkCondition } from './permission';

// Logging
export { logger, auditLogger, performanceLogger } from './logging';
export type { LogLevel, LogEntry, LoggerConfig } from './logging';

// Notification
export { NotificationProvider, useNotification } from './notification';

// i18n
export { I18nProvider, useI18n, createI18n } from './i18n';

// Config
export { defaultConfig } from './config';

// Monitoring
export { MonitoringProvider, useMonitoring } from './monitoring';

// Feature Flags
export { FeatureFlagProvider, useFeatureFlag } from './feature-flags';

// Error Boundary
export { AppErrorBoundary } from './error-boundary';

// Loading
export { GlobalLoading, useLoading } from './loading';

// Plugin
export { PluginRegistry, usePlugin } from './plugin';

// Hooks
export { useDebounce, usePrevious, useTimeout, useInterval, useDocumentTitle, useMediaQuery } from './hooks';

// Utils
export { cn, formatDate, formatNumber, formatCurrency, truncateText, parseQueryString, buildQueryString, deepClone, isEqual } from './utils';

// Components
export { ProtectedElement, PermissionGate } from './components';