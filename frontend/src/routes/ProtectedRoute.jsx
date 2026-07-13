import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-dark-bg text-slate-200">
        {/* Loading Spinner */}
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-brand-primary"></div>
        <p className="mt-4 font-heading text-sm font-medium tracking-wide">Syncing Session...</p>
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
