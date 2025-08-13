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

    window.location.href = 'https://dmsp.local.asu.edu/api/sso/login';
  }, [state.isAuthenticated, navigate]);

  return <></>;
};
