import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-dark-bg text-slate-200">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-brand-primary"></div>
        <p className="mt-4 font-heading text-sm font-medium tracking-wide">Syncing Session...</p>
      </div>
    );
  }

  // Already logged in? Redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 bg-dark-bg">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        {/* Decorative ambient background glows */}
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-brand-primary/10 blur-[150px]"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-brand-secondary/10 blur-[150px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary p-0.5 shadow-lg shadow-brand-primary/20 mb-3">
            <span className="font-heading font-black text-xl text-white">RN</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl tracking-tight text-white m-0">RESEARCH NEXUS</h1>
          <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest font-semibold">AI research companion</p>
        </div>

        {/* Embedded view form (Login / Register) */}
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
