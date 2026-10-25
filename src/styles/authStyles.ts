import styled from 'styled-components';
export const Page = styled.main`
  min-height: calc(100vh - 80px); padding: 56px 24px; display: grid; align-content: center; justify-items: center; background: #f5f7f6;
`;
export const Panel = styled.section`
  width: min(100%, 460px); padding: clamp(24px, 4vw, 40px); background: #fff; border: 1px solid #e0e7e2; border-radius: 16px; box-shadow: 0 12px 40px #24352f06;
  display: grid; gap: 22px; min-width: 0;
  h1 { font-size: clamp(26px, 4vw, 32px); }
  p { color: #5d6d65; }
  h1 + p { margin-top: 10px; }
  a { font-size: 14px; }
`;
export const Eyebrow = styled.span`color: #5d6d65; font-size: 13px; font-weight: 500;`;
export const Form = styled.form`
  display: grid; gap: 20px;
  label { display: grid; gap: 8px; font-weight: 600; font-size: 14px; }
  input, select { width: 100%; min-width: 0; padding: 11px 13px; border: 1px solid #b8c8bf; border-radius: 5px; background: #fff; color: #24352f; font: inherit; }
  input::placeholder { color: #77867e; font-weight: 400; }
  button { width: 100%; margin-top: 4px; }
`;
export const Message = styled.div`padding: 14px 16px; background: #fcf0ee; color: #953e30; border: 1px solid #ecc7c0; border-radius: 6px; font-size: 14px; overflow-wrap: anywhere;`;
export const Notice = styled.div`padding: 14px 16px; background: #f0f5f1; border-left: 3px solid #9ab5a3; color: #43594c; border-radius: 0 5px 5px 0; font-size: 14px;`;
export const LoginLayout = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; max-width: 920px; width: 100%; gap: 80px; align-items: center;
  > aside { padding: 32px 0; border-top: 3px solid #236751; > svg { color: #236751; } h2 { font-size: 40px; letter-spacing: -1.2px; max-width: 390px; margin: 24px 0; } p { color: #5d6d65; max-width: 36ch; } }
  @media(max-width: 760px) { max-width: 460px; grid-template-columns: 1fr; gap: 28px; > aside { display: none; } }
`;
