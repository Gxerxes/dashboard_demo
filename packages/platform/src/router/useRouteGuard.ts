import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '../auth/authSlice';
import { usePermission } from '../permission';
import type { RouteGuard } from '../types';

export function useRouteGuard() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const { hasPermissions, hasRoles } = usePermission();

  const checkAccess = useCallback(
    (guard?: RouteGuard): boolean => {
      if (!guard) return true;

      if (guard.requiresAuth && !isAuthenticated) {
        navigate(guard.redirectTo ?? '/login', { state: { from: location } });
        return false;
      }

      if (guard.requiredPermissions && guard.requiredPermissions.length > 0) {
        if (!hasPermissions(guard.requiredPermissions)) {
          navigate('/403');
          return false;
        }
      }

      if (guard.requiredRoles && guard.requiredRoles.length > 0) {
        if (!hasRoles(guard.requiredRoles)) {
          navigate('/403');
          return false;
        }
      }

      return true;
    },
    [isAuthenticated, navigate, location, hasPermissions, hasRoles],
  );

  return { checkAccess, isAuthenticated, user };
}