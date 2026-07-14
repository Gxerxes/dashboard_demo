import React from 'react';
import { Box } from '@mui/material';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ContentArea } from './ContentArea';
import { Breadcrumbs } from './Breadcrumbs';
import { useLayout } from './useLayout';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { sidebarOpen, sidebarWidth, headerHeight } = useLayout();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: sidebarOpen ? `${sidebarWidth}px` : 0,
          mt: `${headerHeight}px`,
          transition: 'margin-left 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Breadcrumbs />
        <ContentArea>{children}</ContentArea>
      </Box>
    </Box>
  );
}