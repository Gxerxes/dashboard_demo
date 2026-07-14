import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectAuth } from '../auth/authSlice';
import { usePermission } from '../permission';
import type { RouteGuard as RouteGuardType } from '../types';

interface RouteGuardProps {
  guard?: RouteGuardType;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RouteGuard({ guard, children, fallback }: RouteGuardProps) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const auth = useSelector(selectAuth);
  const location = useLocation();
  const { hasPermissions, hasRoles } = usePermission();

  // Auth check
  if (guard?.requiresAuth && !isAuthenticated) {
    const redirectPath = guard.redirectTo ?? '/login';
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Permission check
  if (guard?.requiredPermissions && guard.requiredPermissions.length > 0) {
    if (!hasPermissions(guard.requiredPermissions)) {
      if (fallback) return <>{fallback}</>;
      return <Navigate to="/403" replace />;
    }
  }

  // Role check
  if (guard?.requiredRoles && guard.requiredRoles.length > 0) {
    if (!hasRoles(guard.requiredRoles)) {
      if (fallback) return <>{fallback}</>;
      return <Navigate to="/403" replace />;
    }
  }

  return <>{children}</>;
}