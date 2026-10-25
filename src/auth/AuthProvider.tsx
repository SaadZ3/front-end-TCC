import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ApiError, api } from '../services/api';
import { AuthContext, type Session } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const generation = useRef(0);
  const hadSession = useRef(false);
  const mutationPending = useRef(false);
  const invalidatePending = useCallback(() => { generation.current++; }, []);

  const expire = useCallback(() => {
    generation.current++;
    setExpired(hadSession.current);
    hadSession.current = false;
    setSession(null);
    setLoading(false);
    setError(null);
  }, []);

  const loadSession = useCallback(async () => {
    if (mutationPending.current) return;
    const request = ++generation.current;
    try {
      const next = await api<Session>('/users/me');
      if (request !== generation.current) return;
      hadSession.current = true;
      setSession(next);
      setExpired(false);
      setError(null);
    } catch (failure) {
      if (request !== generation.current) return;
      if (failure instanceof ApiError && failure.status === 401) expire();
      else setError(failure instanceof Error ? failure.message : 'Não foi possível verificar sua sessão.');
    } finally {
      if (request === generation.current) setLoading(false);
    }
  }, [expire]);

  const refresh = useCallback(async () => {
    if (mutationPending.current) return;
    setLoading(true);
    setError(null);
    await loadSession();
  }, [loadSession]);

  useEffect(() => {
    // O estado só muda após a resposta HTTP; não há setState síncrono nesta chamada.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSession();
    const onFocus = () => { void loadSession(); };
    window.addEventListener('focus', onFocus);
    window.addEventListener('session-expired', expire);
    return () => {
      invalidatePending();
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('session-expired', expire);
    };
  }, [loadSession, expire, invalidatePending]);

  useEffect(() => {
    if (!session) return;
    const timeout = window.setTimeout(expire, Math.max(0, Date.parse(session.expires_at) - Date.now()));
    return () => window.clearTimeout(timeout);
  }, [session, expire]);

  async function authenticate(path: string, credentials: { name?: string; email: string; password: string }) {
    mutationPending.current = true;
    const request = ++generation.current;
    try {
      const next = await api<Session>(path, { method: 'POST', body: JSON.stringify(credentials) });
      if (request !== generation.current) return;
      hadSession.current = true;
      setSession(next);
      setExpired(false);
      setError(null);
      setLoading(false);
    } finally {
      mutationPending.current = false;
    }
  }
  async function login(email: string, password: string) {
    await authenticate('/auth/login', { email, password });
  }
  async function register(name: string, email: string, password: string) {
    await authenticate('/auth/register', { name, email, password });
  }
  async function logout() {
    mutationPending.current = true;
    invalidatePending();
    try {
      await api<void>('/auth/logout', { method: 'POST' });
      hadSession.current = false;
      setSession(null);
      setExpired(false);
      setError(null);
      setLoading(false);
    } finally {
      mutationPending.current = false;
    }
  }
  return <AuthContext.Provider value={{ session, loading, error, expired, refresh, login, register, logout }}>
    {children}
  </AuthContext.Provider>;
}
