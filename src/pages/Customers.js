import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const customersSnapshot = await getDocs(collection(db, "customers"));
        const customersData = await Promise.all(
          customersSnapshot.docs.map(async (customerDoc) => {
            const customer = { id: customerDoc.id, ...customerDoc.data() };

            // Calculate the sum of bill amounts for the current customer
            const billsQuery = query(collection(db, 'bills'), where('customerId', '==', customer.id));
            const billsSnapshot = await getDocs(billsQuery);
            const totalBillAmount = billsSnapshot.docs.reduce((total, billDoc) => {
              const billData = billDoc.data();
              return total + (billData.billAmount || 0);
            }, 0);

            // Calculate the sum of amountReceived for the current customer
            const paymentsQuery = query(collection(db, 'AcceptedPayments'), where('customerId', '==', customer.id));
            const paymentsSnapshot = await getDocs(paymentsQuery);
            const totalAmountReceived = paymentsSnapshot.docs.reduce((total, paymentDoc) => {
              const paymentData = paymentDoc.data();
              return total + (paymentData.amountReceived || 0);
            }, 0);

            // Subtract the totalAmountReceived from totalBillAmount
            customer.totalBillAmount = totalBillAmount - totalAmountReceived;

            return customer;
          })
        );

        console.log("Customers data:", customersData);
        setCustomers(customersData);
      } catch (error) {
        console.error("Error fetching customers: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <Box sx={{ maxWidth: 600, margin: "auto", marginTop: 4 }}>
      <h1>Customers</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Customer Name</TableCell>
                <TableCell>Shop No.</TableCell>
                <TableCell>Phone Number</TableCell>
                <TableCell>Total Bill Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.customerName}</TableCell>
                  <TableCell>{customer.shopNo}</TableCell>
                  <TableCell>{customer.phoneNumber}</TableCell>
                  <TableCell>{customer.totalBillAmount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Customers;
