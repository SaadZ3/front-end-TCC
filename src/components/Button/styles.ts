import styled from 'styled-components';
import theme from '../../styles/theme';
export const StyledButton = styled.button<{ $variant: 'primary' | 'outline' }>`
  display: inline-flex; align-items: center; justify-content: center; gap: .6rem;
  min-height: 42px; padding: .6rem 1.05rem; border-radius: 6px; font-size: .875rem; font-weight: 600;
  border: 1px solid ${({ $variant }) => $variant === 'primary' ? theme.colors.accent : '#cbd6cf'};
  color: ${({ $variant }) => $variant === 'primary' ? '#fff' : theme.colors.text};
  background: ${({ $variant }) => $variant === 'primary' ? theme.colors.accent : '#fff'};
  transition: background .15s, border-color .15s;
  &:hover:not(:disabled) { background: ${({ $variant }) => $variant === 'primary' ? theme.colors.primaryDark : '#edf3ef'}; border-color: ${theme.colors.accent}; }
`;
