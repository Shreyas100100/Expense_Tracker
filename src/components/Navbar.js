import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Link, useNavigate } from "react-router-dom";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9", // customize the primary color
    },
  },
});

export default function Navbar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
          <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/"
              sx={{
                flexGrow: 1,
                color: "inherit",
                textDecoration: "none",
                textAlign: { xs: "center", md: "left" },
              }}
            >
              EXPENSE TRACKER
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right", // Change from "left" to "right" for mobile view
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: "block", md: "none" },
                }}
              >
                <MenuItem
                  component={Link}
                  to="/AddUsers"
                  onClick={handleCloseNavMenu}
                >
                  <Typography textAlign="center">Add User</Typography>
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/AddMenu"
                  onClick={handleCloseNavMenu}
                >
                  <Typography textAlign="center">Add Menu</Typography>
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/AddBill"
                  onClick={handleCloseNavMenu}
                >
                  <Typography textAlign="center">Add Bill</Typography>
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/History"
                  onClick={handleCloseNavMenu}
                >
                  <Typography textAlign="center">History</Typography>
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/Customers"
                  onClick={handleCloseNavMenu}
                >
                  <Typography textAlign="center">Customers</Typography>
                </MenuItem>
              </Menu>
            </Box>

            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              <Button
                component={Link}
                to="/AddUsers"
                sx={{ my: 2, color: "white", display: "block" }}
              >
                Add User
              </Button>
              <Button
                component={Link}
                to="/AddItems"
                sx={{ my: 2, color: "white", display: "block" }}
              >
                Add Items
              </Button>
              <Button
                component={Link}
                to="/menu"
                sx={{ my: 2, color: "white", display: "block" }}
              >
                Menu
              </Button>
              <Button
                component={Link}
                to="/AddBill"
                sx={{ my: 2, color: "white", display: "block" }}
              >
                Add Bill
              </Button>
              <Button
                component={Link}
                to="/History"
                sx={{ my: 2, color: "white", display: "block" }}
              >
                History
              </Button>
              <Button
                component={Link}
                to="/todaybills"
                sx={{ my: 2, color: "white", display: "block" }}
              >
                Today Bills
              </Button>

              <Button
                component={Link}
                to="/bills"
                sx={{ my: 2, color: "white", display: "block" }}
              >
                 Bills
              </Button>
              <Button
                component={Link}
                to="/Customers"
                sx={{ my: 2, color: "white", display: "block" }}
              >
                Customers
              </Button>
              <Button
                component={Link}
                to="/Payment"
                sx={{ my: 2, color: "white", display: "block" }}
              >
                Payment
              </Button>
            </Box>

            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar>
                    {user ? user.email.charAt(0).toUpperCase() : ""}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem>
                  <Typography textAlign="center">
                    {user ? user.email : "Guest"}
                  </Typography>
                </MenuItem>
                <MenuItem>
                  <Typography textAlign="center">Profile</Typography>
                </MenuItem>
                <MenuItem>
                  <Typography textAlign="center">Account</Typography>
                </MenuItem>
                <MenuItem>
                  <Typography textAlign="center">Dashboard</Typography>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    auth.signOut();
                    handleCloseUserMenu();
                    navigate("/");
                  }}
                >
                  <Typography textAlign="center">Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </ThemeProvider>
  );
}
