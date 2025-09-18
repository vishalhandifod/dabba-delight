import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/useAuth';
import { Utensils } from 'lucide-react';

const ProtectedRoute = () => {
  const { session, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading spinner while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-orange-200 to-red-200 flex items-center justify-center">
        <div className="text-center">
          <Utensils className="mx-auto h-16 w-auto text-orange-500 animate-pulse" />
          <p className="mt-4 text-lg text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login with the current location
  if (!isAuthenticated || !session) {
    return (
      <Navigate 
        to="/login" 
        replace 
        state={{ from: location }} 
      />
    );
  }

  // If authenticated, render the protected routes
  return <Outlet />;
};

export default ProtectedRoute;
