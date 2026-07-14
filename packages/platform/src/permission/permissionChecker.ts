import type { PermissionCondition } from '../types';

export interface PermissionCheckResult {
  allowed: boolean;
  denied: boolean;
  matchedRules: string[];
  reason?: string;
}

export function checkPermission(
  userPermissions: string[],
  requiredPermissions: string[],
): PermissionCheckResult {
  const allowed = requiredPermissions.every((perm) => userPermissions.includes(perm));
  const denied = requiredPermissions.some((perm) => !userPermissions.includes(perm));

  return {
    allowed,
    denied,
    matchedRules: requiredPermissions.filter((perm) => userPermissions.includes(perm)),
    reason: denied ? `Missing required permissions: ${requiredPermissions.filter((p) => !userPermissions.includes(p)).join(', ')}` : undefined,
  };
}

export function checkRole(
  userRoles: string[],
  requiredRoles: string[],
): PermissionCheckResult {
  const allowed = requiredRoles.some((role) => userRoles.includes(role));
  const denied = !allowed;

  return {
    allowed,
    denied,
    matchedRules: requiredRoles.filter((role) => userRoles.includes(role)),
    reason: denied ? `None of the required roles matched: ${requiredRoles.join(', ')}` : undefined,
  };
}

export function checkCondition(
  userAttributes: Record<string, unknown>,
  conditions: PermissionCondition[],
): boolean {
  return conditions.every((condition) => {
    const userValue = userAttributes[condition.attribute];
    if (userValue === undefined) return false;

    switch (condition.operator) {
      case 'eq':
        return userValue === condition.value;
      case 'neq':
        return userValue !== condition.value;
      case 'gt':
        return Number(userValue) > Number(condition.value);
      case 'gte':
        return Number(userValue) >= Number(condition.value);
      case 'lt':
        return Number(userValue) < Number(condition.value);
      case 'lte':
        return Number(userValue) <= Number(condition.value);
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(userValue);
      case 'contains':
        return String(userValue).includes(String(condition.value));
      case 'startsWith':
        return String(userValue).startsWith(String(condition.value));
      case 'endsWith':
        return String(userValue).endsWith(String(condition.value));
      default:
        return false;
    }
  });
}