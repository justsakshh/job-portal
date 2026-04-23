import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import RoleRoute from './routes/RoleRoute';
import ProtectedRoute from './routes/ProtectedRoute';

// Lazy loading components
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Profile = React.lazy(() => import('./pages/Profile'));
const JobList = React.lazy(() => import('./pages/JobList'));
const JobDetails = React.lazy(() => import('./pages/JobDetails'));
const PostJob = React.lazy(() => import('./pages/PostJob'));
const ApplyJob = React.lazy(() => import('./pages/ApplyJob'));
const MyApplications = React.lazy(() => import('./pages/MyApplications'));
const EmployerApplications = React.lazy(() => import('./pages/EmployerApplications'));
const Messages = React.lazy(() => import('./pages/Messages'));
const Chat = React.lazy(() => import('./pages/Chat'));
const Notifications = React.lazy(() => import('./pages/Notifications'));

// Simple Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
          <div className="text-center">
            <h1 className="display-4 text-danger mb-4">Something went wrong</h1>
            <p className="text-muted mb-4">The application encountered an unexpected error.</p>
            <button onClick={() => window.location.reload()} className="btn btn-primary">
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const HomeRedirect = () => {
  const { user, role, loading } = useAuth();
  
  if (loading) return <div className="p-5 text-center d-flex justify-content-center"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>;

  if (!user) {
    return <Navigate to="/jobs" replace />;
  }

  if (role === 'employer' || role === 'job_seeker') {
    return <Navigate to="/dashboard" replace />;
  }

  return <div className="p-5 text-center">Welcome! Loading your dashboard...</div>;
};

// Global Fallback Loader
const GlobalLoader = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
    <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

const App = () => {
  return (
    <ErrorBoundary>
      <div className="d-flex flex-column min-vh-100 bg-light">
        <Navbar />
        <main className="container py-4 flex-grow-1 main-content">
          <Suspense fallback={<GlobalLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/jobs" element={<JobList />} />
              <Route path="/jobs/:id" element={<JobDetails />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/messages/:id" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

              {/* Job Seeker Routes */}
              <Route 
                path="/jobs/:id/apply" 
                element={
                  <RoleRoute allowedRoles={['job_seeker']}>
                    <ApplyJob />
                  </RoleRoute>
                } 
              />
              <Route 
                path="/my-applications" 
                element={
                  <RoleRoute allowedRoles={['job_seeker']}>
                    <MyApplications />
                  </RoleRoute>
                } 
              />

              {/* Employer Routes */}
              <Route 
                path="/manage-applications" 
                element={
                  <RoleRoute allowedRoles={['employer']}>
                    <EmployerApplications />
                  </RoleRoute>
                } 
              />
              <Route 
                path="/post-job" 
                element={
                  <RoleRoute allowedRoles={['employer']}>
                    <PostJob />
                  </RoleRoute>
                } 
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default App;
