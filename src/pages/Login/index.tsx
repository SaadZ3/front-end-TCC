import { useState, type FormEvent } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router';
import Header from '../../components/Header';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import { SessionStatus } from '../../components/SessionStatus';
import { useAuth } from '../../auth/auth-context';
import { returnTo } from '../../auth/returnTo';
import { Page, Panel, Form, Message, Notice, LoginLayout } from '../../styles/authStyles';

export default function Login() {
  const auth = useAuth();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  if (auth.loading || auth.error)
    return <SessionStatus loading={auth.loading} error={auth.error} retry={auth.refresh} />;
  if (auth.session) return <Navigate to={returnTo(params.get('next'))} replace />;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setFailure(null);
    try { await auth.login(email, password); setPassword(''); }
    catch (error) { setFailure(error instanceof Error ? error.message : 'Não foi possível entrar.'); }
    finally { setBusy(false); }
  }
  return <>
    <Header />
    <Page>
      <LoginLayout>
      <aside><Icon name="document" size={40} /><h2>Suas leituras, organizadas em um só lugar.</h2><p>Envie políticas de privacidade, explore as evidências e retome suas análises quando precisar.</p></aside>
      <Panel>
        <div><h1>Entre na sua conta</h1><p>Acesse sua área de análise de políticas de privacidade.</p></div>
        {(auth.expired || params.has('expired')) && <Notice role="status">Sua sessão terminou. Entre novamente para continuar.</Notice>}
        <Form onSubmit={submit} aria-busy={busy}>
          <label htmlFor="email">E-mail
            <input id="email" type="email" autoComplete="username" placeholder="voce@exemplo.com" required maxLength={254}
              value={email} onChange={event => setEmail(event.target.value)} disabled={busy} />
          </label>
          <label htmlFor="password">Senha
            <input id="password" type="password" autoComplete="current-password" required maxLength={200}
              value={password} onChange={event => setPassword(event.target.value)} disabled={busy}
              aria-describedby={failure ? 'login-error' : undefined} />
          </label>
          {failure && <Message id="login-error" role="alert">{failure}</Message>}
          <Button type="submit" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</Button>
        </Form>
        <p>Não tem uma conta? <Link to={'/register?' + new URLSearchParams({ next: returnTo(params.get('next')) })}>Criar conta</Link></p>
        <Link to="/">← Voltar ao início</Link>
      </Panel>
      </LoginLayout>
    </Page>
  </>;
}
