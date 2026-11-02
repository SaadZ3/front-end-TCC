/** Mantém a sessão da interface e impede que respostas atrasadas restaurem uma sessão encerrada. */
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ApiError, api } from '../services/api';
import { AuthContext, type Session } from './auth-context';

/** Recebe os componentes filhos e fornece sessão e ações de autenticação. */
export function AuthProvider({ children }: { children: ReactNode; }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  // Uma resposta antiga não pode restaurar a sessão após logout ou expiração.
  const sessionRequestVersion = useRef(0);
  const hadSession = useRef(false);
  const sessionChangePending = useRef(false);
  const invalidatePendingRequests = useCallback(() => { sessionRequestVersion.current++; }, []);

  const expire = useCallback(() => {
    sessionRequestVersion.current++;
    setExpired(hadSession.current);
    hadSession.current = false;
    setSession(null);
    setLoading(false);
    setError(null);
  }, []);

  const loadSession = useCallback(async () => {
    if (sessionChangePending.current) return;
    const requestVersion = ++sessionRequestVersion.current;
    try {
      const next = await api<Session>('/users/me');
      if (requestVersion !== sessionRequestVersion.current) return;
      hadSession.current = true;
      setSession(next);
      setExpired(false);
      setError(null);
    } catch (failure) {
      if (requestVersion !== sessionRequestVersion.current) return;
      if (failure instanceof ApiError && failure.status === 401) expire();
      else setError(failure instanceof Error ? failure.message : 'Não foi possível verificar sua sessão.');
    } finally {
      if (requestVersion === sessionRequestVersion.current) setLoading(false);
    }
  }, [expire]);

  const refresh = useCallback(async () => {
    if (sessionChangePending.current) return;
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
      invalidatePendingRequests();
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('session-expired', expire);
    };
  }, [loadSession, expire, invalidatePendingRequests]);

  useEffect(() => {
    if (!session) return;
    const timeout = window.setTimeout(expire, Math.max(0, Date.parse(session.expires_at) - Date.now()));
    return () => window.clearTimeout(timeout);
  }, [session, expire]);

  /** Recebe rota e credenciais; atualiza a sessão apenas se a resposta ainda for atual. */
  async function authenticate(path: string, credentials: { name?: string; email: string; password: string; }) {
    sessionChangePending.current = true;
    const requestVersion = ++sessionRequestVersion.current;
    try {
      const next = await api<Session>(path, { method: 'POST', body: JSON.stringify(credentials) });
      if (requestVersion !== sessionRequestVersion.current) return;
      hadSession.current = true;
      setSession(next);
      setExpired(false);
      setError(null);
      setLoading(false);
    } finally {
      sessionChangePending.current = false;
    }
  }
  /** Recebe e-mail e senha e conclui a entrada na conta. */
  async function login(email: string, password: string) {
    await authenticate('/auth/login', { email, password });
  }
  /** Recebe nome, e-mail e senha e conclui o cadastro e a sessão. */
  async function register(name: string, email: string, password: string) {
    await authenticate('/auth/register', { name, email, password });
  }
  /** Encerra a sessão no backend antes de limpar o estado local. */
  async function logout() {
    sessionChangePending.current = true;
    invalidatePendingRequests();
    try {
      await api<void>('/auth/logout', { method: 'POST' });
      hadSession.current = false;
      setSession(null);
      setExpired(false);
      setError(null);
      setLoading(false);
    } finally {
      sessionChangePending.current = false;
    }
  }
  return <AuthContext.Provider value={{ session, loading, error, expired, refresh, login, register, logout }}>
    {children}
  </AuthContext.Provider>;
}
