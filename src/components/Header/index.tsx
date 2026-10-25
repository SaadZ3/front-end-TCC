import { Link, useNavigate } from 'react-router';
import Button from '../Button';
import Icon from '../Icon';
import { useAuth } from '../../auth/auth-context';
import { HeaderContainer, HeaderContent, Logo, Nav, NavLink, HeaderActions } from './styles';

function Header() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  return <HeaderContainer><HeaderContent>
    <Logo as={Link} to="/" aria-label="Políticas TCC — início"><Icon name="document" size={27} />Políticas<span>TCC</span></Logo>
    <Nav aria-label="Navegação principal">
      <NavLink href="/#recursos">Recursos</NavLink>
      <NavLink href="/#como-funciona">Como funciona</NavLink>
      <NavLink href="/#sobre">O projeto</NavLink>
    </Nav>
    <HeaderActions>
      <Button variant="outline" disabled={loading} onClick={() => void navigate(session ? '/app' : '/login')}>
        {session ? 'Minha área' : 'Entrar'}
      </Button>
    </HeaderActions>
  </HeaderContent></HeaderContainer>;
}
export default Header;
