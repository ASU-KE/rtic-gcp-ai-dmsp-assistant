import axios from 'axios';
import { User } from '../types';

export async function getCurrentUser(): Promise<User> {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_DOMAIN}:${import.meta.env.VITE_BACKEND_PORT}/${import.meta.env.VITE_BACKEND_PATH_PREFIX}/user/current`,
      {
        withCredentials: true,
      }
    );

    // check for unauthorized response status
    if (response.status === 401) {
      throw new Error('Unauthorized: Please log in');
    }

    // check if response status is not OK
    if (response.status !== 200 || !response.data || !response.data.user) {
      throw new Error(`Error fetching user: ${response.statusText}`);
    }

    const { user } = response.data;
    return user;
  } catch (err: any) {
    throw new Error(err.response?.data?.error?.message || 'General API query error');
  }
}
