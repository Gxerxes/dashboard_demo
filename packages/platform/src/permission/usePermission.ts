import { useContext } from 'react';
import { PermissionContext } from './PermissionProvider';

export function usePermission() {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermission must be used within a PermissionProvider');
  }
  return context;
}