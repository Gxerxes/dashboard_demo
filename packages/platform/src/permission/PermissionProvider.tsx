import React, { createContext } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../auth/authSlice';
import { checkPermission, checkRole, checkCondition } from './permissionChecker';
import type { PermissionCondition } from '../types';

export interface PermissionContextValue {
  hasPermission: (permission: string) => boolean;
  hasPermissions: (permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
  hasRoles: (roles: string[]) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  checkAccess: (requiredPermissions: string[], requiredRoles?: string[], conditions?: PermissionCondition[]) => boolean;
  userPermissions: string[];
  userRoles: string[];
}

export const PermissionContext = createContext<PermissionContextValue | null>(null);

interface PermissionProviderProps {
  children: React.ReactNode;
}

export function PermissionProvider({ children }: PermissionProviderProps) {
  const user = useSelector(selectUser);
  const userPermissions = user?.permissions ?? [];
  const userRoles = user?.roles ?? [];

  const value: PermissionContextValue = {
    hasPermission: (permission: string) => userPermissions.includes(permission),
    hasPermissions: (permissions: string[]) => permissions.every((p) => userPermissions.includes(p)),
    hasRole: (role: string) => userRoles.includes(role),
    hasRoles: (roles: string[]) => roles.some((r) => userRoles.includes(r)),
    hasAnyPermission: (permissions: string[]) => permissions.some((p) => userPermissions.includes(p)),
    checkAccess: (requiredPermissions, requiredRoles, conditions) => {
      if (requiredPermissions.length > 0 && !checkPermission(userPermissions, requiredPermissions).allowed) {
        return false;
      }
      if (requiredRoles && requiredRoles.length > 0 && !checkRole(userRoles, requiredRoles).allowed) {
        return false;
      }
      if (conditions && conditions.length > 0) {
        const userAttributes = user as unknown as Record<string, unknown>;
        return checkCondition(userAttributes, conditions);
      }
      return true;
    },
    userPermissions,
    userRoles,
  };

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}