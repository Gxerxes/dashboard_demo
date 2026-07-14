import type React from 'react';

interface MonitoringProviderProps {
  children: React.ReactNode;
}

export function MonitoringProvider({ children }: MonitoringProviderProps) {
  return children as React.ReactElement;
}

type MonitoringUser = { id: string; email?: string; username?: string };

export function useMonitoring() {
  return {
    captureException: (error: Error) => { console.error(error); },
    captureMessage: (message: string) => { console.log(message); },
    setUser: (_user: MonitoringUser) => { /* not implemented */ },
    setAttribute: (_key: string, _value: string) => { /* not implemented */ },
  };
}
