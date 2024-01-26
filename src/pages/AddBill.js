// AddBill.js
import React, { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
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
} from "@mui/material";
import { Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

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
    name: "items",
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
        const customersSnapshot = await getDocs(collection(db, "customers"));
        const customersData = customersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCustomers(customersData);

        const itemsSnapshot = await getDocs(collection(db, "items"));
        const itemsData = itemsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(itemsData);

        const customerNamesData = customersData.map((customer) => ({
          id: customer.id,
          name: customer.customerName,
        }));
        setCustomerNames(customerNamesData);

        setItemNamesAndPrices(
          itemsData.map(({ id, itemName, itemPrice }) => ({
            id,
            itemName,
            itemPrice,
          }))
        );
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchCustomersAndItems();
  }, []);

  const onSubmit = async (data) => {
    try {
      const selectedCustomer = customers.find(
        (customer) => customer.id === data.customerId
      );

      // Validate customerId
      if (!data.customerId) {
        // Handle customerId validation error
        console.error("Customer is required");
        return;
      }

      // Validate billAmount
      if (billAmount <= 0) {
        // Handle billAmount validation error
        console.error("Bill amount must be greater than zero");
        return;
      }

      // Update customer's bill amount
      const newCustomerBillAmount = selectedCustomer.billAmount + billAmount;
      await updateDoc(doc(db, "customers", selectedCustomer.id), {
        billAmount: newCustomerBillAmount,
      });

      // Create a new bill document
      await addDoc(collection(db, "bills"), {
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
        navigate("/bills");
      }, 2000);
    } catch (e) {
      console.error("Error adding bill: ", e);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
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
      const selectedItem = itemNamesAndPrices.find(
        (item) => item.id === itemId
      );
      const itemPrice = parseFloat(selectedItem.itemPrice) || 0;

      return acc + quantity * itemPrice;
    }, 0);

    setBillAmount(totalAmount);
    setValue(`items`, updatedItems);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        maxWidth: 600,
        margin: "auto",
        marginTop: 4,
        padding: 2,
        border: "1px solid #ccc",
        borderRadius: 4,
        boxShadow: 1,
      }}
    >
      <Paper elevation={3} sx={{ padding: 2, width: "100%" }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Typography
            variant="h5"
            sx={{ textAlign: "center", marginBottom: 2 }}
          >
            Add Bill
          </Typography>

          <FormControl fullWidth margin="normal">
            <InputLabel>Customer</InputLabel>
            <Controller
              name="customerId"
              control={control}
              defaultValue=""
              rules={{ required: "Customer is required" }}
              render={({ field }) => (
                <Select {...field} displayEmpty>
                  {customerNames.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.customerId && (
              <Typography color="red">{errors.customerId.message}</Typography>
            )}
          </FormControl>

          {fields.map((item, index) => (
            <Box key={item.id} display="flex" alignItems="center" mb={2}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Item</InputLabel>
                <Select
                  value={item.itemId}
                  onChange={(e) =>
                    handleItemChange(index, "itemId", e.target.value)
                  }
                  displayEmpty
                >
                  {itemNamesAndPrices.map((itemOption) => (
                    <MenuItem key={itemOption.id} value={itemOption.id}>
                      {itemOption.itemName} - ${itemOption.itemPrice}
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
                onChange={(e) =>
                  handleItemChange(index, "quantity", e.target.value)
                }
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                }}
              />
              {parseFloat(item.quantity) < 0 && (
                <Typography color="red">Quantity cannot be negative</Typography>
              )}

              <Button
                type="button"
                onClick={() => remove(index)}
                sx={{ marginLeft: 1 }}
              >
                Remove
              </Button>
            </Box>
          ))}

          <Button
            variant="outlined"
            onClick={() => {
              append({ itemId: "", quantity: "" });
            }}
            sx={{ marginBottom: 2 }}
          >
            Add Item
          </Button>

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Typography variant="subtitle1">Total: ${billAmount}</Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>
              Save
            </Button>
          </Box>
        </form>
      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: "100%" }}>
          Bill added successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddBill;
