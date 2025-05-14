import {jwtDecode} from 'jwt-decode';

interface JwtPayload {
  role: string;
  id: string;
  username: string;
}

export function getUserInfo(): { role: string; username: string } | null {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const { role, username } = jwtDecode<JwtPayload>(token);
    return { role, username };
  } catch {
    return null;
  }
}
