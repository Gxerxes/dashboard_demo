import React from 'react';
import { AppLayout } from '@posttrade/platform/layout';
import { useDocumentTitle } from '@posttrade/platform/hooks';
import { Dashboard } from './pages/Dashboard';
import { TradeManagement } from './trade/TradeManagement';
import { routes } from './config/routes';

export function App() {
  useDocumentTitle('Clearing');

  return (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  );
}