import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { layoutActions, selectLayout, selectSidebarOpen, selectBreadcrumbs } from './layoutSlice';
import { routeRegistry } from '../router/routeRegistry';

export function useLayout() {
  const dispatch = useDispatch();
  const location = useLocation();
  const layout = useSelector(selectLayout);

  const toggleSidebar = useCallback(() => {
    dispatch(layoutActions.toggleSidebar());
  }, [dispatch]);

  const setSidebarOpen = useCallback(
    (open: boolean) => {
      dispatch(layoutActions.setSidebarOpen(open));
    },
    [dispatch],
  );

  const updateBreadcrumbs = useCallback(() => {
    const breadcrumbs = routeRegistry.getBreadcrumbs(location.pathname);
    dispatch(layoutActions.setBreadcrumbs(breadcrumbs));
  }, [dispatch, location.pathname]);

  const addTab = useCallback(
    (id: string, label: string, path: string) => {
      dispatch(layoutActions.addTab({ id, label, path }));
    },
    [dispatch],
  );

  const removeTab = useCallback(
    (id: string) => {
      dispatch(layoutActions.removeTab(id));
    },
    [dispatch],
  );

  return {
    layout,
    sidebarOpen: layout.sidebarOpen,
    breadcrumbs: layout.breadcrumbs,
    toggleSidebar,
    setSidebarOpen,
    updateBreadcrumbs,
    addTab,
    removeTab,
  };
}