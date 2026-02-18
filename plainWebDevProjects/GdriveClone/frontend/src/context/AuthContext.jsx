import React, { createContext, useContext, useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Send cookies
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user || data);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Send/receive cookies
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      setUser(data.user || data);
      return data;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to login');
    }
  };

  const register = async (email, password, name) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Send/receive cookies
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to register');
    }
    const data = await response.json();
    setUser(data.user || data);
    return data;
  };

  const logout = async () => {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include', // Send cookies
    });
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};