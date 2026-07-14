import React from 'react';
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography, Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectBreadcrumbs } from './layoutSlice';

export function Breadcrumbs() {
  const breadcrumbs = useSelector(selectBreadcrumbs);
  const navigate = useNavigate();

  if (breadcrumbs.length === 0) return null;

  return (
    <Box sx={{ px: 3, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
      <MuiBreadcrumbs aria-label="breadcrumb">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return isLast ? (
            <Typography key={crumb.path} color="text.primary" variant="body2" fontWeight={500}>
              {crumb.label}
            </Typography>
          ) : (
            <Link
              key={crumb.path}
              color="inherit"
              variant="body2"
              href={crumb.path}
              onClick={(e) => {
                e.preventDefault();
                navigate(crumb.path);
              }}
              sx={{ cursor: 'pointer' }}
            >
              {crumb.label}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
}