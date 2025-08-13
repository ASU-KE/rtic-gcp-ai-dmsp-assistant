import axios from 'axios';
import React, { useEffect, ReactElement, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuthContext } from '../hooks';
import { login } from '../context';
import { User } from '../types';

interface LoginCallbackType {
  children: typeof React.Children | ReactNode | ReactElement;
}

export const LoginCallbackWrapper = ({ children }: LoginCallbackType) => {
  const { dispatch } = useAuthContext();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_DOMAIN}:${import.meta.env.VITE_BACKEND_PORT}/${import.meta.env.VITE_BACKEND_PATH_PREFIX}/user`,
          {
            withCredentials: true,
          }
        );

        if (!response.data || !response.data.data || !response.data.data.user) {
          throw new Error('Login failed: No user data returned');
        }

        const user: User = response.data.data.user;
        // Store user info in auth context
        dispatch(login(user));

      } catch (err: any) {
        throw new Error('Failed to retrieve user data: ' + err.message);
        // Handle error appropriately, e.g., redirect to login or show an error message
      }
    };

    fetchCurrentUser();
  }, []);

  return children;
};

export const LoginCallback = () => {
  let navigate = useNavigate();

  // This component is rendered after the SAML IdP redirects back to our app
  // We use the LoginCallbackWrapper to handle fetching user info and updating auth state
  // After processing, we redirect to the home page or another appropriate page
  useEffect(() => {
    // After a short delay to ensure user state is updated, redirect to home
    const timer = setTimeout(() => {
      return navigate('/');
    }, 2000); // 2 seconds delay

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div>
      <h2>Login Callback</h2>
      <p>Processing login...</p>
    </div>
  );
};
