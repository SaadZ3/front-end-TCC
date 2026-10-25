import { NavLink, useLocation } from 'react-router';
import Icon from './Icon';

export default function WorkspaceNavigation({ onAccount, onNavigate, id, open }: {
  onAccount: () => void;
  onNavigate?: () => void;
  id?: string;
  open?: boolean;
}) {
  const { pathname } = useLocation();
  const isResult = pathname.startsWith('/app/analyses/');
  return <nav id={id} aria-label="Área de análises" data-open={open}>
    <NavLink to="/app/new" onClick={onNavigate}><Icon name="plus" size={18} />Nova análise</NavLink>
    <NavLink to="/app" end onClick={onNavigate}><Icon name="history" size={18} />Minhas análises</NavLink>
    <NavLink to={isResult ? pathname : '/app/dashboard'} onClick={onNavigate}><Icon name="grid" size={18} />Dashboard analítico</NavLink>
    <button type="button" onClick={onAccount}><Icon name="settings" size={18} />Configurações da conta</button>
  </nav>;
}
