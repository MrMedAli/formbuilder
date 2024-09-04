import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  Link,
} from "react-router-dom";
import InfoIcon from '@mui/icons-material/Info';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import DynamicFormIcon from '@mui/icons-material/DynamicForm';
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import PeopleIcon from "@mui/icons-material/People";
import AddBoxIcon from "@mui/icons-material/AddBox";

import SettingsIcon from "@mui/icons-material/Settings";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Divider from '@mui/material/Divider';
import EmailIcon from '@mui/icons-material/Email';
import GitHubIcon from '@mui/icons-material/GitHub';

import UserManager from "./components/UserManager";
import FormBuilder from "./components/FormBuilder";
import PresetManager from "./components/PresetManager";
import Login from "./components/Login";
import FormManager from "./components/FormManager";
import FillForm from "./components/FillForm";
import PrivateRoute from "./components/PrivateRoute";
import authService from "./services/authService";
import ChangePassword from "./components/ChangePassword";
import FormTemplates from "./components/FormTemplates";
import apiUrl from './config';

const drawerWidth = 240;

const theme = createTheme();

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // New state to track authentication

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
      setIsAuthenticated(true); // User is authenticated
    } else {
      setIsAuthenticated(false); // User is not authenticated
    }
  }, [currentUser]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false); // Set authentication state to false on logout
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const menuItems = [
    { text: "Users", icon: <PeopleIcon />, path: "/admin/users" },
    { text: "Presets", icon: <CreditCardIcon />, path: "/admin/presets" },
    { text: "Form Builder", icon: <AddBoxIcon />, path: "/admin/form-builder" },
    { text: "Form Template", icon: <DynamicFormIcon />, path: "/admin/formtemplate" },
    
  ];

  const filteredMenuItems = isAdmin
    ? menuItems
    : menuItems.filter(item => item.text === "Fill Form" || item.text === "Change Password" || item.text === "Presets" || item.text === "Form Template");

  const drawer = (
    <div>
      <Toolbar />
      <List>
        {filteredMenuItems.map((item) => (
          <ListItem button key={item.text} component={Link} to={item.path} onClick={item.onClick}>
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
                  currentUser ? <Navigate to="admin/presets" /> : <Login />
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
                path="/admin/formtemplate"
                element={
                  <PrivateRoute>
                    <FormTemplates />
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
          <IconButton
            color="inherit"
            onClick={handleOpenDialog}
            sx={{
              position: "fixed",
              bottom: 16,
              left: 16,
              zIndex: (theme) => theme.zIndex.drawer + 1,
            }}
          >
            <SettingsIcon />
          </IconButton>
        </Box>
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          aria-labelledby="dialog-title"
          maxWidth="md"
          fullWidth
        >
          <DialogTitle id="dialog-title">Settings</DialogTitle>
          <DialogContent>
            <Tabs value={tabIndex} onChange={handleTabChange} aria-label="settings tabs">
              <Tab label="About" />
              <Tab label="API and How to Use" />
              {isAuthenticated && <Tab label="Change Password" />} {/* Conditionally render tab */}
            </Tabs>
            {tabIndex === 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <InfoIcon sx={{ mr: 1 }} /> About This Application
                </Typography>
                <Typography variant="body1" paragraph>
                  This application is designed for seamless form customization, offering users the ability to create and manage custom forms with ease. It provides a rich set of features for form management, including the ability to manipulate JSON data and access a variety of free form templates. The app is Dockerizable, ensuring that it can be easily containerized and deployed in various environments, making it a versatile tool for developers and users alike.
                </Typography>
                <Typography variant="body1" paragraph>
                  Our goal is to provide a user-friendly experience that simplifies form creation and management. The application’s intuitive interface, combined with powerful features, makes it an ideal choice for both personal and professional use. Whether you need to build complex forms or quickly access pre-made templates, this app has you covered.
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body1" paragraph>
                  <strong>Contact Us:</strong>
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmailIcon sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    <a href="mailto:ghassen.almia@esprit.tn">ghassen.almia@esprit.tn</a>
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmailIcon sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    <a href="mailto:dali@gmail.com">m.benelhajaissa@ateme.com</a>
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <GitHubIcon sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    <a href="https://github.com/MrMedAli/formbuilder" target="_blank" rel="noopener noreferrer">
                      Visit our GitHub repository
                    </a>
                  </Typography>
                </Box>
              </Box>
            )}
            {tabIndex === 1 && (
              <Typography variant="body1" sx={{ mt: 2 }}>
                To use the API, visit the Swagger documentation at:
                <br />
                <Button component="a" href={`${apiUrl}/swagger/`} target="_blank">
                  Swagger Documentation
                </Button>
              </Typography>
            )}
            {tabIndex === 2 && isAuthenticated && ( // Conditionally render ChangePassword component
              <Box sx={{ mt: 2 }}>
                <ChangePassword />
              </Box>
            )}
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
