import { createGlobalStyle } from 'styled-components';
import theme from './theme';
export default createGlobalStyle`
  * { box-sizing: border-box; }
  body { margin: 0; font-family: ${theme.fonts.primary}; color: ${theme.colors.text}; background: ${theme.colors.background}; font-size: 15px; line-height: 1.65; -webkit-font-smoothing: antialiased; }
  h1, h2, h3, h4, p, blockquote { margin: 0; }
  h1, h2, h3, h4 { color: ${theme.colors.text}; line-height: 1.25; font-weight: 600; }
  h1 { letter-spacing: -.035em; }
  a { color: ${theme.colors.accent}; text-decoration: none; text-underline-offset: 4px; }
  a:hover { text-decoration: underline; }
  button, input, select { font: inherit; }
  button { cursor: pointer; }
  button:disabled { opacity: .5; cursor: not-allowed; }
  :focus-visible { outline: 3px solid #378369; outline-offset: 4px; }
  input, select { accent-color: ${theme.colors.accent}; }
  img, svg { max-width: 100%; }
  ::selection { background: #d5eadd; color: #163c2c; }
  [id] { scroll-margin-top: 24px; }
  .skip-link { position: fixed; top: -100px; left: 16px; z-index: 200; padding: 10px 18px; background: white; border: 1px solid ${theme.colors.accent}; }
  .skip-link:focus { top: 12px; }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; transition: none !important; animation: none !important; } }
`;
