import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

const PrivateRoute = ({ children }) => {
  const currentUser = authService.getCurrentUser();

  return currentUser ? children : <Navigate to="/" />;
};

export default PrivateRoute;
