import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  Link,
} from "react-router-dom";
import PreviewIcon from '@mui/icons-material/Preview';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
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
import FormBuilderr from "./components/FormBuilderr"; // Importer FormBuilderr
import PresetManager from "./components/PresetManager";
import Login from "./components/Login";
import FormManager from "./components/FormManager";
import PrivateRoute from "./components/PrivateRoute";
import authService from "./services/authService";
import ChangePassword from "./components/ChangePassword";
import FormTemplates from "./components/FormTemplates";
import FormView from "./components/FormView";
import EditForm from "./components/EditForm";
import FillForms from "./components/FillForms";

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
    { text: "Form Template", icon: <PreviewIcon />, path: "/admin/formtemplate" },
    { text: "Form Builderr", icon: <DynamicFormIcon />, path: "/admin/form-builderr" },
    
    // Add this line for FillForms
  ];

  const filteredMenuItems = isAdmin
    ? menuItems
    : menuItems.filter(item => item.text === "Fill Form" || item.text === "Change Password" || item.text === "Presets" || item.text === "Form Template");

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
             
              <Route path="/formulaires/:id" element={<FormView />} />
              <Route path="/formulaires/edit/:id" element={<EditForm />} />
              <Route
                path="/admin/presets"
                element={
                  <PrivateRoute>
                    <PresetManager />
                  </PrivateRoute>
                }
              />
  
              <Route
                path="/admin/fillforms"
                element={
                  <PrivateRoute>
                    <FillForms />
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
                path="/admin/form-builderr"
                element={
                  <PrivateRoute>
                    <FormBuilderr /> {/* Ajouter FormBuilderr ici */}
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/change-password"
                element={
                  <PrivateRoute>
                    <ChangePassword />
                  </PrivateRoute>
                }
              />
              {/* Redirect or other routes */}
            </Routes>
          </Box>
          <Dialog open={openDialog} onClose={handleCloseDialog}>
            <DialogTitle>Settings</DialogTitle>
            <DialogContent>
              <Tabs
                value={tabIndex}
                onChange={handleTabChange}
                aria-label="settings tabs"
              >
                <Tab label="About" />
                <Tab label="API and How to Use" />
                <Tab label="About Page" />
                <Tab label="Change Password" />
              </Tabs>
              <Divider />
              {tabIndex === 0 && <Typography>About content</Typography>}
              {tabIndex === 1 && <Typography>API and How to Use content</Typography>}
              {tabIndex === 2 && <Typography>About Page content</Typography>}
              {tabIndex === 3 && (
                <ChangePassword /> // Assuming you have this component for changing password
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
