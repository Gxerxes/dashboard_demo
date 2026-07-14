// =================================================================
// Theme Module
// =================================================================
// Responsibilities:
// - MUI theme creation
// - Light/dark/high-contrast modes
// - Dynamic color scheme
// - Theme persistence
// - Theme context and provider
// - Density management
// =================================================================

export { ThemeProvider } from './ThemeProvider';
export { createAppTheme } from './createAppTheme';
export { useTheme } from './useTheme';
export { ThemeToggle } from './ThemeToggle';
export { themeSlice, themeActions, themeReducer } from './themeSlice';
export type { ThemeState } from './themeSlice';