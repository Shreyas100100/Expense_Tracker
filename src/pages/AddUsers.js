// AddUsers.js
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, Snackbar, Box } from '@mui/material';
import { Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const AddUsers = () => {
  const { handleSubmit, control, formState: { errors }, reset } = useForm();
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = React.useState(false);

  const onSubmit = async (data) => {
    try {
      const docRef = await addDoc(collection(db, 'customers'), {
        customerId: '', // Leave it empty to auto-generate a unique ID
        customerName: data.customerName,
        shopNo: data.shopNo,
        phoneNumber: data.phoneNumber,
        billAmount: 0,
      });

      // Update the document with the auto-generated ID
      await updateDoc(doc(db, 'customers', docRef.id), {
        customerId: docRef.id,
      });

      console.log('Document written with ID: ', docRef.id);
    } catch (e) {
      console.error('Error adding document: ', e);
    }

    setOpenSnackbar(true);
    reset();

    setTimeout(() => {
      navigate('/customers');
    }, 2000);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        margin: 'auto',
        marginTop: 4,
        padding: 2,
        border: '1px solid #ccc',
        borderRadius: 4,
        boxShadow: 1,
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <h1>Add Customer</h1>
        <Controller
          name="customerName"
          control={control}
          defaultValue=""
          rules={{ required: 'Customer name is required' }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Customer Name"
              fullWidth
              margin="normal"
              error={!!errors.customerName}
              helperText={errors.customerName && errors.customerName.message}
            />
          )}
        />

        <Controller
          name="shopNo"
          control={control}
          defaultValue=""
          rules={{ required: 'Shop No. is required' }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Shop No."
              fullWidth
              margin="normal"
              error={!!errors.shopNo}
              helperText={errors.shopNo && errors.shopNo.message}
            />
          )}
        />

        <Controller
          name="phoneNumber"
          control={control}
          defaultValue=""
          rules={{
            required: 'Phone number is required',
            pattern: {
              value: /^[0-9]{10}$/,
              message: 'Invalid phone number',
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Phone Number"
              fullWidth
              margin="normal"
              error={!!errors.phoneNumber}
              helperText={errors.phoneNumber && errors.phoneNumber.message}
            />
          )}
        />

        <Button type="submit" variant="contained" color="primary" sx={{ marginTop: 2 }}>
          Submit
        </Button>

        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity="success">
            User added successfully!
          </Alert>
        </Snackbar>
      </form>
    </Box>
  );
};

export default AddUsers;
