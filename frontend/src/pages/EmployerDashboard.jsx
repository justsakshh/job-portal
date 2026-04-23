import React from 'react';
import { useAuth } from '../context/AuthContext';

const EmployerDashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <h2>Employer Dashboard</h2>
      <p>Welcome, {user.email}!</p>
      <p>This is where you can post jobs, manage applications, and view company profile.</p>
    </div>
  );
};

export default EmployerDashboard;
