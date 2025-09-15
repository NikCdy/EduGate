import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const isAdminSignedIn = localStorage.getItem('isAdminSignedIn') === 'true';
  
  // Only allow access if specifically signed in as admin
  if (!isAdminSignedIn) {
    return <Navigate to="/admin-login" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedAdminRoute;