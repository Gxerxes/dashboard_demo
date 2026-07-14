import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button } from '@mui/material';
import { useDocumentTitle } from '@posttrade/platform/hooks';

interface Trade {
  id: string;
  tradeRef: string;
  product: string;
  counterparty: string;
  quantity: number;
  price: number;
  value: number;
  status: 'pending' | 'cleared' | 'failed';
  tradeDate: string;
  settlementDate: string;
}

const mockTrades: Trade[] = [
  { id: '1', tradeRef: 'T-2024-001', product: 'Equity Swap', counterparty: 'GS', quantity: 10000, price: 245.50, value: 2455000, status: 'pending', tradeDate: '2024-03-15', settlementDate: '2024-03-17' },
  { id: '2', tradeRef: 'T-2024-002', product: 'Index Future', counterparty: 'JPM', quantity: 5000, price: 5120.00, value: 25600000, status: 'cleared', tradeDate: '2024-03-14', settlementDate: '2024-03-16' },
  { id: '3', tradeRef: 'T-2024-003', product: 'FX Forward', counterparty: 'MS', quantity: 2000000, price: 7.82, value: 15640000, status: 'failed', tradeDate: '2024-03-14', settlementDate: '2024-03-18' },
];

const statusColors: Record<Trade['status'], 'warning' | 'success' | 'error'> = {
  pending: 'warning',
  cleared: 'success',
  failed: 'error',
};

export function TradeManagement() {
  useDocumentTitle('Trade Management');

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Trade Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined">Import Trades</Button>
          <Button variant="contained">New Trade</Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Trade Ref</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Counterparty</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Value (HKD)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Settlement Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockTrades.map((trade) => (
              <TableRow key={trade.id} hover>
                <TableCell>{trade.tradeRef}</TableCell>
                <TableCell>{trade.product}</TableCell>
                <TableCell>{trade.counterparty}</TableCell>
                <TableCell>{trade.quantity.toLocaleString()}</TableCell>
                <TableCell>{trade.price.toFixed(2)}</TableCell>
                <TableCell>${(trade.value / 1000000).toFixed(2)}M</TableCell>
                <TableCell>
                  <Chip
                    label={trade.status}
                    color={statusColors[trade.status]}
                    size="small"
                  />
                </TableCell>
                <TableCell>{trade.settlementDate}</TableCell>
                <TableCell>
                  <Button size="small" variant="text">View</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}