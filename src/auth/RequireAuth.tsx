/** Protege páginas privadas e preserva o destino solicitado antes do login. */
import { Navigate, useLocation } from 'react-router';
import type { ReactNode } from 'react';
import { useAuth } from './auth-context';
import { SessionStatus } from '../components/SessionStatus';

/** Recebe conteúdo privado e o exibe somente com uma sessão válida. */
export function RequireAuth({ children }: { children: ReactNode; }) {
  const location = useLocation();
  const { session, loading, error, refresh, expired } = useAuth();
  if (loading || error) return <SessionStatus loading={loading} error={error} retry={refresh} />;
  const params = new URLSearchParams({ next: location.pathname + location.search });
  if (expired) params.set('expired', '1');
  if (!session) return <Navigate to={'/login?' + params} replace />;
  return children;
}
