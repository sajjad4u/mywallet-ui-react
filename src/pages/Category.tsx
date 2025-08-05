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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { Category } from '../types';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

type CategoryFormInputs = {
  categoryName: string;
  type: 'INCOME' | 'EXPENSE';
  remarks?: string;
};

const schema = yup.object().shape({
  categoryName: yup.string().required('Category name is required'),
  type: yup.string().oneOf(['INCOME', 'EXPENSE']).required('Category type is required'),
  remarks: yup.string().optional().transform((value) => value === '' ? undefined : value)
});

export const CategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<CategoryFormInputs>({
    resolver: yupResolver(schema) as Resolver<CategoryFormInputs>,
    defaultValues: {
      categoryName: '',
      type: 'EXPENSE' as const,
      remarks: '',
    },
  });

  const categoryType = watch('type');

  const onSubmit = (data: CategoryFormInputs) => {
    if (editingCategory) {
      setCategories(categories.map(cat => 
        cat.categoryId === editingCategory.categoryId ? { ...data, categoryId: cat.categoryId } : cat
      ));
      setEditingCategory(null);
    } else {
      setCategories([...categories, { ...data, categoryId: Date.now() }]);
    }
    reset();
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    reset(category);
  };

  const handleDelete = (categoryId: number) => {
    setCategories(categories.filter(cat => cat.categoryId !== categoryId));
  };

  const handleReset = () => {
    reset();
    setEditingCategory(null);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Category Management
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Category Name"
                {...register('categoryName')}
                error={!!errors.categoryName}
                helperText={errors.categoryName?.message}
              />
              <FormControl fullWidth>
                <InputLabel>Category Type</InputLabel>
                <Select
                  value={categoryType}
                  label="Category Type"
                  onChange={(e) => setValue('type', e.target.value as 'INCOME' | 'EXPENSE')}
                >
                  <MenuItem value="INCOME">Income</MenuItem>
                  <MenuItem value="EXPENSE">Expense</MenuItem>
                </Select>
              </FormControl>
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
                  {editingCategory ? 'Update' : 'Save'}
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
                <TableCell>Category Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.categoryId}>
                  <TableCell>{category.categoryName}</TableCell>
                  <TableCell>{category.type}</TableCell>
                  <TableCell>{category.remarks}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleEdit(category)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(category.categoryId)} color="error">
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
