// =================================================================
// Layout Module
// =================================================================
// Responsibilities:
// - Main application layout (sidebar, header, content area)
// - Sidebar navigation
// - Header with user info, notifications, search
// - Content area with breadcrumbs
// - Responsive layout management
// - Tab management
// =================================================================

export { AppLayout } from './AppLayout';
export { Sidebar } from './Sidebar';
export { Header } from './Header';
export { ContentArea } from './ContentArea';
export { Breadcrumbs } from './Breadcrumbs';
export { TabBar } from './TabBar';
export { useLayout } from './useLayout';
export type { LayoutState } from './layoutSlice';
export { layoutSlice, layoutActions, layoutReducer } from './layoutSlice';