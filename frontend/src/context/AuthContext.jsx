import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const response = await api.get('/auth/me');
          setUser({ ...firebaseUser, dbProfile: response.data.user });
          setRole(response.data.user.role);
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUser(firebaseUser); 
          setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      const response = await api.post('/auth/login', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser({ ...userCredential.user, dbProfile: response.data.user });
      setRole(response.data.user.role);
      return userCredential.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, assignedRole) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await api.post('/auth/register', {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        role: assignedRole
      });

      setRole(assignedRole);
      return userCredential.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    role,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
