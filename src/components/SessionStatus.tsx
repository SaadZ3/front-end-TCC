import { Link } from 'react-router';
import { Page, Panel, Message } from '../styles/authStyles';
import Button from './Button';

export function SessionStatus({ loading, error, retry }: {
  loading: boolean; error: string | null; retry: () => Promise<void>;
}) {
  return <Page><Panel aria-busy={loading}>
    <h1>{loading ? 'Verificando seu acesso…' : 'Não foi possível verificar seu acesso'}</h1>
    {loading ? <p role="status">Aguarde um momento.</p> : <>
      <Message role="alert">{error}</Message>
      <Button onClick={() => void retry()}>Tentar novamente</Button>
    </>}
    <Link to="/">Voltar ao início</Link>
  </Panel></Page>;
}
