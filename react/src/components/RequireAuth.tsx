import { Navigate, Outlet } from 'react-router-dom';

export const RequireAuth = () => {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
