import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const LogoutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('token');
    navigate('/');
  }, [navigate]);
  return <p>Logging out...</p>;
};
