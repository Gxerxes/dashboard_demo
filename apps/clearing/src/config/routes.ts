import { createRouteConfig, createIndexRoute } from '@posttrade/platform/router';
import type { RouteConfig } from '@posttrade/platform/types';

export const routes: RouteConfig[] = [
  {
    path: '/',
    guard: {
      requiresAuth: true,
      redirectTo: '/login',
    },
    title: 'Clearing Dashboard',
    titleKey: 'clearing.dashboard',
    breadcrumb: [{ label: 'Dashboard', path: '/' }],
  },
  {
    path: '/trades',
    guard: {
      requiresAuth: true,
      requiredPermissions: ['clearing:trade:read'],
    },
    title: 'Trade Management',
    titleKey: 'clearing.trade',
    breadcrumb: [
      { label: 'Dashboard', path: '/' },
      { label: 'Trade Management', path: '/trades' },
    ],
  },
  {
    path: '/settlements',
    guard: {
      requiresAuth: true,
      requiredPermissions: ['clearing:settlement:read'],
    },
    title: 'Settlements',
    titleKey: 'clearing.settlement',
  },
  {
    path: '/reports',
    guard: {
      requiresAuth: true,
      requiredPermissions: ['clearing:report:read'],
    },
    title: 'Reports',
    titleKey: 'clearing.report',
  },
  {
    path: '/positions',
    guard: {
      requiresAuth: true,
      requiredPermissions: ['clearing:position:read'],
    },
    title: 'Position Management',
    titleKey: 'clearing.position',
  },
  {
    path: '/margins',
    guard: {
      requiresAuth: true,
      requiredPermissions: ['clearing:margin:read'],
    },
    title: 'Margin Management',
    titleKey: 'clearing.margin',
  },
];