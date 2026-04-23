import React from 'react';
import { useAuth } from '../context/AuthContext';

const JobSeekerDashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <h2>Job Seeker Dashboard</h2>
      <p>Welcome, {user.email}!</p>
      <p>This is where you can view your applied jobs, manage your profile, and search for new opportunities.</p>
    </div>
  );
};

export default JobSeekerDashboard;
