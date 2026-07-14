import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface LayoutState {
  sidebarOpen: boolean;
  sidebarWidth: number;
  headerHeight: number;
  currentTab: string | null;
  tabs: Array<{ id: string; label: string; path: string; closable: boolean }>;
  breadcrumbs: Array<{ label: string; path: string }>;
  mobileOpen: boolean;
}

const initialState: LayoutState = {
  sidebarOpen: true,
  sidebarWidth: 260,
  headerHeight: 64,
  currentTab: null,
  tabs: [],
  breadcrumbs: [],
  mobileOpen: false,
};

export const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    setSidebarWidth(state, action: PayloadAction<number>) {
      state.sidebarWidth = action.payload;
    },
    setBreadcrumbs(state, action: PayloadAction<Array<{ label: string; path: string }>>) {
      state.breadcrumbs = action.payload;
    },
    addTab(state, action: PayloadAction<{ id: string; label: string; path: string }>) {
      const exists = state.tabs.find((t) => t.id === action.payload.id);
      if (!exists) {
        state.tabs.push({ ...action.payload, closable: true });
      }
      state.currentTab = action.payload.id;
    },
    removeTab(state, action: PayloadAction<string>) {
      const index = state.tabs.findIndex((t) => t.id === action.payload);
      if (index >= 0) {
        state.tabs.splice(index, 1);
        if (state.currentTab === action.payload) {
          state.currentTab = state.tabs[index]?.id ?? state.tabs[index - 1]?.id ?? null;
        }
      }
    },
    setCurrentTab(state, action: PayloadAction<string>) {
      state.currentTab = action.payload;
    },
    setMobileOpen(state, action: PayloadAction<boolean>) {
      state.mobileOpen = action.payload;
    },
    toggleMobileOpen(state) {
      state.mobileOpen = !state.mobileOpen;
    },
    resetLayout(state) {
      return initialState;
    },
  },
});

export const layoutActions = layoutSlice.actions;
export const layoutReducer = layoutSlice.reducer;

export const selectLayout = (state: { layout: LayoutState }) => state.layout;
export const selectSidebarOpen = (state: { layout: LayoutState }) => state.layout.sidebarOpen;
export const selectBreadcrumbs = (state: { layout: LayoutState }) => state.layout.breadcrumbs;
export const selectTabs = (state: { layout: LayoutState }) => state.layout.tabs;
export const selectCurrentTab = (state: { layout: LayoutState }) => state.layout.currentTab;