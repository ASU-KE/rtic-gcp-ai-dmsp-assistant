import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks';

export const LoginRedirect = () => {
  const navigate = useNavigate();
  const { state } = useAuthContext();

  useEffect(() => {
    if (state.isAuthenticated) {
      navigate('/');
    }

    window.location.href = `${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_DOMAIN}:${import.meta.env.VITE_BACKEND_PORT}/${import.meta.env.VITE_BACKEND_PATH_PREFIX}/sso/login`;
  }, [state.isAuthenticated, navigate]);

  return <></>;
};
