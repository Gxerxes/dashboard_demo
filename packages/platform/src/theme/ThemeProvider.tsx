import React from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectThemeMode, selectColorScheme } from './themeSlice';
import { createAppTheme } from './createAppTheme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const mode = useSelector(selectThemeMode);
  const colorScheme = useSelector(selectColorScheme);

  const theme = React.useMemo(
    () => createTheme(createAppTheme(mode, colorScheme)),
    [mode, colorScheme],
  );

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}