import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import api from '@/lib/api';

const AuthWrapper = ({ children }) => {
  const token = localStorage.getItem('dabba_delight_token');
  const location = useLocation();

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  // The login and signup pages should be accessible without a session.
  if ([ '/login', '/signup' ].includes(location.pathname)) {
    return children;
  }

  // If trying to access any other page without a session, redirect to login.
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a session exists, allow access to the page.
  return children;
};

export default AuthWrapper;