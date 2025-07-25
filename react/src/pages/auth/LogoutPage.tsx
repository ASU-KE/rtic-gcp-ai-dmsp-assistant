import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { signout } from '../../api/auth';

export const LogoutPage = async () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      try {
        await signout();
      } catch (error) {
        console.error('Logout failed:', error);
      }
    };
    logout();

    navigate('/');
  }, [navigate]);

  return <p>Logging out...</p>;
};
