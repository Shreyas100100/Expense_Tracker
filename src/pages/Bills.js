import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { format } from "date-fns";

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [acceptedPayments, setAcceptedPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [customerHistory, setCustomerHistory] = useState([]);
  const [openBillDialog, setOpenBillDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [billHistory, setBillHistory] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchBills = async () => {
      const billsSnapshot = await getDocs(collection(db, "bills"));
      const billsData = billsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBills(billsData);
    };

    const fetchAcceptedPayments = async () => {
      const paymentsSnapshot = await getDocs(
        collection(db, "AcceptedPayments")
      );
      const paymentsData = paymentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAcceptedPayments(paymentsData);
    };

    const fetchCustomers = async () => {
      const customersSnapshot = await getDocs(collection(db, "customers"));
      const customersData = customersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCustomers(customersData);
    };

    fetchBills();
    fetchAcceptedPayments();
    fetchCustomers();
  }, []);

  const handleCustomerChange = (event) => {
    setSelectedCustomer(event.target.value);
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleOpenBillDialog = (customerId) => {
    const customerBills = bills.filter(
      (bill) =>
        (selectedCustomer ? bill.customerId === selectedCustomer : true) &&
        (selectedMonth
          ? new Date(bill.date.seconds * 1000).getMonth() + 1 ===
              parseInt(selectedMonth) &&
            new Date(bill.date.seconds * 1000).getFullYear() ===
              parseInt(selectedYear)
          : true) &&
        bill.customerId === customerId
    );

    const billDetails = customerBills.flatMap((bill) =>
      bill.items.map((item) => ({
        date: new Date(bill.date.seconds * 1000).toLocaleString(),
        itemName: item.itemName,
        quantity: item.quantity,
        itemPrice: item.itemPrice,
        total: (item.quantity * item.itemPrice).toFixed(2),
      }))
    );

    setBillHistory(billDetails);
    setOpenBillDialog(true);
  };

  const handleOpenPaymentDialog = (customerId) => {
    const customerPayments = acceptedPayments.filter(
      (payment) => payment.customerId === customerId
    );

    const paymentDetails = customerPayments.map((payment) => ({
      date: new Date(payment.datetime.seconds * 1000).toLocaleString(),
      itemName: "Payment Received",
      quantity: "1",
      total: `-${payment.amountReceived.toFixed(2)}`,
    }));

    setPaymentHistory(paymentDetails);
    setOpenPaymentDialog(true);
  };

  const handleCloseBillDialog = () => {
    setOpenBillDialog(false);
  };

  const handleClosePaymentDialog = () => {
    setOpenPaymentDialog(false);
  };

  const clearFilters = () => {
    setSelectedCustomer("");
    setSelectedMonth("");
    setSelectedYear("");
  };

  const getMonthlyTotal = (customerId) => {
    const monthlyTotal = bills
      .filter(
        (bill) =>
          (customerId ? bill.customerId === customerId : true) &&
          (selectedMonth
            ? new Date(bill.date.seconds * 1000).getMonth() + 1 ===
                parseInt(selectedMonth) &&
              new Date(bill.date.seconds * 1000).getFullYear() ===
                parseInt(selectedYear)
            : true)
      )
      .reduce((total, bill) => total + bill.billAmount, 0);

    const monthlyPayments = acceptedPayments
      .filter((payment) => payment.customerId === customerId)
      .reduce((total, payment) => total - payment.amountReceived, 0);

    return (monthlyTotal + monthlyPayments).toFixed(2);
  };

  const getMonthlyPaymentsReceived = (customerId) => {
    const monthlyPaymentsReceived = acceptedPayments
      .filter(
        (payment) =>
          payment.customerId === customerId &&
          (selectedMonth
            ? new Date(payment.datetime.seconds * 1000).getMonth() + 1 ===
                parseInt(selectedMonth) &&
              new Date(payment.datetime.seconds * 1000).getFullYear() ===
                parseInt(selectedYear)
            : true)
      )
      .reduce((total, payment) => total + payment.amountReceived, 0);

    return monthlyPaymentsReceived;
  };

  return (
    <Box
      sx={{
        maxWidth: 800,
        margin: "auto",
        marginTop: 4,
        padding: 2,
        boxShadow: 1,
      }}
    >
      <Typography variant="h4">Bills History</Typography>

      <Button
        onClick={() => setShowFilters(!showFilters)}
        sx={{ marginBottom: 2 }}
      >
        {showFilters ? "Hide Filters" : "Show Filters"}
      </Button>

      {showFilters && (
        <>
          <FormControl fullWidth margin="normal">
            <InputLabel>Filter by Customer</InputLabel>
            <Select value={selectedCustomer} onChange={handleCustomerChange}>
              <MenuItem value="">All Customers</MenuItem>
              {customers.map((customer) => (
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
              {[...Array(12).keys()].map((month) => (
                <MenuItem key={month + 1} value={String(month + 1)}>
                  {new Date(2000, month, 1).toLocaleString("default", {
                    month: "long",
                  })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Filter by Year</InputLabel>
            <Select value={selectedYear} onChange={handleYearChange}>
              <MenuItem value="">All Years</MenuItem>
              {[...Array(5).keys()].map((index) => (
                <MenuItem key={index + 2020} value={index + 2020}>
                  {index + 2020}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button onClick={clearFilters} sx={{ marginBottom: 2 }}>
            Clear Filters
          </Button>
        </>
      )}

      <Paper sx={{ marginTop: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Customer Name</TableCell>
              <TableCell>Payment Received</TableCell>
              <TableCell>Bill Due</TableCell>
              <TableCell>Purchase</TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => {
              if (selectedCustomer && customer.id !== selectedCustomer) {
                return null;
              }

              const monthlyTotal = getMonthlyTotal(customer.id);
              const monthlyPaymentsReceived = getMonthlyPaymentsReceived(
                customer.id
              );

              return (
                <TableRow key={customer.id}>
                  <TableCell>{customer.customerName}</TableCell>
                  <TableCell>₹{monthlyPaymentsReceived.toFixed(2)}</TableCell>
                  <TableCell>₹{monthlyTotal}</TableCell>
                  <TableCell>₹{(
                    parseFloat(monthlyTotal) +
                    parseFloat(monthlyPaymentsReceived)
                  ).toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleOpenBillDialog(customer.id)}
                    >
                      View Bill Details
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleOpenPaymentDialog(customer.id)}
                    >
                      View Payment Details
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      {/* Bill Details Dialog */}
      <Dialog
        open={openBillDialog}
        onClose={handleCloseBillDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Bill Details</DialogTitle>
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
              {billHistory.map((bill, index) => (
                <TableRow key={index}>
                  <TableCell>{bill.date}</TableCell>
                  <TableCell>{bill.itemName}</TableCell>
                  <TableCell>{bill.quantity}</TableCell>
                  <TableCell>₹{bill.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBillDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Payment Details Dialog */}
      <Dialog
        open={openPaymentDialog}
        onClose={handleClosePaymentDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Payment Details</DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date & Time</TableCell>
                <TableCell>Item Name</TableCell>
                <TableCell>Amount Received</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paymentHistory.map((payment, index) => (
                <TableRow key={index}>
                  <TableCell>{payment.date}</TableCell>
                  <TableCell>{payment.itemName}</TableCell>
                  <TableCell>${payment.total * -1}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePaymentDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Bills;
