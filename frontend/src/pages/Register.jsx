import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('job_seeker');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(email, password, role);
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card shadow-sm border-0" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex p-3 mb-3">
              <UserPlus size={32} />
            </div>
            <h3 className="fw-bold text-dark">Create Account</h3>
            <p className="text-muted small">Join the Job Portal community</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-medium">Email address</label>
              <input 
                type="email" 
                className="form-control form-control-lg"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="name@example.com"
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-medium">Password</label>
              <input 
                type="password" 
                className="form-control form-control-lg"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="••••••••"
                minLength="6"
              />
            </div>
            <div className="mb-4">
              <label className="form-label fw-medium">I am a:</label>
              <select 
                className="form-select form-select-lg"
                value={role} 
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="job_seeker">Job Seeker (Looking for a job)</option>
                <option value="employer">Employer (Hiring)</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-lg w-100 shadow-sm" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Registering...
                </>
              ) : 'Register'}
            </button>
          </form>
          
          <div className="text-center mt-4">
            <p className="text-muted small mb-0">
              Already have an account? <Link to="/login" className="text-primary text-decoration-none fw-medium">Log in here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
