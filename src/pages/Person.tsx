import React, { useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler, Resolver } from "react-hook-form";
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
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import type { Person } from "../types";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

interface PersonFormData {
  personName: string;
  contactNo?: string;
  email?: string;
  remarks?: string;
}

const schema = yup.object<PersonFormData>().shape({
  personName: yup.string().required('Person name is required'),
  contactNo: yup.string(),
  email: yup.string().email('Invalid email format'),
  remarks: yup.string(),
});

export const PersonPage: React.FC = () => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PersonFormData>({
    resolver: yupResolver(schema) as Resolver<PersonFormData>,
    defaultValues: {
      personName: '',
      contactNo: undefined,
      email: undefined,
      remarks: undefined,
    },
  });

  const onSubmit: SubmitHandler<PersonFormData> = (data) => {
    if (editingPerson) {
      setPersons(persons.map(p => 
        p.personId === editingPerson.personId ? { ...data, personId: p.personId } : p
      ));
      setEditingPerson(null);
    } else {
      setPersons([...persons, { ...data, personId: Date.now() }]);
    }
    reset();
  };

  const handleEdit = (person: Person) => {
    setEditingPerson(person);
    reset(person);
  };

  const handleDelete = (personId: number) => {
    setPersons(persons.filter(p => p.personId !== personId));
  };

  const handleReset = () => {
    reset();
    setEditingPerson(null);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Person Management
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Person Name"
                {...register('personName')}
                error={!!errors.personName}
                helperText={errors.personName?.message}
              />
              <TextField
                label="Contact Number"
                {...register('contactNo')}
                error={!!errors.contactNo}
                helperText={errors.contactNo?.message}
              />
              <TextField
                label="Email"
                type="email"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
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
                  {editingPerson ? 'Update' : 'Save'}
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
                <TableCell>Name</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {persons.map((person) => (
                <TableRow key={person.personId}>
                  <TableCell>{person.personName}</TableCell>
                  <TableCell>{person.contactNo}</TableCell>
                  <TableCell>{person.email}</TableCell>
                  <TableCell>{person.remarks}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleEdit(person)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(person.personId)} color="error">
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
