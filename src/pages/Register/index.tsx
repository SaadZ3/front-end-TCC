import { useState, type FormEvent } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router';
import Header from '../../components/Header';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import { SessionStatus } from '../../components/SessionStatus';
import { useAuth } from '../../auth/auth-context';
import { returnTo } from '../../auth/returnTo';
import { Page, Panel, Form, Message, LoginLayout } from '../../styles/authStyles';

export default function Register() {
  const auth = useAuth();
  const [params] = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState('');
  const destination = returnTo(params.get('next'));

  if (auth.loading || auth.error)
    return <SessionStatus loading={auth.loading} error={auth.error} retry={auth.refresh} />;
  if (auth.session) return <Navigate to={destination} replace />;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFailure('');
    if (name.trim().length < 3) { setFailure('Informe um nome com pelo menos 3 caracteres.'); return; }
    if (new TextEncoder().encode(password).length > 72) {
      setFailure('A senha excede o limite de 72 bytes. Use uma senha menor; acentos e emojis ocupam mais bytes.'); return;
    }
    if (password !== confirmation) { setFailure('As senhas não coincidem. Confira a confirmação.'); return; }
    setBusy(true);
    try { await auth.register(name.trim(), email.trim(), password); setPassword(''); setConfirmation(''); }
    catch (error) { setFailure(error instanceof Error ? error.message : 'Não foi possível criar a conta.'); }
    finally { setBusy(false); }
  }
  return <><Header /><Page><LoginLayout>
    <aside><Icon name="document" size={40} /><h2>Comece sua próxima análise.</h2><p>Crie sua conta para enviar políticas de privacidade e manter seus resultados organizados.</p></aside>
    <Panel>
      <div><h1>Crie sua conta</h1><p>Cadastre-se para acessar sua área de análises.</p></div>
      <Form onSubmit={submit} aria-busy={busy}>
        <label htmlFor="name">Nome<input id="name" autoComplete="name" required minLength={3} maxLength={255} value={name} onChange={event => setName(event.target.value)} disabled={busy} /></label>
        <label htmlFor="email">E-mail<input id="email" type="email" autoComplete="username" required maxLength={254} placeholder="voce@exemplo.com" value={email} onChange={event => setEmail(event.target.value)} disabled={busy} /></label>
        <label htmlFor="password">Senha<input id="password" type={visible ? 'text' : 'password'} autoComplete="new-password" required minLength={8} maxLength={72} aria-describedby="password-help" value={password} onChange={event => setPassword(event.target.value)} disabled={busy} /></label>
        <small id="password-help">Use pelo menos 8 caracteres. O limite é de 72 bytes; acentos e emojis ocupam mais de um byte.</small>
        <label htmlFor="confirmation">Confirmar senha<input id="confirmation" type={visible ? 'text' : 'password'} autoComplete="new-password" required minLength={8} maxLength={72} value={confirmation} onChange={event => setConfirmation(event.target.value)} disabled={busy} /></label>
        <Button type="button" variant="outline" aria-pressed={visible} disabled={busy} onClick={() => setVisible(value => !value)}>{visible ? 'Ocultar senhas' : 'Mostrar senhas'}</Button>
        {failure && <Message role="alert">{failure}</Message>}
        <Button type="submit" disabled={busy}>{busy ? 'Criando conta…' : 'Criar conta'}</Button>
      </Form>
      <p>Já tem uma conta? <Link to={'/login?' + new URLSearchParams({ next: destination })}>Entrar</Link></p>
      <Link to="/">← Voltar ao início</Link>
    </Panel>
  </LoginLayout></Page></>;
}
