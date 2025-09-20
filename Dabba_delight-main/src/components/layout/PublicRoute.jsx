import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/useAuth'; // hypothetical auth hook

const PublicRoute = ({ children }) => {
  const { session } = useAuth();

  if (session) {
    // Redirect logged-in users to dashboard or homepage or another page
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;
