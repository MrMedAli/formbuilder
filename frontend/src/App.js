import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import UserManager from './components/UserManager';
import FormBuilder from './components/FormBuilder';
import PresetManager from './components/PresetManager';
import Login from './components/Login';
import FormManager from './components/FormManager';
import FillForm from './components/FillForm'; // Import the new component
import PrivateRoute from './components/PrivateRoute';
import authService from './services/authService';

function App() {
  const currentUser = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <Router>
      <div>
        {currentUser && (
          <button onClick={handleLogout}>Logout</button>
        )}
        <Routes>
          <Route path="/" element={currentUser ? <Navigate to="/admin/dashboard" /> : <Login />} />
          <Route path="/admin/dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute><UserManager /></PrivateRoute>} />
          <Route path="/admin/forms" element={<PrivateRoute><FormManager /></PrivateRoute>} />
          <Route path="/admin/presets" element={<PrivateRoute><PresetManager /></PrivateRoute>} />
          <Route path="/admin/form-builder" element={<PrivateRoute><FormBuilder /></PrivateRoute>} />
          <Route path="/fill-form" element={<PrivateRoute><FillForm /></PrivateRoute>} /> {/* Add the new route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
