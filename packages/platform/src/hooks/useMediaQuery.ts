import { useTheme, useMediaQuery as useMuiMediaQuery } from '@mui/material';

export function useMediaQuery(query: string): boolean {
  return useMuiMediaQuery(query);
}

export function useIsMobile(): boolean {
  return useMuiMediaQuery('(max-width: 600px)');
}

export function useIsTablet(): boolean {
  return useMuiMediaQuery('(min-width: 601px) and (max-width: 960px)');
}

export function useIsDesktop(): boolean {
  return useMuiMediaQuery('(min-width: 961px)');
}