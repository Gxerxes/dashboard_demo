import React from 'react';
import { Tabs, Tab, Box, IconButton, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { layoutActions, selectTabs, selectCurrentTab } from './layoutSlice';

export function TabBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const tabs = useSelector(selectTabs);
  const currentTab = useSelector(selectCurrentTab);

  if (tabs.length === 0) return null;

  const handleTabChange = (_event: React.SyntheticEvent, tabId: string) => {
    dispatch(layoutActions.setCurrentTab(tabId));
    const tab = tabs.find((t) => t.id === tabId);
    if (tab) navigate(tab.path);
  };

  const handleTabClose = (event: React.MouseEvent, tabId: string) => {
    event.stopPropagation();
    dispatch(layoutActions.removeTab(tabId));
  };

  return (
    <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Tabs
        value={currentTab ?? false}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="page tabs"
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            value={tab.id}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {tab.label}
                {tab.closable && (
                  <IconButton
                    size="small"
                    component="span"
                    onClick={(e) => handleTabClose(e, tab.id)}
                    sx={{ ml: 0.5, width: 18, height: 18 }}
                  >
                    <CloseIcon sx={{ fontSize: 12 }} />
                  </IconButton>
                )}
              </Box>
            }
            sx={{ textTransform: 'none', minHeight: 40 }}
          />
        ))}
      </Tabs>
    </Box>
  );
}