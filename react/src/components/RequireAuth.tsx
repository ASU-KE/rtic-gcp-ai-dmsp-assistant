import { Outlet, Navigate, useLocation } from 'react-router-dom';

export const RequireAuth = ({ children }: { children?: JSX.Element }) => {
  const isLoggedIn = !!localStorage.getItem('token');
  const location = useLocation();

  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
};
