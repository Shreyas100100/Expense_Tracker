import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Typography,
  Toolbar,
  AppBar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  createTheme,
  ThemeProvider,
  useTheme,
  darken,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [editedPrice, setEditedPrice] = useState('');

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'items'));
        const menuItemsData = [];
        querySnapshot.forEach((doc) => {
          menuItemsData.push({ id: doc.id, ...doc.data() });
        });
        setMenuItems(menuItemsData);
      } catch (error) {
        console.error('Error fetching menu items: ', error);
      }
    };

    fetchMenuItems();
  }, []);

  const handleEdit = (item) => {
    setSelectedItem(item);
    setEditedName(item.itemName);
    setEditedPrice(item.itemPrice.toString()); // Ensure it's a string for TextField
    setEditDialogOpen(true);
  };

  const handleSaveChanges = async () => {
    try {
      await updateDoc(doc(db, 'items', selectedItem.id), {
        itemName: editedName,
        itemPrice: parseFloat(editedPrice),
      });
      setEditDialogOpen(false);
      const updatedItems = menuItems.map((item) =>
        item.id === selectedItem.id ? { ...item, itemName: editedName, itemPrice: parseFloat(editedPrice) } : item
      );
      setMenuItems(updatedItems);
    } catch (error) {
      console.error('Error updating item: ', error);
    }
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteDoc(doc(db, 'items', selectedItem.id));
      setMenuItems((prevItems) => prevItems.filter((item) => item.id !== selectedItem.id));
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting item: ', error);
    }
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  return (
    <Box sx={{ flexGrow: 1, marginTop: 4, padding: 4, maxWidth: 800, margin: 'auto' }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div">
            Menu
          </Typography>
        </Toolbar>
      </AppBar>
      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item Name</TableCell>
              <TableCell>Item Price</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {menuItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.itemName}</TableCell>
                <TableCell>
                ₹{typeof item.itemPrice === 'number' ? `${item.itemPrice.toFixed(2)}` : item.itemPrice}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(item)} color="primary" aria-label="edit">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(item)} color="error" aria-label="delete">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ marginTop: 2, textAlign: 'right' }}>
        <Button component={Link} to="/additems" startIcon={<AddIcon />} color="primary">
          Add Item
        </Button>
      </Box>
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog}>
        <DialogTitle>Edit Item</DialogTitle>
        <DialogContent>
          <TextField
            label="Item Name"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Item Price"
            value={editedPrice}
            onChange={(e) => setEditedPrice(e.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSaveChanges} color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Item</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this item: <strong>{selectedItem?.itemName}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Menu;
