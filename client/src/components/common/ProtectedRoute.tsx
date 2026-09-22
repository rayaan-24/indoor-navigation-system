import { Navigate, useLocation } from 'react-router-dom';
import type { ReactElement } from 'react';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactElement;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-secondary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page, save target path for redirecting back after login
    return <Navigate to="/login" state={{ from: location, message: 'Please log in to access this screen.' }} replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    // User lacks administrator privileges, redirect to homepage
    return <Navigate to="/" replace />;
  }

  return children;
}
