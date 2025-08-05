import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler, Resolver } from 'react-hook-form';
import axios from 'axios';
import apiClient from '../config/api';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
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
  FormControl,
  FormHelperText,
  Autocomplete,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  TablePagination,
  Divider,
  Collapse,
  Chip,
  Stack,
  FormControlLabel,
  Switch,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete,
  ContentCopy,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import type { Category, Account, Person } from '../types';

interface TransactionFormData {
  date: string;
  categoryId: number | '';
  accountId: number | '';
  personId?: number | '';
  debitAmount: number | null;
  creditAmount: number | null;
  remarks: string;
}

interface Transaction extends TransactionFormData {
  transactionId: number;
  type: 'INCOME' | 'EXPENSE';
}

// Define filter interface
interface FilterData {
  fromDate: string;
  toDate: string;
  categoryId: number | null;
  accountId: number | null;
  personId: number | null;
  hasDebit: boolean | null;
  hasCredit: boolean | null;
  remarks: string;
}

const schema = yup.object().shape({
  date: yup.string().required('Date is required'),
  categoryId: yup.mixed()
    .transform((value) => (value === '' ? undefined : Number(value)))
    .required('Category is required'),
  accountId: yup.mixed()
    .transform((value) => (value === '' ? undefined : Number(value)))
    .required('Account is required'),
  personId: yup.mixed()
    .transform((value) => (value === '' ? undefined : Number(value)))
    .optional(),
  debitAmount: yup.number()
    .nullable()
    .transform(value => value === '' ? null : Number(value)),
  creditAmount: yup.number()
    .nullable()
    .transform(value => value === '' ? null : Number(value)),
  remarks: yup.string().optional().default(''),
})
  .test(
    'atLeastOneAmount',
    'Either debit or credit amount is required',
    function (value) {
      return value.debitAmount != null || value.creditAmount != null;
    }
  )
  .test(
    'notBothAmounts',
    'Both debit and credit amounts cannot be specified simultaneously',
    function (value) {
      // Fail validation if both debit and credit have non-null values
      return !(value.debitAmount != null && value.creditAmount != null);
    }
  );

export const TransactionPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState({
    categories: true,
    accounts: true,
    persons: true
  });
  const [error, setError] = useState<{
    categories: string | null;
    accounts: string | null;
    persons: string | null;
  }>({
    categories: null,
    accounts: null,
    persons: null
  });

  // Filter state
  const [filters, setFilters] = useState<FilterData>({
    fromDate: '',
    toDate: '',
    categoryId: null,
    accountId: null,
    personId: null,
    hasDebit: null,
    hasCredit: null,
    remarks: ''
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(prev => ({ ...prev, categories: true }));
        setError(prev => ({ ...prev, categories: null }));
        const categoriesResponse = await apiClient.get('/mywallet/category/all');
        const fetchedCategories = categoriesResponse.data
          .filter((category: any) => category.type === 'INC' || category.type === 'EXP')
          .map((category: any) => ({
            categoryId: category.id,
            categoryName: category.name,
            type: category.type === 'INC' ? 'INCOME' : 'EXPENSE'
          }));
        setCategories(fetchedCategories);
      } catch (error: any) {
        let errorMessage = 'Failed to fetch categories';
        if (axios.isAxiosError(error)) {
          errorMessage = error.code === 'ERR_NETWORK'
            ? 'Cannot connect to the server'
            : `Server error: ${error.response?.status || 'unknown'}`;
        }
        setError(prev => ({ ...prev, categories: errorMessage }));
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(prev => ({ ...prev, categories: false }));
      }

      try {
        setLoading(prev => ({ ...prev, accounts: true }));
        setError(prev => ({ ...prev, accounts: null }));
        const accountsResponse = await apiClient.get('/mywallet/account/all');
        const fetchedAccounts = accountsResponse.data.map((account: any) => ({
          accountId: account.id,
          accountName: account.name,
          currency: account.currency,
          openingBalance: account.openingBalance
        }));
        setAccounts(fetchedAccounts);
      } catch (error: any) {
        let errorMessage = 'Failed to fetch accounts';
        if (axios.isAxiosError(error)) {
          errorMessage = error.code === 'ERR_NETWORK'
            ? 'Cannot connect to the server'
            : `Server error: ${error.response?.status || 'unknown'}`;
        }
        setError(prev => ({ ...prev, accounts: errorMessage }));
        console.error('Error fetching accounts:', error);
      } finally {
        setLoading(prev => ({ ...prev, accounts: false }));
      }

      try {
        setLoading(prev => ({ ...prev, persons: true }));
        setError(prev => ({ ...prev, persons: null }));
        const personsResponse = await apiClient.get('/mywallet/person/all');
        const fetchedPersons = personsResponse.data.map((person: any) => ({
          personId: person.id,
          personName: person.name,
          contactNo: person.contactNo,
          email: person.email
        }));
        setPersons(fetchedPersons);
      } catch (error: any) {
        let errorMessage = 'Failed to fetch persons';
        if (axios.isAxiosError(error)) {
          errorMessage = error.code === 'ERR_NETWORK'
            ? 'Cannot connect to the server'
            : `Server error: ${error.response?.status || 'unknown'}`;
        }
        setError(prev => ({ ...prev, persons: errorMessage }));
        console.error('Error fetching persons:', error);
      } finally {
        setLoading(prev => ({ ...prev, persons: false }));
      }
    };

    fetchData();
  }, []);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Track selected row for highlighting
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);

  // Success message state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setTransactionsLoading(true);
      setTransactionsError(null);
      const response = await apiClient.get('/mywallet/transaction/all');
      const fetchedTransactions = response.data.map((transaction: any) => {
        const isIncome = transaction.type === 'INC';

        // Format date properly
        let formattedDate = new Date().toISOString().split('T')[0]; // Default to today

        if (transaction.transDate) {
          try {
            // Try to parse the date from API
            const dateObj = new Date(transaction.transDate);
            if (!isNaN(dateObj.getTime())) {
              formattedDate = dateObj.toISOString().split('T')[0];
            }
          } catch (e) {
            console.error('Error parsing date:', transaction.transDate);
          }
        }

        return {
          transactionId: transaction.id || Date.now(), // Fallback to timestamp if no ID
          date: formattedDate,
          categoryId: transaction.categoryId || '',
          accountId: transaction.accountId || '',
          personId: transaction.personId || '',
          debitAmount: transaction.debitAmount,
          creditAmount: transaction.creditAmount,
          remarks: transaction.remarks || '',
          type: isIncome ? 'INCOME' : 'EXPENSE'
        };
      });
      setTransactions(fetchedTransactions);
    } catch (error: any) {
      let errorMessage = 'Failed to fetch transactions';
      if (axios.isAxiosError(error)) {
        errorMessage = error.code === 'ERR_NETWORK'
          ? 'Cannot connect to the server'
          : `Server error: ${error.response?.status || 'unknown'}`;
      }
      setTransactionsError(errorMessage);
      console.error('Error fetching transactions:', error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  // Fetch transactions when component mounts
  useEffect(() => {
    fetchTransactions();
  }, []);

  const { register, handleSubmit, reset, setValue, watch, clearErrors, formState: { errors } } = useForm<TransactionFormData>({
    resolver: yupResolver(schema) as unknown as Resolver<TransactionFormData>,
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      categoryId: '',
      accountId: '',
      personId: '',
      debitAmount: null,
      creditAmount: null,
      remarks: '',
    },
  });

  const onSubmit: SubmitHandler<TransactionFormData> = async (data) => {
    try {
      // Format the transaction data to match what the server expects
      const transactionData = {
        // For updates, use 'id' not 'transactionId'
        id: editingTransaction ? editingTransaction.transactionId : undefined,
        transDate: data.date,
        categoryId: Number(data.categoryId),  // Ensure it's a number
        accountId: Number(data.accountId),    // Ensure it's a number
        personId: data.personId ? Number(data.personId) : null,
        creditAmount: data.creditAmount || null,
        debitAmount: data.debitAmount || null,
        remarks: data.remarks || ''
      };

      // Log the request data for debugging
      console.log('Sending transaction data:', JSON.stringify(transactionData));

      const apiUrl = '/mywallet/transaction/save';
      console.log('API endpoint:', apiUrl);

      // Send the request to the server endpoint with explicit headers
      const response = await apiClient.post(apiUrl, transactionData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });

      // Log the raw response
      console.log('API Response:', response);

      if (response.data) {
        // Handle both success status and direct object response
        setSuccessMessage(editingTransaction
          ? "Transaction successfully updated"
          : "Transaction successfully saved");
        setShowSuccessAlert(true);

        // Reset form and refresh data
        fetchTransactions();
        setEditingTransaction(null);
        setSelectedRowId(null);
        reset();

        // When adding a new transaction, go to the first page
        if (!editingTransaction) {
          setPage(0);
        }
      } else {
        console.error('Transaction save failed:', response.data);
        setSuccessMessage("Failed to save transaction: " + (response.data?.message || "Unknown error"));
        setShowSuccessAlert(true);
      }
    } catch (error: any) {
      console.error('Error saving transaction:', error);

      // Provide more detailed error information
      let errorMessage = 'Failed to save transaction';
      if (axios.isAxiosError(error)) {
        console.log('API Error Details:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          statusText: error.response?.statusText,
          responseData: error.response?.data,
          requestData: error.config?.data
        });

        errorMessage = error.response?.data?.message ||
          error.message ||
          'Server communication error';
      }

      // Show error message
      setSuccessMessage(errorMessage);
      setShowSuccessAlert(true);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setSelectedRowId(transaction.transactionId);

    // Ensure date is properly formatted for the form field
    let formattedDate = transaction.date;
    try {
      const dateObj = new Date(transaction.date);
      if (!isNaN(dateObj.getTime())) {
        formattedDate = dateObj.toISOString().split('T')[0];
      }
    } catch (e) {
      console.error('Error formatting date for form:', transaction.date);
    }

    // First reset the form to clear any previous values
    reset();

    // Then set each field individually with proper value conversions
    setValue('date', formattedDate);
    setValue('categoryId', transaction.categoryId);
    setValue('accountId', transaction.accountId);
    setValue('personId', transaction.personId || '');

    // Set the debit and credit amounts directly from the transaction
    // Ensure at least one of them is not null to meet our validation rule
    // AND ensure both cannot have values simultaneously
    const hasDebitAmount = transaction.debitAmount !== null && transaction.debitAmount !== undefined;
    const hasCreditAmount = transaction.creditAmount !== null && transaction.creditAmount !== undefined;

    if (!hasDebitAmount && !hasCreditAmount) {
      // If both are null/undefined, set debit amount to 0 by default to pass validation
      setValue('debitAmount', 0);
      setValue('creditAmount', null);
    } else if (hasDebitAmount && hasCreditAmount) {
      // If both have values, prioritize debit amount (could be changed based on business rules)
      setValue('debitAmount', transaction.debitAmount);
      setValue('creditAmount', null);
    } else {
      // Set the values as they were (only one has a value)
      setValue('debitAmount', hasDebitAmount ? transaction.debitAmount : null);
      setValue('creditAmount', hasCreditAmount ? transaction.creditAmount : null);
    }

    setValue('remarks', transaction.remarks || '');

    // Scroll to the form on mobile devices
    const formElement = document.querySelector('.transaction-form');
    if (formElement && window.innerWidth < 960) { // md breakpoint is 960px
      setTimeout(() => {
        formElement.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleDelete = async (transactionId: number) => {
    try {
      await apiClient.delete(`/mywallet/transaction/${transactionId}`);

      // Calculate if we need to adjust the page after deletion
      const currentDisplayedItems = transactions.length - page * rowsPerPage;
      if (currentDisplayedItems === 1 && page > 0) {
        // If this is the last item on the page, go back one page
        setPage(page - 1);
      }

      fetchTransactions(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleReset = () => {
    // Reset form with default values
    reset({
      date: new Date().toISOString().split('T')[0],
      categoryId: '',
      accountId: '',
      personId: '',
      debitAmount: null,
      creditAmount: null,
      remarks: '',
    });
    setEditingTransaction(null);
    setSelectedRowId(null); // Clear selected row highlighting
  };

  const handleCopy = (transaction: Transaction) => {
    // Clear any existing editing state
    setEditingTransaction(null);
    // Set the selected row for highlighting
    setSelectedRowId(transaction.transactionId);

    // Check if amounts are null or have values
    const hasDebitAmount = transaction.debitAmount !== null && transaction.debitAmount !== undefined;
    const hasCreditAmount = transaction.creditAmount !== null && transaction.creditAmount !== undefined;

    // Determine values to set based on our validation rules
    let debitAmountValue = null;
    let creditAmountValue = null;

    if (!hasDebitAmount && !hasCreditAmount) {
      // If both are null, set debit to 0 by default
      debitAmountValue = 0;
    } else if (hasDebitAmount && hasCreditAmount) {
      // If both have values, prioritize debit amount
      debitAmountValue = transaction.debitAmount;
    } else {
      // Only one has a value, keep it that way
      debitAmountValue = hasDebitAmount ? transaction.debitAmount : null;
      creditAmountValue = hasCreditAmount ? transaction.creditAmount : null;
    }

    // Reset form with values from the transaction to copy
    reset({
      date: new Date().toISOString().split('T')[0], // Set current date for the new copy
      categoryId: transaction.categoryId,
      accountId: transaction.accountId,
      personId: transaction.personId,
      debitAmount: debitAmountValue,
      creditAmount: creditAmountValue,
      remarks: transaction.remarks,
    });

    // Scroll to the form (if on mobile)
    const formElement = document.querySelector('.transaction-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filter function
  const applyFilters = (data: Transaction[]) => {
    return data.filter(transaction => {
      // Date filters
      if (filters.fromDate && new Date(transaction.date) < new Date(filters.fromDate)) {
        return false;
      }
      if (filters.toDate && new Date(transaction.date) > new Date(filters.toDate)) {
        return false;
      }

      // Category filter
      if (filters.categoryId !== null && transaction.categoryId !== filters.categoryId) {
        return false;
      }

      // Account filter
      if (filters.accountId !== null && transaction.accountId !== filters.accountId) {
        return false;
      }

      // Person filter
      if (filters.personId !== null && transaction.personId !== filters.personId) {
        return false;
      }

      // Debit/Credit filters
      if (filters.hasDebit === true && (transaction.debitAmount === null || transaction.debitAmount === 0)) {
        return false;
      }
      if (filters.hasDebit === false && transaction.debitAmount !== null && transaction.debitAmount > 0) {
        return false;
      }
      if (filters.hasCredit === true && (transaction.creditAmount === null || transaction.creditAmount === 0)) {
        return false;
      }
      if (filters.hasCredit === false && transaction.creditAmount !== null && transaction.creditAmount > 0) {
        return false;
      }

      // Remarks filter
      if (filters.remarks && !transaction.remarks?.toLowerCase().includes(filters.remarks.toLowerCase())) {
        return false;
      }

      return true;
    });
  };

  // Handle filter changes
  const handleFilterChange = (filterName: keyof FilterData, value: any) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setPage(0); // Reset to first page when filters change
  };

  // Toggle filter visibility
  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      fromDate: '',
      toDate: '',
      categoryId: null,
      accountId: null,
      personId: null,
      hasDebit: null,
      hasCredit: null,
      remarks: ''
    });
  };

  // Get filtered transactions
  const filteredTransactions = useMemo(() => {
    return applyFilters(transactions);
  }, [transactions, filters]);

  // Pagination handlers
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Box sx={{
        textAlign: 'center',
        position: 'sticky',
        top: 64, // Height of the app bar
        backgroundColor: 'background.default',
        zIndex: 1,
        py: 2,
        borderBottom: 1,
        borderColor: 'divider',
        width: '100%'
      }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'medium' }}>
          Transaction Management
        </Typography>
      </Box>

      <Box sx={{ flex: 1, width: '100%', mt: 3, px: 2 }}>
        <Grid container spacing={3} sx={{ width: '100%' }}>
          <Grid item xs={12} md={5} lg={4}>
            <Paper sx={{ p: 2, position: 'sticky', top: 120 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h6">
                    {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
                  </Typography>
                  {(loading.categories || loading.accounts || loading.persons) && <CircularProgress size={20} />}
                </Box>
                {editingTransaction && (
                  <Typography variant="caption" color="primary" sx={{ fontStyle: 'italic' }}>
                    Editing Transaction #{editingTransaction.transactionId}
                  </Typography>
                )}
              </Box>
              <form 
  onSubmit={(e) => {
    e.preventDefault(); // Prevent default form submission behavior
    console.log("Form submission intercepted");
    
    // Check for validation errors first
    const hasErrors = Object.keys(errors).length > 0;
    console.log("Form validation errors:", hasErrors ? errors : "None");
    
    // Proceed with submission regardless of errors (for debugging)
    const data = watch();
    console.log("Form data to submit:", data);
    
    // Call onSubmit directly instead of using handleSubmit
    onSubmit(data);
  }} 
  className="transaction-form"
>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    type="date"
                    label="Date"
                    InputLabelProps={{ shrink: true }}
                    {...register('date')}
                    error={!!errors.date}
                    helperText={errors.date?.message}
                    inputProps={{
                      max: new Date().toISOString().split('T')[0] // Prevent future dates
                    }}
                    fullWidth
                  />

                  <Autocomplete
                    fullWidth
                    options={categories}
                    loading={loading.categories}
                    disabled={loading.categories}
                    value={categories.find((c) => c.categoryId === Number(watch('categoryId'))) || null}
                    getOptionLabel={(option: Category) => option.categoryName}
                    isOptionEqualToValue={(option: Category, value: Category) => option.categoryId === value.categoryId}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Category"
                        error={!!errors.categoryId || !!error.categories}
                        helperText={
                          errors.categoryId?.message ||
                          (error.categories ? error.categories : loading.categories ? 'Loading categories...' : '')
                        }
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loading.categories ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    onChange={(_event, newValue) => {
                      if (newValue) {
                        setValue('categoryId', newValue.categoryId);
                        clearErrors('categoryId');
                      } else {
                        setValue('categoryId', '');
                      }
                    }}
                    groupBy={(option) => option.type}
                    renderGroup={(params) => (
                      <div key={params.group}>
                        <Typography
                          sx={{
                            bgcolor: 'background.default',
                            color: params.group === 'INCOME' ? 'success.main' : 'error.main',
                            p: 1,
                            fontWeight: 'medium'
                          }}
                        >
                          {params.group === 'INCOME' ? 'Income' : 'Expense'}
                        </Typography>
                        {params.children}
                      </div>
                    )}
                  />

                  <Autocomplete
                    fullWidth
                    options={accounts}
                    loading={loading.accounts}
                    disabled={loading.accounts}
                    value={accounts.find((a) => a.accountId === Number(watch('accountId'))) || null}
                    getOptionLabel={(option: Account) => `${option.accountName} (${option.currency})`}
                    isOptionEqualToValue={(option: Account, value: Account) => option.accountId === value.accountId}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Account"
                        error={!!errors.accountId || !!error.accounts}
                        helperText={
                          errors.accountId?.message ||
                          (error.accounts ? error.accounts : loading.accounts ? 'Loading accounts...' : '')
                        }
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loading.accounts ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    onChange={(_event, newValue) => {
                      setValue('accountId', newValue ? newValue.accountId : '');
                      clearErrors('accountId');
                    }}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography>{option.accountName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Balance: {option.openingBalance} {option.currency}
                          </Typography>
                        </Box>
                      </li>
                    )}
                  />

                  <Autocomplete
                    fullWidth
                    options={persons}
                    loading={loading.persons}
                    disabled={loading.persons}
                    value={persons.find((p) => p.personId === Number(watch('personId'))) || null}
                    getOptionLabel={(option: Person) => option.personName}
                    isOptionEqualToValue={(option: Person, value: Person) => option.personId === value.personId}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Person"
                        error={!!errors.personId || !!error.persons}
                        helperText={
                          errors.personId?.message ||
                          (error.persons ? error.persons : loading.persons ? 'Loading persons...' : '')
                        }
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loading.persons ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    onChange={(_event, newValue) => {
                      setValue('personId', newValue ? newValue.personId : '');
                      clearErrors('personId');
                    }}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography>{option.personName}</Typography>
                          {(option.contactNo || option.email) && (
                            <Typography variant="caption" color="text.secondary">
                              {[option.contactNo, option.email].filter(Boolean).join(' • ')}
                            </Typography>
                          )}
                        </Box>
                      </li>
                    )}
                  />

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Debit Amount"
                      type="number"
                      {...register('debitAmount')}
                      error={!!errors.debitAmount}
                      helperText={errors.debitAmount?.message || (watch('creditAmount') ? 'Cannot use both Debit and Credit amounts' : '')}
                      disabled={watch('creditAmount') !== null && watch('creditAmount') !== undefined}
                      InputLabelProps={{
                        shrink: true
                      }}
                      InputProps={{
                        inputProps: { min: 0, step: 0.01 }
                      }}
                      sx={{ '& input': { fontSize: '1.1rem' } }}
                      onChange={(e) => {
                        const value = e.target.value === '' ? null : Number(e.target.value);
                        setValue('debitAmount', value);
                        if (value !== null) {
                          // Clear credit amount when debit amount has a value
                          setValue('creditAmount', null);
                        }
                        clearErrors('debitAmount');
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Credit Amount"
                      type="number"
                      {...register('creditAmount')}
                      error={!!errors.creditAmount}
                      helperText={errors.creditAmount?.message || (watch('debitAmount') ? 'Cannot use both Debit and Credit amounts' : '')}
                      disabled={watch('debitAmount') !== null && watch('debitAmount') !== undefined}
                      InputLabelProps={{
                        shrink: true
                      }}
                      InputProps={{
                        inputProps: { min: 0, step: 0.01 }
                      }}
                      sx={{ '& input': { fontSize: '1.1rem' } }}
                      onChange={(e) => {
                        const value = e.target.value === '' ? null : Number(e.target.value);
                        setValue('creditAmount', value);
                        if (value !== null) {
                          // Clear debit amount when credit amount has a value
                          setValue('debitAmount', null);
                        }
                        clearErrors('creditAmount');
                      }}
                    />
                  </Box>

                  <TextField
                    label="Remarks"
                    multiline
                    rows={3}
                    {...register('remarks')}
                    error={!!errors.remarks}
                    helperText={errors.remarks?.message}
                    InputLabelProps={{ shrink: true }}
                  />

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      onClick={(e) => {
                        // Add this debug log to see if the button click is working
                        console.log("Update/Save button clicked", {
                          isEditing: !!editingTransaction,
                          formValues: watch(),
                          formErrors: errors
                        });

                        // Don't add any e.preventDefault() here as we want the form's onSubmit to fire
                      }}
                    >
                      {editingTransaction ? 'Update' : 'Save'}
                    </Button>
                    <Button type="button" onClick={handleReset} variant="outlined">
                      Reset
                    </Button>
                    {editingTransaction && (
                      <>
                        <Button
                          type="button"
                          onClick={() => handleCopy(editingTransaction)}
                          variant="outlined"
                          color="info"
                          startIcon={<ContentCopy />}
                        >
                          Copy
                        </Button>
                        <Button
                          type="button"
                          onClick={() => handleDelete(editingTransaction.transactionId)}
                          variant="outlined"
                          color="error"
                          startIcon={<Delete />}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </Box>
                </Box>
              </form>
            </Paper>
          </Grid>

          <Grid item xs={12} md={7} lg={8}>
            <Paper sx={{ p: 2, width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 3,
                borderBottom: 2,
                borderColor: 'primary.main',
                pb: 1
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 'bold',
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    Transaction History
                    {transactionsLoading && <CircularProgress size={20} sx={{ ml: 2 }} />}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<FilterListIcon />}
                    onClick={toggleFilters}
                    color="primary"
                    variant={showFilters ? "contained" : "outlined"}
                  >
                    Filters
                  </Button>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 'medium',
                      bgcolor: 'action.hover',
                      px: 2,
                      py: 0.5,
                      borderRadius: 1
                    }}
                  >
                    Total: {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              </Box>

              {transactionsError && (
                <Typography color="error" sx={{ mb: 2 }}>
                  {transactionsError}
                </Typography>
              )}

              <Collapse in={showFilters}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 2,
                    border: '1px dashed',
                    borderColor: 'divider',
                    bgcolor: 'background.default'
                  }}
                >
                  <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold' }}>
                      <FilterListIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                      Filter Transactions
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<ClearIcon />}
                      onClick={resetFilters}
                      color="inherit"
                    >
                      Clear All
                    </Button>
                  </Box>

                  <Grid container spacing={2}>
                    {/* Date range filters */}
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="From Date"
                        type="date"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        value={filters.fromDate}
                        onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="To Date"
                        type="date"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        value={filters.toDate}
                        onChange={(e) => handleFilterChange('toDate', e.target.value)}
                      />
                    </Grid>

                    {/* Amount filters */}
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={filters.hasDebit === true}
                              onChange={() => {
                                // Toggle between true, false, null
                                const currentValue = filters.hasDebit;
                                let newValue: boolean | null = null;
                                if (currentValue === null) newValue = true;
                                else if (currentValue === true) newValue = false;
                                handleFilterChange('hasDebit', newValue);
                              }}
                              color="primary"
                            />
                          }
                          label="Has Debit"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={filters.hasCredit === true}
                              onChange={() => {
                                // Toggle between true, false, null
                                const currentValue = filters.hasCredit;
                                let newValue: boolean | null = null;
                                if (currentValue === null) newValue = true;
                                else if (currentValue === true) newValue = false;
                                handleFilterChange('hasCredit', newValue);
                              }}
                              color="primary"
                            />
                          }
                          label="Has Credit"
                        />
                      </Box>
                    </Grid>

                    {/* Category filter */}
                    <Grid item xs={12} sm={6} md={4}>
                      <Autocomplete
                        size="small"
                        options={categories}
                        getOptionLabel={(option) => option.categoryName}
                        isOptionEqualToValue={(option, value) => option.categoryId === value.categoryId}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Filter by Category"
                            placeholder="Select Category"
                            fullWidth
                          />
                        )}
                        value={categories.find(c => c.categoryId === filters.categoryId) || null}
                        onChange={(_event, newValue) =>
                          handleFilterChange('categoryId', newValue ? newValue.categoryId : null)
                        }
                      />
                    </Grid>

                    {/* Account filter */}
                    <Grid item xs={12} sm={6} md={4}>
                      <Autocomplete
                        size="small"
                        options={accounts}
                        getOptionLabel={(option) => option.accountName}
                        isOptionEqualToValue={(option, value) => option.accountId === value.accountId}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Filter by Account"
                            placeholder="Select Account"
                            fullWidth
                          />
                        )}
                        value={accounts.find(a => a.accountId === filters.accountId) || null}
                        onChange={(_event, newValue) =>
                          handleFilterChange('accountId', newValue ? newValue.accountId : null)
                        }
                      />
                    </Grid>

                    {/* Person filter */}
                    <Grid item xs={12} sm={6} md={4}>
                      <Autocomplete
                        size="small"
                        options={persons}
                        getOptionLabel={(option) => option.personName}
                        isOptionEqualToValue={(option, value) => option.personId === value.personId}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Filter by Person"
                            placeholder="Select Person"
                            fullWidth
                          />
                        )}
                        value={persons.find(p => p.personId === filters.personId) || null}
                        onChange={(_event, newValue) =>
                          handleFilterChange('personId', newValue ? newValue.personId : null)
                        }
                      />
                    </Grid>

                    {/* Remarks filter */}
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Search in Remarks"
                        placeholder="Type to search..."
                        size="small"
                        value={filters.remarks}
                        onChange={(e) => handleFilterChange('remarks', e.target.value)}
                        InputProps={{
                          startAdornment: <SearchIcon color="action" fontSize="small" sx={{ mr: 1 }} />,
                          endAdornment: filters.remarks ? (
                            <IconButton
                              size="small"
                              onClick={() => handleFilterChange('remarks', '')}
                              sx={{ visibility: filters.remarks ? 'visible' : 'hidden' }}
                            >
                              <ClearIcon fontSize="small" />
                            </IconButton>
                          ) : null
                        }}
                      />
                    </Grid>
                  </Grid>

                  {/* Active filter chips */}
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {filters.fromDate && (
                      <Chip
                        size="small"
                        label={`From: ${filters.fromDate}`}
                        onDelete={() => handleFilterChange('fromDate', '')}
                      />
                    )}
                    {filters.toDate && (
                      <Chip
                        size="small"
                        label={`To: ${filters.toDate}`}
                        onDelete={() => handleFilterChange('toDate', '')}
                      />
                    )}
                    {filters.categoryId !== null && (
                      <Chip
                        size="small"
                        label={`Category: ${categories.find(c => c.categoryId === filters.categoryId)?.categoryName}`}
                        onDelete={() => handleFilterChange('categoryId', null)}
                        color="primary"
                      />
                    )}
                    {filters.accountId !== null && (
                      <Chip
                        size="small"
                        label={`Account: ${accounts.find(a => a.accountId === filters.accountId)?.accountName}`}
                        onDelete={() => handleFilterChange('accountId', null)}
                        color="primary"
                      />
                    )}
                    {filters.personId !== null && (
                      <Chip
                        size="small"
                        label={`Person: ${persons.find(p => p.personId === filters.personId)?.personName}`}
                        onDelete={() => handleFilterChange('personId', null)}
                        color="primary"
                      />
                    )}
                    {filters.hasDebit !== null && (
                      <Chip
                        size="small"
                        label={`Debit: ${filters.hasDebit ? 'Yes' : 'No'}`}
                        onDelete={() => handleFilterChange('hasDebit', null)}
                        color="primary"
                      />
                    )}
                    {filters.hasCredit !== null && (
                      <Chip
                        size="small"
                        label={`Credit: ${filters.hasCredit ? 'Yes' : 'No'}`}
                        onDelete={() => handleFilterChange('hasCredit', null)}
                        color="primary"
                      />
                    )}
                    {filters.remarks && (
                      <Chip
                        size="small"
                        label={`Remarks: "${filters.remarks}"`}
                        onDelete={() => handleFilterChange('remarks', '')}
                        color="primary"
                      />
                    )}
                  </Box>
                </Paper>
              </Collapse>

              <TableContainer sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                boxShadow: 1,
                maxWidth: '100%',
                overflowX: 'auto',  // Enable horizontal scrolling for narrow screens
                '& .MuiTable-root': {
                  width: '100%'    // Use full width available
                }
              }}>
                <Table size="small" sx={{ 
                  minWidth: 800,   // Increased from 650 for more width
                  tableLayout: 'fixed',  // Fixed table layout helps control column widths
                  width: '100%'    // Use full width available
                }}>
                  <TableHead>
                    <TableRow sx={{
                      backgroundColor: 'primary.main',
                      '& th': {
                        color: 'primary.contrastText',
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                        py: 1.5
                      }
                    }}>
                      <TableCell width="90px">DATE</TableCell>
                      <TableCell width="160px">CATEGORY</TableCell>
                      <TableCell width="140px">ACCOUNT</TableCell>
                      <TableCell width="140px">PERSON</TableCell>
                      <TableCell width="100px" align="right">DEBIT</TableCell>
                      <TableCell width="100px" align="right">CREDIT</TableCell>
                      <TableCell width="250px">REMARKS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            No transactions found matching your filters
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTransactions
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((transaction) => {
                          const category = categories.find((c: Category) => c.categoryId === transaction.categoryId);
                          const isIncome = category?.type === 'INCOME';

                          return (
                            <TableRow
                              key={transaction.transactionId}
                              sx={{
                                backgroundColor: selectedRowId === transaction.transactionId ? 'action.selected' : 'inherit',
                                '&:hover': {
                                  backgroundColor: selectedRowId === transaction.transactionId ? 'action.selected' : 'action.hover',
                                },
                                cursor: 'pointer'
                              }}
                              onClick={() => {
                                // First set selected row ID for highlighting
                                setSelectedRowId(transaction.transactionId);
                                // Then trigger edit with a small delay to ensure UI updates first
                                setTimeout(() => handleEdit(transaction), 50);
                              }}
                            >
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                {(() => {
                                  try {
                                    const dateObj = new Date(transaction.date);
                                    // Check if date is valid
                                    if (isNaN(dateObj.getTime())) {
                                      return transaction.date || '-';
                                    }
                                    // Format as YYYY-MM-DD
                                    const year = dateObj.getFullYear();
                                    // Month is 0-indexed, so add 1 and pad with 0 if needed
                                    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                                    const day = String(dateObj.getDate()).padStart(2, '0');
                                    return `${year}-${month}-${day}`;
                                  } catch (e) {
                                    return transaction.date || '-';
                                  }
                                })()}
                              </TableCell>
                              <TableCell sx={{ 
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }} title={category?.categoryName || '-'}>
                                <Typography color={isIncome ? 'success.main' : 'error.main'} noWrap>
                                  {category?.categoryName || '-'}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ 
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }} title={accounts.find(a => a.accountId === transaction.accountId)?.accountName || '-'}>
                                {accounts.find(a => a.accountId === transaction.accountId)?.accountName || '-'}
                              </TableCell>
                              <TableCell sx={{ 
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }} title={persons.find(p => p.personId === transaction.personId)?.personName || '-'}>
                                {persons.find(p => p.personId === transaction.personId)?.personName || '-'}
                              </TableCell>
                              <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                {transaction.debitAmount !== undefined && transaction.debitAmount !== null
                                  ? Number(transaction.debitAmount).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  })
                                  : '-'}
                              </TableCell>
                              <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                {transaction.creditAmount !== undefined && transaction.creditAmount !== null
                                  ? Number(transaction.creditAmount).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  })
                                  : '-'}
                              </TableCell>
                              <TableCell sx={{ 
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '250px',
                                padding: '8px 12px'  // Add more padding for remarks
                              }} title={transaction.remarks || '-'}>
                                {transaction.remarks || '-'}
                              </TableCell>
                            </TableRow>
                          );
                        })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredTransactions.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  overflow: 'hidden',
                  bgcolor: 'background.paper',
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  '& .MuiTablePagination-select': {
                    fontWeight: 'medium'
                  },
                  '& .MuiTablePagination-displayedRows': {
                    fontWeight: 'medium'
                  }
                }}
              />
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Success message snackbar */}
      <Snackbar
        open={showSuccessAlert}
        autoHideDuration={4000}
        onClose={() => setShowSuccessAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSuccessAlert(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};
