import axios from 'axios';

import { useAuthContext } from '../hooks';
import { login, logout } from "../context";
import { User } from '../types/user';

export const signin = async (
  username: string,
  password: string,
): Promise<User | undefined> => {
  const { dispatch } = useAuthContext();

  if (!username || !password) {
    return undefined;
  }

  try {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_DOMAIN}:${import.meta.env.VITE_BACKEND_PORT}/auth/login`,
      {
        username,
        password,
      },
      {
        withCredentials: true
      }
    );

    if (!response.data || !response.data.user) {
      throw new Error('Login failed: No user data returned');
    }

    const { user } = response.data;
    console.log('User logged in:', user);
    dispatch(login(user));

  } catch (err: any) {
    console.error('Login error:', err);
    throw new Error(err.response?.data?.error?.message || 'Login failed');
  }
}

export const signout = async (
): Promise<void> => {
  const { dispatch } = useAuthContext();
  try {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_DOMAIN}:${import.meta.env.VITE_BACKEND_PORT}/auth/logout`, {
      withCredentials: true
    });

    if (response.status !== 200) {
      throw new Error('Logout failed');
    }

    console.log('User logged out');
    dispatch(logout());

  } catch (err: any) {
    console.error('Logout error:', err);
    throw new Error(err.response?.data?.error?.message || 'Logout failed');
  }
}



