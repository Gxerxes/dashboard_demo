import React from 'react';
import { usePermission } from '../permission';

interface ProtectedElementProps {
  permissions?: string[];
  roles?: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedElement({ permissions, roles, children, fallback }: ProtectedElementProps) {
  const { hasPermissions, hasRoles } = usePermission();

  if (permissions && permissions.length > 0 && !hasPermissions(permissions)) {
    return fallback as React.ReactElement ?? null;
  }

  if (roles && roles.length > 0 && !hasRoles(roles)) {
    return fallback as React.ReactElement ?? null;
  }

  return children as React.ReactElement;
}

interface PermissionGateProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGate({ permission, children, fallback }: PermissionGateProps) {
  const { hasPermission } = usePermission();

  if (!hasPermission(permission)) {
    return fallback as React.ReactElement ?? null;
  }

  return children as React.ReactElement;
}