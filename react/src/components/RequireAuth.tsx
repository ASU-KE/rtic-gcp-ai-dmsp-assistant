import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { getUserInfo } from '../utils/auth';

export const RequireAuth = ({ children }: { children?: JSX.Element }) => {
  const user = getUserInfo();
  const location = useLocation();

  if (user === 'new') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
};
