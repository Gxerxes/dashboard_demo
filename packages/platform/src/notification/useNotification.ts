import { useSnackbar } from 'notistack';
import { useCallback } from 'react';
import type { NotificationSeverity } from '../types';

export function useNotification() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const notify = useCallback(
    (message: string, severity: NotificationSeverity = 'info', options?: Record<string, unknown>) => {
      enqueueSnackbar(message, {
        variant: severity,
        ...options,
      });
    },
    [enqueueSnackbar],
  );

  const success = useCallback(
    (message: string, options?: Record<string, unknown>) => notify(message, 'success', options),
    [notify],
  );

  const error = useCallback(
    (message: string, options?: Record<string, unknown>) => notify(message, 'error', options),
    [notify],
  );

  const warning = useCallback(
    (message: string, options?: Record<string, unknown>) => notify(message, 'warning', options),
    [notify],
  );

  const info = useCallback(
    (message: string, options?: Record<string, unknown>) => notify(message, 'info', options),
    [notify],
  );

  const close = useCallback((key?: string | number) => closeSnackbar(key), [closeSnackbar]);

  return { notify, success, error, warning, info, close };
}