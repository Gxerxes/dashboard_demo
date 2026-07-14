import type { RouteConfig } from '../types';

export interface RegisteredRoute extends RouteConfig {
  id: string;
  parentId: string | null;
  fullPath: string;
}

class RouteRegistry {
  private routes: Map<string, RegisteredRoute> = new Map();
  private routeTree: RegisteredRoute[] = [];

  register(routes: RouteConfig[], parentPath: string = '', parentId: string | null = null): void {
    for (const route of routes) {
      const id = route.path ? `${parentPath}/${route.path}` : parentPath;
      const fullPath = this.buildFullPath(parentPath, route.path);

      const registered: RegisteredRoute = {
        ...route,
        id,
        parentId,
        fullPath,
      };

      this.routes.set(id, registered);
      this.routeTree.push(registered);

      if (route.children) {
        this.register(route.children, fullPath, id);
      }
    }
  }

  private buildFullPath(parentPath: string, path?: string): string {
    if (!path) return parentPath;
    const cleanParent = parentPath.endsWith('/') ? parentPath.slice(0, -1) : parentPath;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanParent}${cleanPath}`;
  }

  getRoute(id: string): RegisteredRoute | undefined {
    return this.routes.get(id);
  }

  getRouteByPath(path: string): RegisteredRoute | undefined {
    for (const route of this.routes.values()) {
      if (route.fullPath === path) return route;
    }
    return undefined;
  }

  getAllRoutes(): RegisteredRoute[] {
    return this.routeTree;
  }

  getRoutesByParent(parentId: string | null): RegisteredRoute[] {
    return this.routeTree.filter((r) => r.parentId === parentId);
  }

  getBreadcrumbs(path: string): Array<{ label: string; path: string }> {
    const breadcrumbs: Array<{ label: string; path: string }> = [];
    const route = this.getRouteByPath(path);

    if (route?.breadcrumb) {
      return route.breadcrumb.map((b) => ({ label: b.label, path: b.path }));
    }

    if (route) {
      let current: RegisteredRoute | undefined = route;
      const crumbs: RegisteredRoute[] = [];

      while (current) {
        crumbs.unshift(current);
        current = current.parentId ? this.routes.get(current.parentId) : undefined;
      }

      for (const crumb of crumbs) {
        breadcrumbs.push({
          label: crumb.title ?? crumb.path,
          path: crumb.fullPath,
        });
      }
    }

    return breadcrumbs;
  }

  clear(): void {
    this.routes.clear();
    this.routeTree = [];
  }
}

export const routeRegistry = new RouteRegistry();