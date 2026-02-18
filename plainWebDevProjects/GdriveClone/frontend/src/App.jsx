
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// --- App Router (Main Component) ---
const App = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-gray-500">Loading Application...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
      <Route
        path="/"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Dashboard view="my-drive" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Dashboard view="home" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recent"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Dashboard view="recent" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/starred"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Dashboard view="starred" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shared-with-me"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Dashboard view="shared-with-me" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/spam"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Dashboard view="spam" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trash"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Dashboard view="trash" />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

// --- ProtectedRoute Wrapper ---
const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default App;
