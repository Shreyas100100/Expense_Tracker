import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, Snackbar, Box } from '@mui/material';
import { Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const AddItems = () => {
  const { handleSubmit, control, formState: { errors }, reset } = useForm();
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = React.useState(false);

  const onSubmit = async (data) => {
    try {
      const docRef = await addDoc(collection(db, 'items'), {
        itemId: '', // Leave it empty to auto-generate a unique ID
        itemName: data.itemName,
        itemPrice: parseFloat(data.itemPrice), // Convert to number
      });

      // Update the document with the auto-generated ID
      await updateDoc(doc(db, 'items', docRef.id), {
        itemId: docRef.id,
      });

      console.log('Document written with ID: ', docRef.id);
    } catch (e) {
      console.error('Error adding document: ', e);
    }

    setOpenSnackbar(true);
    reset();

    setTimeout(() => {
      navigate('/menu');
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
        textAlign: 'center',
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <h1>Add Item</h1>
        <Controller
          name="itemName"
          control={control}
          defaultValue=""
          rules={{ required: 'Item name is required' }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Item Name"
              fullWidth
              margin="normal"
              error={!!errors.itemName}
              helperText={errors.itemName && errors.itemName.message}
            />
          )}
        />

        <Controller
          name="itemPrice"
          control={control}
          defaultValue=""
          rules={{
            required: 'Item price is required',
            pattern: {
              value: /^\d+(\.\d{1,2})?$/,
              message: 'Invalid item price',
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Item Price"
              fullWidth
              margin="normal"
              type="number" // Ensure the input type is set to 'number'
              error={!!errors.itemPrice}
              helperText={errors.itemPrice && errors.itemPrice.message}
            />
          )}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{
            marginTop: 2,
            backgroundColor: 'black',
            color: 'white',
            '&:hover': {
              backgroundColor: '#333', // Darken the background color on hover
            },
          }}
        >
          Submit
        </Button>

        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity="success">
            Item added successfully!
          </Alert>
        </Snackbar>
      </form>
    </Box>
  );
};

export default AddItems;
