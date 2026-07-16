// frontend/src/routes/RoleRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleRoute = ({ children, roles }) => {
  const { user, isAuthenticated } = useAuth();

  console.log('🎭 RoleRoute check:', { userRole: user?.role, allowed: roles });

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user?.role)) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>Access Denied</h1>
        <p>You don't have permission to view this page.</p>
      </div>
    );
  }

  return children;
};

export default RoleRoute;