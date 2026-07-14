import React from 'react';
import { Backdrop, CircularProgress, Typography, Box } from '@mui/material';

interface GlobalLoadingProps {
  open: boolean;
  message?: string;
}

export function GlobalLoading({ open, message }: GlobalLoadingProps) {
  return (
    <Backdrop
      open={open}
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 2,
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress color="inherit" />
        {message && (
          <Typography variant="body2" sx={{ mt: 2 }}>
            {message}
          </Typography>
        )}
      </Box>
    </Backdrop>
  );
}