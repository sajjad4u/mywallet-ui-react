import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import {
  Grid,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { Account } from '../types';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

type AccountFormInputs = {
  accountName: string;
  currency: string;
  openingBalance: number;
  remarks?: string | undefined;
};

const schema = yup.object({
  accountName: yup.string().required('Account name is required'),
  currency: yup.string().required('Currency is required'),
  openingBalance: yup.number().required('Opening balance is required'),
  remarks: yup.string().optional().transform((value) => value === '' ? undefined : value)
}).required();

export const AccountPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AccountFormInputs>({
    resolver: yupResolver(schema) as Resolver<AccountFormInputs>,
    defaultValues: {
      accountName: '',
      currency: '',
      openingBalance: 0,
      remarks: '',
    },
  });

  const onSubmit = (data: AccountFormInputs) => {
    if (editingAccount) {
      // Update existing account
      setAccounts(accounts.map(acc => 
        acc.accountId === editingAccount.accountId ? { ...data, accountId: editingAccount.accountId } : acc
      ));
      setEditingAccount(null);
    } else {
      // Add new account
      const newAccount: Account = { ...data, accountId: Date.now() };
      setAccounts([...accounts, newAccount]);
    }
    reset();
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    reset(account);
  };

  const handleDelete = (accountId: number) => {
    setAccounts(accounts.filter(acc => acc.accountId !== accountId));
  };

  const handleReset = () => {
    reset();
    setEditingAccount(null);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Account Management
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Account Name"
                {...register('accountName')}
                error={!!errors.accountName}
                helperText={errors.accountName?.message}
              />
              <TextField
                label="Currency"
                {...register('currency')}
                error={!!errors.currency}
                helperText={errors.currency?.message}
              />
              <TextField
                label="Opening Balance"
                type="number"
                {...register('openingBalance')}
                error={!!errors.openingBalance}
                helperText={errors.openingBalance?.message}
              />
              <TextField
                label="Remarks"
                multiline
                rows={3}
                {...register('remarks')}
                error={!!errors.remarks}
                helperText={errors.remarks?.message}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button type="submit" variant="contained" color="primary">
                  {editingAccount ? 'Update' : 'Save'}
                </Button>
                <Button type="button" onClick={handleReset} variant="outlined">
                  Reset
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      </Grid>

      <Grid item xs={12} md={8}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Account Name</TableCell>
                <TableCell>Currency</TableCell>
                <TableCell align="right">Opening Balance</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.accountId}>
                  <TableCell>{account.accountName}</TableCell>
                  <TableCell>{account.currency}</TableCell>
                  <TableCell align="right">{account.openingBalance}</TableCell>
                  <TableCell>{account.remarks}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleEdit(account)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(account.accountId)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );
};
