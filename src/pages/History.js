import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const History = () => {
  const [bills, setBills] = useState([]);
  const [acceptedPayments, setAcceptedPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [customerHistory, setCustomerHistory] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchBills = async () => {
      const billsSnapshot = await getDocs(collection(db, 'bills'));
      const billsData = billsSnapshot.docs.map(doc => ({ id: doc.id, type: 'bill', ...doc.data() }));
      setBills(billsData);
    };

    const fetchAcceptedPayments = async () => {
      const paymentsSnapshot = await getDocs(collection(db, 'AcceptedPayments'));
      const paymentsData = paymentsSnapshot.docs.map(doc => ({ id: doc.id, type: 'payment', ...doc.data() }));
      setAcceptedPayments(paymentsData);
    };

    const fetchCustomers = async () => {
      const customersSnapshot = await getDocs(collection(db, 'customers'));
      const customersData = customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCustomers(customersData);
    };

    fetchBills();
    fetchAcceptedPayments();
    fetchCustomers();
  }, []);

  const handleCustomerChange = event => {
    setSelectedCustomer(event.target.value);
  };

  const handleMonthChange = event => {
    setSelectedMonth(event.target.value);
  };

  const handleOpenDialog = customerId => {
    const customerData = customers.find(customer => customer.id === customerId);

    const customerBills = bills
      .filter(
        bill =>
          (selectedCustomer ? bill.customerId === selectedCustomer : true) &&
          (selectedMonth
            ? new Date(bill.date.seconds * 1000).getMonth() + 1 === parseInt(selectedMonth)
            : true) &&
          bill.customerId === customerId
      );

    const customerPayments = acceptedPayments.filter(payment => payment.customerId === customerId);

    const customerHistoryData = [
      ...customerBills.map(bill => ({
        type: 'bill',
        date: new Date(bill.date.seconds * 1000).toLocaleString(),
        itemName: bill.itemName,
        quantity: bill.quantity,
        total: bill.billAmount.toFixed(2),
      })),
      ...customerPayments.map(payment => ({
        type: 'payment',
        date: new Date(payment.datetime.seconds * 1000).toLocaleString(),
        itemName: 'Payment Received',
        quantity: '1',
        total: `-${payment.amountReceived.toFixed(2)}`,
      })),
    ];

    setCustomerHistory(customerHistoryData);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const getMonthlyTotal = customerId => {
    const monthlyTotal = bills
      .filter(
        bill =>
          (customerId ? bill.customerId === customerId : true) &&
          (selectedMonth
            ? new Date(bill.date.seconds * 1000).getMonth() + 1 === parseInt(selectedMonth)
            : true)
      )
      .reduce((total, bill) => total + bill.billAmount, 0);

    const monthlyPayments = acceptedPayments
      .filter(payment => payment.customerId === customerId)
      .reduce((total, payment) => total + payment.amountReceived, 0);

    return (monthlyTotal + monthlyPayments).toFixed(2);
  };

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', marginTop: 4, padding: 2, boxShadow: 1 }}>
      <Typography variant="h4">Bills History</Typography>

      <FormControl fullWidth margin="normal">
        <InputLabel>Filter by Customer</InputLabel>
        <Select value={selectedCustomer} onChange={handleCustomerChange}>
          <MenuItem value="">All Customers</MenuItem>
          {customers.map(customer => (
            <MenuItem key={customer.id} value={customer.id}>
              {customer.customerName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel>Filter by Month</InputLabel>
        <Select value={selectedMonth} onChange={handleMonthChange}>
          <MenuItem value="">All Months</MenuItem>
          {[...Array(12).keys()].map(month => (
            <MenuItem key={month + 1} value={String(month + 1)}>
              {new Date(2000, month, 1).toLocaleString('default', { month: 'long' })}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Paper sx={{ marginTop: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Customer Name</TableCell>
              <TableCell>Month</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>View Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map(customer => (
              <TableRow key={customer.id}>
                <TableCell>{customer.customerName}</TableCell>
                <TableCell>{getMonthlyTotal(customer.id)}</TableCell>
                <TableCell>${getMonthlyTotal(customer.id)}</TableCell>
                <TableCell>
                  <Button onClick={() => handleOpenDialog(customer.id)}>View Details</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Customer History Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Customer History</DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date & Time</TableCell>
                <TableCell>Item Name</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customerHistory.map((history, index) => (
                <TableRow key={index}>
                  <TableCell>{history.date}</TableCell>
                  <TableCell>{history.itemName}</TableCell>
                  <TableCell>{history.quantity}</TableCell>
                  <TableCell>${history.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default History;
