import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '../auth/auth-context';
import Icon from './Icon';
import { WorkspaceFrame } from '../styles/workspaceStyles';
import WorkspaceNavigation from './WorkspaceNavigation';

export default function AnalysisShell({ children, onSearch }: { children: ReactNode; onSearch?: (value: string) => void }) {
  const { session, logout } = useAuth();
  const { pathname } = useLocation();
  const pageName = pathname === '/app/new' ? 'Nova análise' : pathname === '/app' ? 'Minhas análises' : 'Dashboard analítico';
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState('');
  const searchInput = useRef<HTMLInputElement>(null);
  const accountDialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!onSearch) return;
    const shortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault(); searchInput.current?.focus();
      }
    };
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, [onSearch]);
  async function leave() {
    setLeaving(true); setError('');
    try { await logout(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Não foi possível sair da conta.'); }
    finally { setLeaving(false); }
  }
  return <WorkspaceFrame>
    <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <aside className="result-sidebar">
      <Link className="result-brand" to="/" aria-label="LGPD Sys. — início"><Icon name="shield" size={27} />LGPD Sys.</Link>
      <button className="mobile-menu-button" aria-label="Menu de navegação" aria-expanded={menuOpen} aria-controls="result-navigation" onClick={() => setMenuOpen(!menuOpen)}><Icon name={menuOpen ? 'close' : 'menu'} size={18} /></button>
      <WorkspaceNavigation id="result-navigation" open={menuOpen} onNavigate={() => setMenuOpen(false)} onAccount={() => { setMenuOpen(false); accountDialog.current?.showModal(); }} />
    </aside>
    <div className="result-workspace">
      <header className="result-topbar">
        {onSearch ? <form className="workspace-search" role="search" aria-label="Pesquisar nesta análise" onSubmit={event => { event.preventDefault(); onSearch(search); }}>
          <Icon name="search" size={16} />
          <input ref={searchInput} aria-label="Pesquisar nesta análise" placeholder="Pesquisar documentos, políticas, análises..." value={search} onChange={event => setSearch(event.target.value)} />
          <kbd aria-hidden="true">⌘K</kbd>
        </form> : <div className="workspace-location"><span>Área de trabalho</span><Icon name="chevron" size={11} /><strong>{pageName}</strong></div>}
        <details className="account-menu">
          <summary aria-label="Menu da conta">
            <span className="account-name"><strong>{session?.user.name || 'Minha conta'}</strong><small>{session?.user.role === 'ADMIN' ? 'Administrador' : 'Avaliador'}</small></span>
            <span className="account-avatar"><Icon name="user" size={16} /></span><Icon name="chevron" size={12} style={{ transform: 'rotate(90deg)' }} />
          </summary>
          <div className="account-dropdown">
            <button onClick={() => accountDialog.current?.showModal()}><Icon name="settings" size={15} />Dados da conta</button>
            <Link to="/app"><Icon name="history" size={15} />Minhas análises</Link>
            <button disabled={leaving} onClick={() => void leave()}><Icon name="logout" size={15} />{leaving ? 'Saindo…' : 'Sair da conta'}</button>
            {error && <p role="alert" className="result-error">{error}</p>}
          </div>
        </details>
      </header>
      <main id="conteudo" className="result-main">{children}</main>
    </div>
    <dialog ref={accountDialog} aria-labelledby="account-title">
      <div className="dialog-heading"><h2 id="account-title">Configurações da conta</h2><button aria-label="Fechar configurações" onClick={() => accountDialog.current?.close()}><Icon name="close" size={20} /></button></div>
      <dl><div><dt>Nome</dt><dd>{session?.user.name}</dd></div><div><dt>E-mail</dt><dd>{session?.user.email}</dd></div><div><dt>Perfil de acesso</dt><dd>{session?.user.role === 'ADMIN' ? 'Administrador' : 'Avaliador'}</dd></div></dl>
      <button className="result-button" onClick={() => accountDialog.current?.close()}>Fechar</button>
    </dialog>
  </WorkspaceFrame>;
}
