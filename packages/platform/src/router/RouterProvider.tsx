import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RouteGuard } from './RouteGuard';
import { routeRegistry } from './routeRegistry';
import type { RouteConfig } from '../types';

interface RouterProviderProps {
  routes: RouteConfig[];
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  basename?: string;
}

export function RouterProvider({
  routes,
  fallback,
  loadingComponent,
  basename,
}: RouterProviderProps) {
  // Register routes
  React.useEffect(() => {
    routeRegistry.register(routes);
    return () => routeRegistry.clear();
  }, [routes]);

  const renderRoute = (route: RouteConfig, index: number): React.ReactElement => {
    const element = route.guard ? (
      <RouteGuard key={route.path ?? index} guard={route.guard} fallback={fallback}>
        <Suspense fallback={loadingComponent ?? <div>Loading...</div>}>
          {route.element}
        </Suspense>
      </RouteGuard>
    ) : (
      <Suspense key={route.path ?? index} fallback={loadingComponent ?? <div>Loading...</div>}>
        {route.element}
      </Suspense>
    );

    if (route.children && route.children.length > 0) {
      return (
        <Route key={route.path ?? index} path={route.path} element={element}>
          {route.children.map((child, childIndex) => renderRoute(child, childIndex))}
        </Route>
      );
    }

    if (route.index) {
      return <Route key={`index-${index}`} index element={element} />;
    }

    return <Route key={route.path ?? index} path={route.path} element={element} />;
  };

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        {routes.map((route, index) => renderRoute(route, index))}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}