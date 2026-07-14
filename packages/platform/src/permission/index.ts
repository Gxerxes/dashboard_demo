// =================================================================
// Permission Module (RBAC + ABAC)
// =================================================================
// Responsibilities:
// - Role-based access control
// - Attribute-based access control
// - Permission checking
// - Menu/Page/Button/API permission evaluation
// - Route guarding
// =================================================================

export { PermissionProvider } from './PermissionProvider';
export { usePermission } from './usePermission';
export { checkPermission, checkRole, checkCondition } from './permissionChecker';
export type { PermissionCheckResult } from './permissionChecker';