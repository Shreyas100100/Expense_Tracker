import React, { useState, useEffect,nav } from 'react';
import { Typography, Box, Grid, Paper, Table, TableContainer, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function Home({ navigate }) {
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalBillAmounts, setTotalBillAmounts] = useState(0);
  const [totalPayments, setTotalPayments] = useState(0);
  const [customerPurchases, setCustomerPurchases] = useState([]);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const customersSnapshot = await getDocs(collection(db, 'customers'));
        const billsSnapshot = await getDocs(collection(db, 'bills'));
        const paymentsSnapshot = await getDocs(collection(db, 'AcceptedPayments'));

        const totalCustomersCount = customersSnapshot.docs.length;
        const totalPaymentsCount = paymentsSnapshot.docs.length;

        setTotalCustomers(totalCustomersCount);
        setTotalPayments(totalPaymentsCount);

        // Calculate total bill amounts
        const totalBillAmountsSum = billsSnapshot.docs.reduce((total, bill) => {
          return total + bill.data().billAmount;
        }, 0);

        setTotalBillAmounts(totalBillAmountsSum);

        // Fetch customer purchases
        const today = new Date().toLocaleDateString();
        const customerPurchasesData = [];
        billsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const purchaseDate = new Date(data.date.seconds * 1000).toLocaleDateString();
          if (purchaseDate === today) {
            customerPurchasesData.push({
              customerName: data.customerName,
              purchaseTime: new Date(data.date.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              billAmount: data.billAmount,
            });
          }
        });

        setCustomerPurchases(customerPurchasesData);

        // Set current date
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        const currentDate = new Date().toLocaleDateString('en-US', options);
        setCurrentDate(currentDate);
      } catch (error) {
        console.error('Error fetching statistics: ', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome to the Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              {currentDate}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 2 }} >
            <Typography variant="h6" gutterBottom>
              Total Customers
            </Typography>
            <Typography variant="h4">{totalCustomers}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              Total Bill Amounts
            </Typography>
            <Typography variant="h4">₹{totalBillAmounts}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              Total Payments
            </Typography>
            <Typography variant="h4">{totalPayments}</Typography>
          </Paper>
        </Grid>
      </Grid>
      <Box sx={{ marginTop: 3 }}>
        <Typography variant="h6" gutterBottom>
          Today's Purchases
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Customer Name</TableCell>
                <TableCell>Purchase Time</TableCell>
                <TableCell>Bill Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customerPurchases.map((purchase, index) => (
                <TableRow key={index}>
                  <TableCell>{purchase.customerName}</TableCell>
                  <TableCell>{purchase.purchaseTime}</TableCell>
                  <TableCell>₹{purchase.billAmount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}

export default Home;
