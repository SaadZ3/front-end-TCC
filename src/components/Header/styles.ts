import styled from 'styled-components';
import theme from '../../styles/theme';
export const HeaderContainer = styled.header`background: #fff; border-bottom: 1px solid ${theme.colors.border};`;
export const HeaderContent = styled.div`
  max-width: 1200px; min-height: 80px; margin: auto; padding: 0 32px;
  display: flex; align-items: center; justify-content: space-between; gap: 24px;
  @media(max-width: 600px) { padding: 0 20px; min-height: 72px; gap: 12px; }
`;
export const Logo = styled.a`
  display: inline-flex; align-items: center; gap: 10px; color: ${theme.colors.text}; white-space: nowrap; font-size: 19px; font-weight: 650; letter-spacing: -.5px;
  svg { color: ${theme.colors.accent}; flex-shrink: 0; }
  span { font-weight: 400; color: ${theme.colors.textSecondary}; font-size: 12px; border-left: 1px solid ${theme.colors.border}; padding-left: 10px; margin-left: 2px; letter-spacing: 0; }
  &:hover { text-decoration: none; }
`;
export const Nav = styled.nav`
  display: flex; align-items: center; gap: 32px; margin-left: auto;
  @media(max-width: 700px) { display: none; }
`;
export const NavLink = styled.a`font-size: 14px; color: ${theme.colors.textSecondary}; &[aria-current='page'] { color: ${theme.colors.accent}; }`;
export const HeaderActions = styled.div`display: flex; align-items: center;`;
