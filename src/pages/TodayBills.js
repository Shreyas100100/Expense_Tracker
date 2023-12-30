// TodayBills.js
import React, { useState, useEffect } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { collection, getDocs, query, where, getFirestore } from 'firebase/firestore';
import { db } from '../firebase';

const TodayBills = () => {
  const [todayBills, setTodayBills] = useState([]);

  useEffect(() => {
    const fetchTodayBills = async () => {
      try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 0, 0);

        const billsQuery = query(
          collection(db, 'bills'),
          where('timestamp', '>=', startOfDay),
          where('timestamp', '<', endOfDay)
        );

        const querySnapshot = await getDocs(billsQuery);
        const todayBillsData = [];
        querySnapshot.forEach((doc) => {
          todayBillsData.push({ id: doc.id, ...doc.data() });
        });
        setTodayBills(todayBillsData);
      } catch (error) {
        console.error('Error fetching today bills: ', error);
      }
    };

    fetchTodayBills();
  }, []);

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', marginTop: 4 }}>
      <h1>Today's Bills</h1>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Customer Name</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Item Purchased</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Bill Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {todayBills.map((bill) => (
              <TableRow key={bill.id}>
                {/* You may need to fetch customer name and item name from their respective collections */}
                <TableCell>{bill.customerId}</TableCell>
                <TableCell>{bill.timestamp.toDate().toLocaleTimeString()}</TableCell>
                <TableCell>{bill.itemId}</TableCell>
                <TableCell>{bill.quantity}</TableCell>
                <TableCell>{bill.billAmount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TodayBills;
