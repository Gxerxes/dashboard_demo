import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { themeActions, selectThemeMode, selectThemeDirection, selectDensity, selectColorScheme } from './themeSlice';
import type { ThemeMode, ThemeDirection, Density, ColorScheme } from '../types';

export function useTheme() {
  const dispatch = useDispatch();
  const mode = useSelector(selectThemeMode);
  const direction = useSelector(selectThemeDirection);
  const density = useSelector(selectDensity);
  const colorScheme = useSelector(selectColorScheme);

  const setMode = useCallback((newMode: ThemeMode) => dispatch(themeActions.setMode(newMode)), [dispatch]);
  const toggleMode = useCallback(() => dispatch(themeActions.toggleMode()), [dispatch]);
  const setDirection = useCallback((dir: ThemeDirection) => dispatch(themeActions.setDirection(dir)), [dispatch]);
  const setDensity = useCallback((den: Density) => dispatch(themeActions.setDensity(den)), [dispatch]);
  const setColorScheme = useCallback((cs: ColorScheme) => dispatch(themeActions.setColorScheme(cs)), [dispatch]);
  const resetTheme = useCallback(() => dispatch(themeActions.resetTheme()), [dispatch]);

  return {
    mode,
    direction,
    density,
    colorScheme,
    setMode,
    toggleMode,
    setDirection,
    setDensity,
    setColorScheme,
    resetTheme,
    isDark: mode === 'dark',
    isLight: mode === 'light',
  };
}