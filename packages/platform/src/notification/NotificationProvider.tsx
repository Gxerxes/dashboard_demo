import React from 'react';
import { SnackbarProvider } from 'notistack';
import { IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const notistackRef = React.useRef<SnackbarProvider | null>(null);

  const onClickDismiss = (key: string | number) => () => {
    notistackRef.current?.closeSnackbar(key);
  };

  return (
    <SnackbarProvider
      ref={notistackRef}
      maxSnack={5}
      anchorOrigin={{
        vertical: 'top',
        right: 'right',
      }}
      autoHideDuration={5000}
      preventDuplicate
      action={(key) => (
        <IconButton size="small" color="inherit" onClick={onClickDismiss(key)}>
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
    >
      {children}
    </SnackbarProvider>
  );
}