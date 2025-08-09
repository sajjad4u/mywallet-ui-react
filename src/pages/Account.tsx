import React, { useState, useEffect } from 'react';
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
  Alert,
  CircularProgress,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { AccountService } from '../services/api';
import type { Account } from '../services/api/types';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<AccountFormInputs>({
    resolver: yupResolver(schema) as Resolver<AccountFormInputs>,
    defaultValues: {
      accountName: '',
      currency: '',
      openingBalance: 0,
      remarks: '',
    },
  });

  // Load accounts on component mount
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const accountData = await AccountService.getAll();
      setAccounts(accountData);
    } catch (err) {
      setError('Failed to load accounts. Please check your connection and try again.');
      console.error('Error loading accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: AccountFormInputs) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const accountData = {
        name: data.accountName,
        currency: data.currency,
        openingBalance: data.openingBalance,
      };

      if (editingAccount) {
        // Update existing account
        await AccountService.update({ ...accountData, id: editingAccount.id });
        setSuccess('Account updated successfully!');
        setEditingAccount(null);
      } else {
        // Create new account
        await AccountService.create(accountData);
        setSuccess('Account created successfully!');
      }

      reset();
      await loadAccounts(); // Reload accounts from server
    } catch (err) {
      setError('Failed to save account. Please try again.');
      console.error('Error saving account:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setValue('accountName', account.name);
    setValue('currency', account.currency);
    setValue('openingBalance', account.openingBalance);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (accountId: number) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        setLoading(true);
        setError(null);
        await AccountService.delete(accountId);
        setSuccess('Account deleted successfully!');
        await loadAccounts(); // Reload accounts from server
      } catch (err) {
        setError('Failed to delete account. Please try again.');
        console.error('Error deleting account:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingAccount(null);
    reset();
    setError(null);
    setSuccess(null);
  };

  const handleReset = () => {
    reset();
    setEditingAccount(null);
    setError(null);
    setSuccess(null);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {editingAccount ? 'Edit Account' : 'Add New Account'}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Account Name"
                {...register('accountName')}
                error={!!errors.accountName}
                helperText={errors.accountName?.message}
                disabled={loading}
              />
              <TextField
                label="Currency"
                {...register('currency')}
                error={!!errors.currency}
                helperText={errors.currency?.message}
                disabled={loading}
              />
              <TextField
                label="Opening Balance"
                type="number"
                {...register('openingBalance')}
                error={!!errors.openingBalance}
                helperText={errors.openingBalance?.message}
                disabled={loading}
              />
              <TextField
                label="Remarks (Optional)"
                multiline
                rows={3}
                {...register('remarks')}
                error={!!errors.remarks}
                helperText={errors.remarks?.message}
                disabled={loading}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {editingAccount ? 'Update' : 'Add'} Account
                </Button>
                {editingAccount && (
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={handleCancelEdit}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outlined"
                  onClick={handleReset}
                  disabled={loading}
                >
                  Reset
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      </Grid>

      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Accounts List
            </Typography>
            <Button
              variant="outlined"
              onClick={loadAccounts}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              Refresh
            </Button>
          </Box>

          {loading && accounts.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Account Name</TableCell>
                    <TableCell>Currency</TableCell>
                    <TableCell>Opening Balance</TableCell>
                    <TableCell>Current Balance</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>{account.name}</TableCell>
                      <TableCell>{account.currency}</TableCell>
                      <TableCell>{account.openingBalance}</TableCell>
                      <TableCell>{account.balance || account.openingBalance}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEdit(account)} color="primary" disabled={loading}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(account.id)} color="error" disabled={loading}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {accounts.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                        No accounts found. Add your first account using the form on the left.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};
