import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ThemeMode, ThemeDirection, Density, ColorScheme } from '../types';

export interface ThemeState {
  mode: ThemeMode;
  direction: ThemeDirection;
  density: Density;
  colorScheme: ColorScheme;
}

const initialState: ThemeState = {
  mode: (localStorage.getItem('theme_mode') as ThemeMode) ?? 'light',
  direction: 'ltr',
  density: 'standard',
  colorScheme: 'blue',
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setMode(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
      localStorage.setItem('theme_mode', action.payload);
    },
    toggleMode(state) {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme_mode', state.mode);
    },
    setDirection(state, action: PayloadAction<ThemeDirection>) {
      state.direction = action.payload;
    },
    setDensity(state, action: PayloadAction<Density>) {
      state.density = action.payload;
    },
    setColorScheme(state, action: PayloadAction<ColorScheme>) {
      state.colorScheme = action.payload;
    },
    resetTheme(state) {
      state.mode = 'light';
      state.direction = 'ltr';
      state.density = 'standard';
      state.colorScheme = 'blue';
      localStorage.setItem('theme_mode', 'light');
    },
  },
});

export const themeActions = themeSlice.actions;
export const themeReducer = themeSlice.reducer;

export const selectThemeMode = (state: { theme: ThemeState }) => state.theme.mode;
export const selectThemeDirection = (state: { theme: ThemeState }) => state.theme.direction;
export const selectDensity = (state: { theme: ThemeState }) => state.theme.density;
export const selectColorScheme = (state: { theme: ThemeState }) => state.theme.colorScheme;