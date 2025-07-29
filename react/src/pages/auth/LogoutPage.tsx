import axios from 'axios';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuthContext } from '../../hooks';
import { logout } from '../../context';

export const LogoutPage = () => {
  const navigate = useNavigate();
  const { dispatch, state } = useAuthContext();

  useEffect(() => {
    if (!state.isAuthenticated) {
      navigate('/');
    }
  }, [state.isAuthenticated, navigate]);

  useEffect(() => {
    const logoutUser = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_DOMAIN}:${import.meta.env.VITE_BACKEND_PORT}/auth/logout`,
          {
            withCredentials: true,
          }
        );

        if (response.status !== 200) {
          throw new Error('Logout failed');
        }

        console.log('User logged out');
        dispatch(logout());
      } catch (err: any) {
        console.error('Logout error:', err);
      }
    };

    logoutUser();
  }, [dispatch]);

  return <p>Logging out...</p>;
};
