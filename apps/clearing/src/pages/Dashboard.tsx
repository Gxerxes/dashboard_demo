import React from 'react';
import { Box, Grid, Paper, Typography, Card, CardContent } from '@mui/material';
import { useAuth } from '@posttrade/platform/auth';
import { useDocumentTitle } from '@posttrade/platform/hooks';

export function Dashboard() {
  useDocumentTitle('Clearing Dashboard');
  const { user } = useAuth();

  const stats = [
    { label: 'Open Trades', value: '1,247', color: 'primary.main' },
    { label: 'Pending Settlement', value: '$845.2M', color: 'success.main' },
    { label: 'Margin Calls', value: '23', color: 'warning.main' },
    { label: 'Risk Alerts', value: '5', color: 'error.main' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Welcome back, {user?.displayName ?? 'User'}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Clearing Operations Overview - {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {stat.label}
                </Typography>
                <Typography variant="h4" fontWeight={700} color={stat.color}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Recent Trades
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Trade activity feed will be displayed here...
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Clearing Calendar
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upcoming settlement dates and events...
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}