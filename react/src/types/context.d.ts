import { Dispatch, ReactNode } from 'react';
import { User } from './user';

export interface AuthState {
  isAuthenticated: boolean;
  storageKey: string;
  user: null | User;
}

export interface AuthContextProps {
  state: AuthState;
  dispatch: Dispatch<AuthAction>;
}

export interface AuthProviderProps {
  children: ReactNode;
}

export type AuthAction = { type: 'LOGIN'; payload: { user: User; } } | { type: 'LOGOUT' };
