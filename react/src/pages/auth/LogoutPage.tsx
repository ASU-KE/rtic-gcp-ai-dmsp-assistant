import axios from 'axios';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuthContext } from '../../hooks';
import { logout } from '../../context';

export const LogoutPage = async () => {
  const { dispatch, state } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state.isAuthenticated) {
      navigate('/');
    }
  }, [state.isAuthenticated, navigate]);

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
    throw new Error(err.response?.data?.error?.message || 'Logout failed');
  }

  return <p>Logging out...</p>;
};
