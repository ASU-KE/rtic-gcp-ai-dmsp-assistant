import {jwtDecode} from 'jwt-decode';

interface JwtPayload {
  role: string;
  id: string;
  username: string;
  exp: number;
}

export function getUserInfo(): { role: string; username: string } | 'new' | null {
  const token = localStorage.getItem('token');
  if (!token) return 'new';

  try {
    const { role, username, exp } = jwtDecode<JwtPayload>(token);
    const now = Math.floor(Date.now() / 1000);
    if (exp < now) {
      return null;
    }
    return { role, username };
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  window.location.href = '/session-expired';
}
