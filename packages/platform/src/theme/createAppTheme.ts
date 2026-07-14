import { createTheme, type ThemeOptions } from '@mui/material/styles';
import type { ThemeMode, ColorScheme } from '../types';

const colorSchemes: Record<ColorScheme, { primary: string; secondary: string }> = {
  blue: { primary: '#1565C0', secondary: '#42A5F5' },
  green: { primary: '#2E7D32', secondary: '#66BB6A' },
  purple: { primary: '#7B1FA2', secondary: '#AB47BC' },
  orange: { primary: '#E65100', secondary: '#FF9800' },
  teal: { primary: '#00695C', secondary: '#26A69A' },
  indigo: { primary: '#283593', secondary: '#5C6BC0' },
};

export function createAppTheme(
  mode: ThemeMode,
  colorScheme: ColorScheme = 'blue',
): ThemeOptions {
  const colors = colorSchemes[colorScheme];

  return {
    palette: {
      mode,
      primary: {
        main: colors.primary,
        light: colors.secondary,
        dark: colors.primary,
        contrastText: '#ffffff',
      },
      secondary: {
        main: colors.secondary,
        light: '#90CAF9',
        dark: '#1565C0',
        contrastText: '#ffffff',
      },
      ...(mode === 'dark'
        ? {
            background: {
              default: '#121212',
              paper: '#1E1E1E',
            },
          }
        : {
            background: {
              default: '#F5F5F5',
              paper: '#FFFFFF',
            },
          }),
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
      ].join(','),
      h1: { fontSize: '2.25rem', fontWeight: 700, lineHeight: 1.2 },
      h2: { fontSize: '1.875rem', fontWeight: 600, lineHeight: 1.3 },
      h3: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.35 },
      h4: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
      h5: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.45 },
      h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.5 },
      body1: { fontSize: '0.875rem', lineHeight: 1.5 },
      body2: { fontSize: '0.8125rem', lineHeight: 1.43 },
      caption: { fontSize: '0.75rem', lineHeight: 1.33 },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 8,
          },
          contained: {
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          },
        },
        defaultProps: {
          disableElevation: true,
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
          size: 'small',
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: mode === 'dark'
              ? '0 2px 8px rgba(0,0,0,0.3)'
              : '0 2px 8px rgba(0,0,0,0.08)',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              fontWeight: 600,
              backgroundColor: mode === 'dark' ? '#2D2D2D' : '#FAFAFA',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            border: 'none',
          },
        },
      },
    },
  };
}