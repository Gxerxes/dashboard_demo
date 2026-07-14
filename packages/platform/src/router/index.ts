// =================================================================
// Router Module
// =================================================================
// Responsibilities:
// - Route configuration management
// - Lazy loading support
// - Route guards (auth, permission-based)
// - Breadcrumb generation
// - Navigation history tracking
// - Route change events
// =================================================================

export { RouterProvider } from './RouterProvider';
export { createRouteConfig } from './routeFactory';
export { RouteGuard } from './RouteGuard';
export { useRouteGuard } from './useRouteGuard';
export { routeRegistry } from './routeRegistry';
export type { RegisteredRoute } from './routeRegistry';