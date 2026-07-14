// =================================================================
// Core Platform Types
// =================================================================

// --- User & Auth ---
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  displayName: string;
  roles: string[];
  permissions: string[];
  department: string;
  businessUnit: string;
  avatar?: string;
  locale: string;
  timezone: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
  expiresAt: number | null;
  error: AuthError | null;
}

export interface AuthError {
  code: string;
  message: string;
  detail?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresIn: number;
  tokenType: string;
  scope: string;
}

// --- Menu & Navigation ---
export interface MenuItem {
  id: string;
  code: string;
  label: string;
  labelKey: string;
  icon?: string;
  path: string;
  parentId: string | null;
  target?: '_blank' | '_self';
  order: number;
  permissions: string[];
  children: MenuItem[];
  isGroup: boolean;
  isDivider: boolean;
  badge?: string | number;
  badgeColor?: string;
  externalLink?: string;
}

export interface Breadcrumb {
  label: string;
  labelKey: string;
  path: string;
  icon?: string;
}

export interface TabConfig {
  id: string;
  label: string;
  labelKey: string;
  path: string;
  closable: boolean;
  icon?: string;
}

// --- Permission ---
export type PermissionEffect = 'allow' | 'deny';
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'execute' | 'approve' | 'reject';
export type ResourceType = 'menu' | 'page' | 'button' | 'api' | 'data' | 'report';

export interface PermissionRule {
  id: string;
  name: string;
  description?: string;
  effect: PermissionEffect;
  actions: PermissionAction[];
  resources: string[];
  resourceType: ResourceType;
  conditions?: PermissionCondition[];
  priority: number;
}

export interface PermissionCondition {
  attribute: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains' | 'startsWith' | 'endsWith';
  value: unknown;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  permissions: string[];
  parentId: string | null;
  isSystem: boolean;
}

// --- Route ---
export interface RouteConfig {
  path: string;
  element: React.LazyExoticComponent<React.ComponentType> | React.ComponentType;
  children?: RouteConfig[];
  index?: boolean;
  guard?: RouteGuard;
  permissions?: string[];
  title?: string;
  titleKey?: string;
  layout?: 'default' | 'blank' | 'auth';
  breadcrumb?: Breadcrumb[];
  isPublic?: boolean;
  metadata?: Record<string, unknown>;
}

export interface RouteGuard {
  requiresAuth: boolean;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  redirectTo?: string;
}

// --- Theme ---
export type ThemeMode = 'light' | 'dark' | 'high-contrast';
export type ThemeDirection = 'ltr' | 'rtl';
export type Density = 'compact' | 'standard' | 'comfortable';
export type ColorScheme = 'blue' | 'green' | 'purple' | 'orange' | 'teal' | 'indigo';

export interface ThemeConfig {
  mode: ThemeMode;
  direction: ThemeDirection;
  density: Density;
  colorScheme: ColorScheme;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize: number;
  borderRadius: number;
  spacing: number;
  customTokens?: Record<string, string>;
}

// --- Notification ---
export type NotificationSeverity = 'success' | 'error' | 'warning' | 'info';
export type NotificationSource = 'system' | 'user' | 'workflow' | 'alert';

export interface Notification {
  id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  source: NotificationSource;
  timestamp: number;
  read: boolean;
  action?: {
    label: string;
    path: string;
  };
  metadata?: Record<string, unknown>;
}

// --- API ---
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  error?: ApiError;
  timestamp: number;
  requestId: string;
}

export interface ApiError {
  code: string;
  message: string;
  detail?: string;
  stack?: string;
  validationErrors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface RequestOptions {
  skipAuth?: boolean;
  showLoading?: boolean;
  showError?: boolean;
  retryCount?: number;
  timeout?: number;
  headers?: Record<string, string>;
}

// --- Feature Flags ---
export interface FeatureFlag {
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  conditions?: FeatureFlagCondition[];
  source: 'system' | 'user' | 'experiment';
}

export interface FeatureFlagCondition {
  type: 'user' | 'role' | 'percentage' | 'date' | 'custom';
  value: unknown;
}

// --- Plugin ---
export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  entryPoint: string;
  dependencies?: string[];
  permissions?: string[];
  hooks?: string[];
  config?: Record<string, unknown>;
}

export interface PluginContext {
  store: unknown;
  router: unknown;
  api: unknown;
  notification: unknown;
  logger: unknown;
  config: unknown;
}

export interface Plugin {
  manifest: PluginManifest;
  initialize(context: PluginContext): Promise<void>;
  destroy?(): Promise<void>;
  hooks?: Record<string, (...args: unknown[]) => unknown>;
}

// --- Config ---
export interface PlatformConfig {
  appName: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  api: ApiConfig;
  auth: AuthConfig;
  theme: Partial<ThemeConfig>;
  i18n: I18nConfig;
  monitoring: MonitoringConfig;
  logging: LoggingConfig;
  features: Record<string, boolean>;
  plugins: string[];
}

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryCount: number;
  retryDelay: number;
  headers: Record<string, string>;
}

export interface AuthConfig {
  authority: string;
  clientId: string;
  redirectUri: string;
  postLogoutRedirectUri: string;
  responseType: 'code';
  scope: string;
  silentRefresh: boolean;
  sessionCheck: boolean;
  maxTokenLifetime: number;
}

export interface I18nConfig {
  defaultLocale: string;
  fallbackLocale: string;
  supportedLocales: string[];
  namespace: string;
}

export interface MonitoringConfig {
  enabled: boolean;
  provider: 'sentry' | 'datadog' | 'dynatrace' | 'custom';
  dsn?: string;
  sampleRate: number;
  tracesSampleRate: number;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  enableConsole: boolean;
  enableRemote: boolean;
  batchSize: number;
  flushInterval: number;
}

// --- Event Bus ---
export type EventHandler = (...args: unknown[]) => void;

export interface EventBus {
  on(event: string, handler: EventHandler): () => void;
  off(event: string, handler: EventHandler): void;
  emit(event: string, ...args: unknown[]): void;
  once(event: string, handler: EventHandler): void;
}