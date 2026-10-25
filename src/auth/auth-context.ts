import { createContext, useContext } from 'react';
export type User = { id: string; name: string; email: string; role: 'ADMIN' | 'EVALUATOR' };
export type Session = { user: User; expires_at: string };
export type AuthState = {
  session: Session | null;
  loading: boolean;
  error: string | null;
  expired: boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};
export const AuthContext = createContext<AuthState | null>(null);
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('AuthProvider ausente.');
  return value;
}
