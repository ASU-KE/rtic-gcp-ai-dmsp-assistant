import axios from 'axios';
import { logout } from './auth';

const getAccessToken = () => localStorage.getItem('token');
const getRefreshToken = () => localStorage.getItem('refreshToken');

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token found');

  const response = await axios.post(`https://${import.meta.env.VITE_BACKEND_DOMAIN}/refresh-token`, { refreshToken });
  const newAccessToken = response.data.data.accessToken;
  localStorage.setItem('token', newAccessToken);
  return newAccessToken;
};

export const authorizedRequest = async (
  method: 'GET' | 'POST' | 'DELETE' | 'PATCH',
  path: string,
  data?: any
) => {
  let token = getAccessToken();

  try {
    return await axios({
      method,
      url: `${BASE_URL}${path}`,
      ...(data ? { data } : {}),
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err: any) {
    if (err.response?.status === 401) {
      try {
        token = await refreshAccessToken();
        return await axios({
          method,
          url: `${BASE_URL}${path}`,
          ...(data ? { data } : {}),
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (refreshErr) {
        logout();
        throw refreshErr;
      }
    }
    throw err;
  }
};
