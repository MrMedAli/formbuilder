import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <nav>
        <ul>
          <li>
            <Link to="/admin/form-builder">Form Builder</Link>
          </li>
          <li>
            <Link to="/fill-form">Fill Form</Link> {/* Add link to FillForm */}
          </li>
          {/* Add more links as needed */}
        </ul>
      </nav>
    </div>
  );
};

export default AdminDashboard;
