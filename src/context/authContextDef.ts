import { createContext } from 'react';
import type { UserRole, AuthState } from '../types/user';

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole, displayName: string) => Promise<void>;
  signOut: () => void;
  isDemoMode: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);
