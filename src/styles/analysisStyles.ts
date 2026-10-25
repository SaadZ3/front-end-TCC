import styled from 'styled-components';

export const PageHeading = styled.header.attrs({ className: 'result-heading' })`
  min-width: 0; overflow-wrap: anywhere;
  p { max-width: 72ch; }
  > a { flex-shrink: 0; margin-top: 4px; }
`;
export const Card = styled.section.attrs({ className: 'result-panel' })`
  padding: 20px; display: grid; gap: 22px; overflow-wrap: anywhere;
  h2 { font-size: 14px; font-weight: 600; }
  h3 { font-size: 15px; }
  p { color: var(--muted); }
  small { color: var(--muted); font-size: 11px; }
  a:not(.result-button) { color: var(--green); font-weight: 500; }
  @media(max-width: 700px) { padding: 18px; }
`;
export const Row = styled.div`
  display: flex; gap: 14px; align-items: center; flex-wrap: wrap; justify-content: space-between; min-width: 0;
  > div { min-width: 0; }
`;
export const UploadForm = styled.form`
  display: grid; gap: 20px;
  label { display: grid; gap: 8px; font-weight: 600; font-size: 12px; }
  input, select { width: 100%; min-width: 0; padding: 10px 12px; border: 1px solid #d4dfec; border-radius: 5px; background: white; color: var(--ink); font: inherit; }
  fieldset { border: 0; padding: 0; margin: 0; display: grid; gap: 22px; min-width: 0; }
  fieldset:disabled { opacity: .6; }
  button { justify-self: start; }
  input::file-selector-button { background: #e3f4ed; border: 1px solid #b8d6c9; color: var(--green); padding: 8px 12px; border-radius: 4px; margin-right: 12px; cursor: pointer; font: inherit; }
`;
export const UploadField = styled.div`
  border: 1px dashed #a3bdb2; border-radius: 6px; background: #f6faf8; padding: 28px 24px;
  text-align: center; display: grid; justify-items: center; gap: 14px;
  &:focus-within { border-color: var(--green); background: #f0f8f4; }
  > svg { color: var(--green); width: 44px; height: 44px; padding: 10px; background: #e3f4ed; border-radius: 6px; }
  label { width: 100%; text-align: left; }
  input { font-weight: 400; }
  p { font-size: 11px; max-width: 100%; }
  @media(max-width: 500px) {
    padding: 18px;
    input::file-selector-button { display: block; width: 100%; margin: 0 0 8px; }
  }
`;
export const ContentColumns = styled.div`
  display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: 18px; align-items: start;
  > aside { padding: 20px; }
  > aside h2 { font-size: 13px; margin-bottom: 8px; }
  > aside p { color: var(--muted); font-size: 12px; margin-bottom: 24px; }
  @media(max-width: 1000px) { grid-template-columns: minmax(0, 1fr); }
`;
export const HistoryList = styled.ul`
  list-style: none; padding: 0; margin: 0;
  li { border-top: 1px solid var(--line); padding: 18px 0; }
  li:last-child { border-bottom: 1px solid var(--line); }
  li > div { display: grid; grid-template-columns: minmax(0, 1fr) auto; }
  .file-info { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .file-info > div { min-width: 0; }
  .file-info > svg { flex-shrink: 0; color: var(--muted); }
  .file-info a { font-size: 13px; }
  .file-info p { margin-top: 3px; }
  @media(max-width: 700px) { li > div { grid-template-columns: minmax(0, 1fr); gap: 14px; } }
`;
export const Badge = styled.span<{ $status?: string }>`
  display: inline-flex; align-items: center; color: ${p => p.$status === 'failed' ? '#a13931' : p.$status === 'processing' ? '#805a16' : '#13795b'};
  background: ${p => p.$status === 'failed' ? '#fcf0ee' : p.$status === 'processing' ? '#fff5e3' : '#e3f4ed'};
  padding: 4px 9px; border-radius: 4px; font-size: 11px; font-weight: 500;
`;
export const EmptyState = styled.div`
  text-align: center; display: grid; justify-items: center; gap: 12px; padding: 40px 16px; border-top: 1px solid var(--line);
  > svg { color: var(--muted); }
  h3 { margin-top: 4px; }
  p { max-width: 44ch; font-size: 12px; }
  a { margin-top: 6px; text-decoration: underline; }
`;
export const DeleteDialog = styled.dialog`
  margin: auto;
  h2 { font-size: 18px; margin-bottom: 16px; }
  p { overflow-wrap: anywhere; line-height: 1.6; margin-bottom: 24px; }
  [role='alert'] { margin-bottom: 20px; }
`;
