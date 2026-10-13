import React, { useState, useCallback, useEffect } from 'react';
import type { User, UserRole, AuthState } from '../types/user';
import { AuthContext } from './authContextDef';
import { loginUser, registerUser, logoutUser } from '../services/firebase/auth';
import { isDemoMode } from '../services/firebase/config';

const STORAGE_KEY = 'creovate-auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const user = JSON.parse(saved) as User;
        return { user, isAuthenticated: true, isLoading: false, error: null };
      }
    } catch {
      // ignore JSON parse error
    }
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    };
  });

  const [currentDemoMode, setCurrentDemoMode] = useState(isDemoMode);

  useEffect(() => {
    const handleFirebaseUpdate = () => {
      setCurrentDemoMode(isDemoMode);
    };
    window.addEventListener('creovate-firebase-updated', handleFirebaseUpdate);
    return () => window.removeEventListener('creovate-firebase-updated', handleFirebaseUpdate);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const user = await loginUser(email, password);
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        setState({ user, isAuthenticated: true, isLoading: false, error: null });
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'No user account found with this email.',
        }));
      }
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || 'An error occurred during sign in. Please try again.',
      }));
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, role: UserRole, displayName: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const user = await registerUser(email, password, role, displayName);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      setState({ user, isAuthenticated: true, isLoading: false, error: null });
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || 'An error occurred during sign up. Please try again.',
      }));
    }
  }, []);

  const signOutFn = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // Non-blocking
    }
    localStorage.removeItem(STORAGE_KEY);
    setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut: signOutFn,
        isDemoMode: currentDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
