import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Failed to login');
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
              <LogIn size={32} />
            </div>
            <h3 className="fw-bold text-dark">Welcome Back</h3>
            <p className="text-muted small">Log in to your Job Portal account</p>
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
            <div className="mb-4">
              <label className="form-label fw-medium">Password</label>
              <input 
                type="password" 
                className="form-control form-control-lg"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg w-100 shadow-sm" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Logging in...
                </>
              ) : 'Log In'}
            </button>
          </form>
          
          <div className="text-center mt-4">
            <p className="text-muted small mb-0">
              Don't have an account? <Link to="/register" className="text-primary text-decoration-none fw-medium">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
