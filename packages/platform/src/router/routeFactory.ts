import React from 'react';
import type { RouteConfig } from '../types';

export function createRouteConfig(
  path: string,
  importFn: () => Promise<{ default: React.ComponentType }>,
  options?: Partial<Omit<RouteConfig, 'path' | 'element'>>,
): RouteConfig {
  const LazyComponent = React.lazy(importFn);

  return {
    path,
    element: React.createElement(LazyComponent),
    ...options,
  };
}

export function createIndexRoute(
  importFn: () => Promise<{ default: React.ComponentType }>,
  options?: Partial<Omit<RouteConfig, 'element' | 'index'>>,
): RouteConfig {
  const LazyComponent = React.lazy(importFn);

  return {
    index: true,
    element: React.createElement(LazyComponent),
    ...options,
  };
}