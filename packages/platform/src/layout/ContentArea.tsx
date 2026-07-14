import React from 'react';
import { Box, Container } from '@mui/material';

interface ContentAreaProps {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
}

export function ContentArea({ children, maxWidth = 'xl' }: ContentAreaProps) {
  return (
    <Box
      sx={{
        flexGrow: 1,
        p: 3,
        backgroundColor: 'background.default',
        minHeight: '100%',
      }}
    >
      <Container maxWidth={maxWidth}>
        {children}
      </Container>
    </Box>
  );
}