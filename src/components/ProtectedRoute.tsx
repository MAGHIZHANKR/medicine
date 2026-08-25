import React, { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  onRedirectToLogin: () => void;
  onRedirectToHome: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  onRedirectToLogin,
  onRedirectToHome
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Checking authentication..." fullScreen />;
  }

  if (!user) {
    onRedirectToLogin();
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    onRedirectToHome();
    return null;
  }

  return <>{children}</>;
};
