import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
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
  Paper,
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
    setValue,
  } = useForm();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });
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

      // Update customer's bill amount
      await updateDoc(doc(db, 'customers', selectedCustomer.id), {
        billAmount: selectedCustomer.billAmount + billAmount,
      });

      // Create a new bill document
      await addDoc(collection(db, 'bills'), {
        customerId: data.customerId,
        customerName: selectedCustomer.customerName,
        items: data.items,
        date: serverTimestamp(),
        billAmount: billAmount,
        transactionDateTime: serverTimestamp(), // Add date and time
      });

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

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...fields];
    updatedItems[index][field] = value;
  
    // Recalculate the total bill amount
    const totalAmount = updatedItems.reduce((acc, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const itemId = item.itemId;
      const selectedItem = itemNamesAndPrices.find((item) => item.id === itemId);
      const itemPrice = parseFloat(selectedItem.itemPrice) || 0;
  
      return acc + quantity * itemPrice;
    }, 0);
  
    setBillAmount(totalAmount);
    setValue(`items`, updatedItems);
  };
  

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: 600,
        margin: 'auto',
        marginTop: 4,
        padding: 2,
        border: '1px solid #ccc',
        borderRadius: 4,
        boxShadow: 1,
      }}
    >
      <Paper elevation={3} sx={{ padding: 2, width: '100%' }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Typography variant="h5" sx={{ textAlign: 'center', marginBottom: 2 }}>
            Add Bill
          </Typography>

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

          {fields.map((item, index) => (
            <Box key={item.id} display="flex" alignItems="center">
              <FormControl fullWidth margin="normal">
                <InputLabel>Item</InputLabel>
                <Select
                  value={item.itemId}
                  onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                  displayEmpty
                >
                  {itemNamesAndPrices.map((itemOption) => (
                    <MenuItem key={itemOption.id} value={itemOption.id}>
                      {itemOption.itemName} {itemOption.itemPrice}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Quantity"
                type="number"
                fullWidth
                margin="normal"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
              />

              <Button type="button" onClick={() => remove(index)}>
                Remove Item
              </Button>
            </Box>
          ))}

          <Button
            type="button"
            onClick={() => append({ itemId: '', quantity: '' })}
          >
            Add Item
          </Button>

          <Typography variant="h6" sx={{ marginTop: 2 }}>
            Current Bill Amount: ${billAmount.toFixed(2)}
          </Typography>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ marginTop: 2, backgroundColor: 'black', color: 'white', '&:hover': { backgroundColor: '#333' } }}
          >
            Submit
          </Button>

          <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
            <Alert onClose={handleCloseSnackbar} severity="success">
              Bill added successfully!
            </Alert>
          </Snackbar>
        </form>
      </Paper>
    </Box>
  );
};

export default AddBill;
