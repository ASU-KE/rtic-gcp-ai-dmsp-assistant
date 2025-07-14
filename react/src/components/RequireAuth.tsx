import { useEffect, useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';

export const RequireAuth = () => {
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/user', {
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            localStorage.setItem('user', JSON.stringify(data.user)); // Optional
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  if (!authChecked) return null;

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};
