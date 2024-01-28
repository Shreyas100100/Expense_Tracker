import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, updateDoc, doc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const Payment = () => {
  const [amountAccepted, setAmountAccepted] = useState('');
  const [billDue, setBillDue] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const customersSnapshot = await getDocs(collection(db, 'customers'));
        const customersData = customersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setCustomers(customersData);
      } catch (error) {
        console.error('Error fetching customers: ', error);
      }
    };

    fetchCustomers();
  }, []);

  const handleCustomerChange = async (event) => {
    const customerId = event.target.value;
    setSelectedCustomer(customerId);
    
    const selectedCustomerData = customers.find((customer) => customer.id === customerId);
    if (selectedCustomerData) {
      const billsSnapshot = await getDocs(collection(db, 'bills'));
      const billsData = billsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const acceptedPaymentsSnapshot = await getDocs(collection(db, 'AcceptedPayments'));
      const acceptedPaymentsData = acceptedPaymentsSnapshot.docs.map(doc => doc.data());

      const totalBillAmount = billsData
        .filter(bill => bill.customerId === customerId)
        .reduce((total, bill) => total + bill.billAmount, 0);

      const totalAcceptedPayment = acceptedPaymentsData
        .filter(payment => payment.customerId === customerId)
        .reduce((total, payment) => total + payment.amountReceived, 0);

      setBillDue(totalBillAmount - totalAcceptedPayment);
    }
  };

  const handleAmountChange = (event) => {
    setAmountAccepted(event.target.value);
  };

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();

    const acceptedAmount = parseFloat(amountAccepted);
    if (isNaN(acceptedAmount) || acceptedAmount <= 0) {
      alert('Please enter a valid positive amount.');
      return;
    }

    const customerRef = doc(db, 'customers', selectedCustomer);

    // Update the customer's bill amount
    await updateDoc(customerRef, {
      billAmount: billDue - acceptedAmount,
    });

    // Record the accepted payment in the AcceptedPayments collection
    const paymentRef = collection(db, 'AcceptedPayments');
    await addDoc(paymentRef, {
      customerId: selectedCustomer,
      amountReceived: acceptedAmount,
      datetime: serverTimestamp(),
    });

    setAmountAccepted('');
    setSelectedCustomer('');
    setBillDue(0);

    setOpenSnackbar(true);

    navigate('/');
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
      <Typography variant="h4">Accept Payment</Typography>

      <form onSubmit={handlePaymentSubmit} sx={{ marginTop: 2 }}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Select Customer</InputLabel>
          <Select value={selectedCustomer} onChange={handleCustomerChange} variant="outlined" sx={{ marginBottom: 2 }}>
            {customers.map((customer) => (
              <MenuItem key={customer.id} value={customer.id}>
                {customer.customerName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Enter Amount Accepted"
          type="number"
          fullWidth
          value={amountAccepted}
          onChange={handleAmountChange}
          variant="outlined"
          sx={{ marginBottom: 2 }}
        />

        <Typography variant="h6" sx={{ marginBottom: 2 }}>
          Bill Due: ${billDue.toFixed(2)}
        </Typography>

        <Button type="submit" variant="contained" color="primary" sx={{ marginTop: 2 }}>
          Submit Payment
        </Button>
      </form>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success">
          Payment accepted successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Payment;
