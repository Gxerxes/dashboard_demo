import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Box, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectSidebarOpen } from './layoutSlice';
import { selectUser } from '../auth/authSlice';
import { usePermission } from '../permission';
import type { MenuItem } from '../types';

interface SidebarProps {
  menuItems?: MenuItem[];
}

const defaultMenuItems: MenuItem[] = [
  {
    id: 'dashboard',
    code: 'DASHBOARD',
    label: 'Dashboard',
    labelKey: 'menu.dashboard',
    path: '/',
    parentId: null,
    order: 1,
    permissions: [],
    children: [],
    isGroup: false,
    isDivider: false,
  },
];

export function Sidebar({ menuItems = defaultMenuItems }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarOpen = useSelector(selectSidebarOpen);
  const { hasPermissions } = usePermission();

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.permissions.length === 0) return true;
    return hasPermissions(item.permissions);
  });

  const renderMenuItems = (items: MenuItem[], depth: number = 0) => {
    return items.map((item) => {
      const isSelected = location.pathname === item.path;
      const hasChildren = item.children && item.children.length > 0;

      return (
        <React.Fragment key={item.id}>
          <ListItem disablePadding sx={{ pl: depth * 2 }}>
            <ListItemButton
              selected={isSelected}
              onClick={() => navigate(item.path)}
            >
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: isSelected ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
          {hasChildren && renderMenuItems(item.children, depth + 1)}
        </React.Fragment>
      );
    });
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={sidebarOpen}
      sx={{
        width: 260,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 260,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" fontWeight={700} color="primary">
            HKEX
          </Typography>
          <Typography variant="h6" fontWeight={400} color="text.secondary">
            Post Trade
          </Typography>
        </Box>
      </Toolbar>
      <List>{renderMenuItems(filteredMenuItems)}</List>
    </Drawer>
  );
}