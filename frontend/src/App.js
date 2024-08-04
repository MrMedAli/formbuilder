import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  Link,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography"; // Import Typography here
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import DescriptionIcon from "@mui/icons-material/Description";
import SettingsIcon from "@mui/icons-material/Settings";
import AddBoxIcon from "@mui/icons-material/AddBox";
import EditIcon from "@mui/icons-material/Edit";
import HelpIcon from '@mui/icons-material/Help';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard";
import UserManager from "./components/UserManager";
import FormBuilder from "./components/FormBuilder";
import PresetManager from "./components/PresetManager";
import Login from "./components/Login";
import FormManager from "./components/FormManager";
import FillForm from "./components/FillForm";
import PrivateRoute from "./components/PrivateRoute";
import authService from "./services/authService";
import ChangePassword from "./components/ChangePassword";

const drawerWidth = 240;

const theme = createTheme();

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const currentUser = authService.getCurrentUser();

  function parseJwt(token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Invalid JWT token", e);
      return null;
    }
  }

  useEffect(() => {
    const token = currentUser?.access;

    if (token) {
      // Decode the token
      const decoded = parseJwt(token);

      console.log("Decoded token:", decoded);

      // Set the decoded token to state
      setIsAdmin(decoded?.is_admin ?? false);
    }
  }, [currentUser]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    authService.logout();
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/admin/dashboard" },
    { text: "Users", icon: <PeopleIcon />, path: "/admin/users" },
    { text: "Forms", icon: <DescriptionIcon />, path: "/admin/forms" },
    { text: "Presets", icon: <AddBoxIcon />, path: "/admin/presets" },
    { text: "Form Builder", icon: <AddBoxIcon />, path: "/admin/form-builder" },
    { text: "Fill Form", icon: <EditIcon />, path: "/fill-form" },
    { text: "Change Password", icon: <SettingsIcon />, path: "/change-password" }
  ];

  const filteredMenuItems = isAdmin
    ? menuItems
    : menuItems.filter(item => item.text === "Fill Form"  || item.text === "Change Password" || item.text === "Presets");

  const drawer = (
    <div>
      <Toolbar />
      <List>
        {filteredMenuItems.map((item) => (
          <ListItem button key={item.text} component={Link} to={item.path}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Box sx={{ display: "flex" }}>
          <CssBaseline />
          {currentUser && (
            <>
              <AppBar
                position="fixed"
                sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
              >
                <Toolbar>
                  <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{ mr: 2, display: { sm: "none" } }}
                  >
                    <MenuIcon />
                  </IconButton>
                  <Typography
                    variant="h6"
                    noWrap
                    component="div"
                    sx={{ flexGrow: 1 }}
                  >
                    {isAdmin ? "Admin Panel" : "User Panel"}
                  </Typography>
                  <IconButton color="inherit" onClick={handleOpenDialog}>
                    <HelpIcon />
                  </IconButton>
                  <Button color="inherit" onClick={handleLogout}>
                    Logout
                  </Button>
                </Toolbar>
              </AppBar>
              <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
              >
                <Drawer
                  variant="temporary"
                  open={mobileOpen}
                  onClose={handleDrawerToggle}
                  ModalProps={{
                    keepMounted: true,
                  }}
                  sx={{
                    display: { xs: "block", sm: "none" },
                    "& .MuiDrawer-paper": {
                      boxSizing: "border-box",
                      width: drawerWidth,
                    },
                  }}
                >
                  {drawer}
                </Drawer>
                <Drawer
                  variant="permanent"
                  sx={{
                    display: { xs: "none", sm: "block" },
                    "& .MuiDrawer-paper": {
                      boxSizing: "border-box",
                      width: drawerWidth,
                    },
                  }}
                  open
                >
                  {drawer}
                </Drawer>
              </Box>
            </>
          )}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              width: { sm: `calc(100% - ${drawerWidth}px)` },
            }}
          >
            <Toolbar />
            <Routes>
              <Route
                path="/"
                element={
                  currentUser ? <Navigate to="/admin/dashboard" /> : <Login />
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <PrivateRoute>
                    {isAdmin ? <AdminDashboard /> : <UserDashboard />}
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <PrivateRoute>
                    <UserManager />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/forms"
                element={
                  <PrivateRoute>
                    <FormManager />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/presets"
                element={
                  <PrivateRoute>
                    <PresetManager />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/form-builder"
                element={
                  <PrivateRoute>
                    <FormBuilder />
                  </PrivateRoute>
                }
              />
              <Route
                path="/fill-form"
                element={
                  <PrivateRoute>
                    <FillForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/change-password"
                element={
                  <PrivateRoute>
                    <ChangePassword />
                  </PrivateRoute>
                }
              />
            </Routes>
          </Box>
        </Box>
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          aria-labelledby="dialog-title"
        >
          <DialogTitle id="dialog-title">About This App</DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              This is a sample application that demonstrates various features including form management and user authentication.
            </Typography>
            <Typography variant="body2" gutterBottom>
              For API documentation, visit:
            </Typography>
            <Button
              component="a"
              href="http://localhost:8000/swagger/"
              target="_blank"
              rel="noopener"
            >
              Swagger Documentation
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Close</Button>
          </DialogActions>
        </Dialog>
      </Router>
    </ThemeProvider>
  );
}

export default App;
