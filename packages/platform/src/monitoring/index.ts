import type React from 'react';

interface MonitoringProviderProps {
  children: React.ReactNode;
}

export function MonitoringProvider({ children }: MonitoringProviderProps) {
  return children as React.ReactElement;
}

export function useMonitoring() {
  return {
    captureException: (error: Error) => console.error(error),
    captureMessage: (message: string) => console.log(message),
    setUser: (user: { id: string; email?: string; username?: string }) => {},
    setAttribute: (key: string, value: string) => {},
  };
}