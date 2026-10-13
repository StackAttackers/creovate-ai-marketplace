export type UserRole = 'creator' | 'agency' | 'brand';

export interface User {
  uid: string;
  role: UserRole;
  displayName: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
