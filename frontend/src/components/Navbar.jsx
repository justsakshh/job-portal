import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.docs.length);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm mb-4">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">JobPortal</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/jobs">Find Jobs</Link>
            </li>
            {user && (
              <>
                {role === 'employer' && (
                  <>
                    <li className="nav-item"><Link className="nav-link" to="/dashboard">Dashboard</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/manage-applications">Candidates</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/post-job">Post Job</Link></li>
                  </>
                )}
                {role === 'job_seeker' && (
                  <>
                    <li className="nav-item"><Link className="nav-link" to="/dashboard">Dashboard</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/my-applications">My Applications</Link></li>
                  </>
                )}
                <li className="nav-item"><Link className="nav-link" to="/messages">Messages</Link></li>
                <li className="nav-item">
                  <Link className="nav-link position-relative" to="/notifications">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                </li>
              </>
            )}
          </ul>
          
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
            {user ? (
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle text-white fw-medium" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  {user.email}
                </a>
                <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0" aria-labelledby="navbarDropdown">
                  <li><Link className="dropdown-item" to="/profile">Profile</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item text-danger" onClick={handleLogout}>Logout</button></li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-light text-primary ms-2 fw-medium rounded-pill px-3" to="/register">Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
