import { useContext } from 'react';
import { AuthContext } from '../context';

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('Error: useAuth must be within in AuthProvider');

  return context;
};
