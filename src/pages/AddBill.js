// AddBill.js
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  TextField,
  Button,
  Snackbar,
  Box,
  MenuItem,
  InputLabel,
  FormControl,
  Select,
  Typography,
} from '@mui/material';
import { Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const AddBill = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm();
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [customerNames, setCustomerNames] = useState([]);
  const [itemNamesAndPrices, setItemNamesAndPrices] = useState([]);
  const [billAmount, setBillAmount] = useState(0);

  useEffect(() => {
    const fetchCustomersAndItems = async () => {
      try {
        const customersSnapshot = await getDocs(collection(db, 'customers'));
        const customersData = customersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setCustomers(customersData);

        const itemsSnapshot = await getDocs(collection(db, 'items'));
        const itemsData = itemsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setItems(itemsData);

        const customerNamesData = customersData.map((customer) => ({ id: customer.id, name: customer.customerName }));
        setCustomerNames(customerNamesData);

        setItemNamesAndPrices(itemsData.map(({ id, itemName, itemPrice }) => ({ id, itemName, itemPrice })));
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };

    fetchCustomersAndItems();
  }, []);

  const onSubmit = async (data) => {
    try {
      const selectedCustomer = customers.find((customer) => customer.id === data.customerId);
      const selectedItem = itemNamesAndPrices.find((item) => item.id === data.itemId);

      const billAmountIncrement = parseFloat(data.quantity) * parseFloat(selectedItem.itemPrice);

      // Update customer's bill amount
      await updateDoc(doc(db, 'customers', selectedCustomer.id), {
        billAmount: selectedCustomer.billAmount + billAmountIncrement,
      });

      // Create a new bill document
      await addDoc(collection(db, 'bills'), {
        customerId: data.customerId,
        customerName: selectedCustomer.customerName,
        itemId: data.itemId,
        itemName: selectedItem.itemName,
        itemPrice: selectedItem.itemPrice,
        quantity: parseFloat(data.quantity),
        date: serverTimestamp(),
        billAmount: billAmountIncrement,
        transactionDateTime: serverTimestamp(), // Add date and time
      });

      setBillAmount((prevAmount) => prevAmount + billAmountIncrement);

      setOpenSnackbar(true);
      reset();

      setTimeout(() => {
        navigate('/bills');
      }, 2000);
    } catch (e) {
      console.error('Error adding bill: ', e);
    }
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
        maxWidth: 600,
        margin: 'auto',
        marginTop: 4,
        padding: 2,
        border: '1px solid #ccc',
        borderRadius: 4,
        boxShadow: 1,
      }}
    >
      <form >
        <h1>Add Bill</h1>

        <Controller
          name="customerId"
          control={control}
          defaultValue=""
          rules={{ required: 'Customer is required' }}
          render={({ field }) => (
            <FormControl fullWidth margin="normal">
              <InputLabel>Customer</InputLabel>
              <Select {...field} displayEmpty>
                {customerNames.map((customer) => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />

        <Controller
          name="itemId"
          control={control}
          defaultValue=""
          rules={{ required: 'Item is required' }}
          render={({ field }) => (
            <FormControl fullWidth margin="normal">
              <InputLabel>Item</InputLabel>
              <Select {...field} displayEmpty>
                {itemNamesAndPrices.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.itemName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />

        <Controller
          name="quantity"
          control={control}
          defaultValue=""
          rules={{
            required: 'Quantity is required',
            pattern: {
              value: /^\d+(\.\d{1,2})?$/,
              message: 'Invalid quantity',
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Quantity"
              fullWidth
              margin="normal"
              type="number"
              error={!!errors.quantity}
              helperText={errors.quantity && errors.quantity.message}
            />
          )}
        />
    <Typography variant="h6" sx={{ marginTop: 2 }}>
        Current Bill Amount: ${billAmount.toFixed(2)}
      </Typography>
        <Button type="submit" variant="contained" color="primary" sx={{ marginTop: 2 }}
        onClick={handleSubmit(onSubmit)}>
          Submit
        </Button>

        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity="success">
            Bill added successfully!
          </Alert>
        </Snackbar>
      </form>
            
      {/* Display the current bill amount at the bottom */}
    
    </Box>
  );
};

export default AddBill;
