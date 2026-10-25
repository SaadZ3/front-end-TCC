import styled from 'styled-components';

export const WorkspaceFrame = styled.div`
  --ink: #0b1f3a; --muted: #657d9b; --green: #13795b; --line: #e8eef5;
  min-height: 100vh; background: #f6f8fa; color: var(--ink); font-size: 12px; line-height: 1.6;
  h1, h2, h3 { color: var(--ink); } a { color: inherit; }
  button, input, select { font: inherit; }
  button { color: inherit; }
  .result-sidebar { position: fixed; inset: 0 auto 0 0; width: 226px; background: #fff; border-right: 1px solid var(--line); z-index: 30; padding: 14px 9px; }
  .result-brand { display: flex; align-items: center; gap: 9px; padding: 0 8px; height: 29px; font-size: 14px; font-weight: 600; width: fit-content; }
  .result-brand svg { color: #049db5; }
  .result-sidebar nav { display: grid; gap: 5px; margin-top: 21px; }
  .result-sidebar nav a, .result-sidebar nav button { display: flex; align-items: center; gap: 9px; padding: 10px; min-height: 38px; border: 0; background: transparent; text-align: left; border-radius: 5px; font-size: 13px; width: 100%; line-height: 1.45; }
  .result-sidebar nav svg { flex-shrink: 0; }
  .result-sidebar nav .active { background: #126e54; color: white; font-weight: 600; }
  .result-sidebar nav a:hover, .result-sidebar nav button:hover { background: #edf6f2; text-decoration: none; }
  .result-sidebar nav .active:hover { background: #0c6048; }
  .result-workspace { margin-left: 226px; min-width: 0; }
  .result-topbar { height: 65px; padding: 0 24px; border-bottom: 1px solid var(--line); background: #fff; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
  .workspace-location { display: flex; align-items: center; gap: 10px; color: var(--muted); font-size: 12px; min-width: 0; }
  .workspace-location strong { font-weight: 500; color: var(--ink); }
  .workspace-location svg { flex-shrink: 0; }
  .workspace-search { width: min(100%, 518px); height: 40px; display: flex; align-items: center; gap: 10px; background: #f7f9fc; border: 1px solid #edf2f8; border-radius: 5px; padding: 0 12px; color: var(--muted); }
  .workspace-search input { width: 100%; min-width: 0; background: none; border: none; outline: none; font-size: 13px; color: var(--ink); }
  .workspace-search:focus-within { border-color: #7eb7a4; box-shadow: 0 0 0 2px #e4f3ed; }
  input::placeholder { color: #8e9bb0; opacity: 1; }
  .workspace-search kbd { flex-shrink: 0; border: 1px solid #d8e1ed; border-radius: 3px; padding: 0 4px; color: var(--muted); font: 11px inherit; }
  .account-menu { position: relative; margin-left: auto; }
  .account-menu > summary { display: flex; align-items: center; gap: 12px; cursor: pointer; list-style: none; }
  .account-menu > summary::-webkit-details-marker { display: none; }
  .account-name { display: grid; text-align: right; line-height: 1.4; font-size: 13px; }
  .account-name strong { font-weight: 600; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .account-name small { font-size: 10px; color: var(--muted); }
  .account-avatar { height: 33px; width: 33px; border-radius: 50%; display: grid; place-items: center; background: #111b2d; color: #fff; }
  .account-dropdown { position: absolute; right: 0; top: 46px; min-width: 220px; background: white; border: 1px solid var(--line); border-radius: 8px; box-shadow: 0 8px 30px #0b1f3a15; padding: 8px; z-index: 40; }
  .account-dropdown button, .account-dropdown a { display: flex; gap: 8px; align-items: center; width: 100%; border: 0; background: white; padding: 10px; border-radius: 4px; text-align: left; }
  .account-dropdown button:hover, .account-dropdown a:hover { background: #f3f7fa; }
  .result-main { width: calc(100% - 48px); max-width: 1040px; margin: 0 auto; padding: 22px 0 32px; }
  .result-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; margin-bottom: 19px; }
  .result-eyebrow { display: inline-flex; align-items: center; gap: 6px; padding: 3px 7px; background: #e3f4ed; border-radius: 4px; color: #006e66; font-size: 10px; font-weight: 600; margin-bottom: 10px; }
  .result-heading h1 { font-size: 23px; letter-spacing: -.65px; line-height: 1.35; font-weight: 650; }
  .result-heading p { margin-top: 4px; color: var(--muted); font-size: 13px; }
  .result-button { border: 1px solid #d5dfed; border-radius: 5px; background: #fff; display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 9px 13px; min-height: 37px; font-weight: 500; text-decoration: none; }
  .result-button:hover { background: #f1f7f4; text-decoration: none; border-color: #97b9ab; }
  .result-button.primary { color: white; background: var(--green); border-color: var(--green); }
  .result-button.primary:hover:enabled, a.result-button.primary:hover { background: #0c6048; border-color: #0c6048; }
  .result-button.danger { color: #a13931; border-color: #e5b9b4; background: #fff6f5; }
  .result-button.danger:hover:enabled { background: #fce9e6; }
  .workspace-notice, .workspace-error { padding: 12px 14px; border: 1px solid #dceee7; border-radius: 5px; font-size: 12px; overflow-wrap: anywhere; }
  p.workspace-notice, div.workspace-notice { color: #256851; background: #f2faf7; }
  p.workspace-error { color: #a13931; background: #fcf0ee; border-color: #ecc7c0; }
  .workspace-notice a { text-decoration: underline; }
  .dashboard-entry { display: grid; grid-template-columns: 64px minmax(0, 1fr); gap: 0 24px; padding: 40px; margin-top: 24px; }
  .dashboard-entry-icon { display: grid; place-items: center; width: 64px; height: 64px; border-radius: 12px; background: #e3f4ed; color: var(--green); }
  .dashboard-entry-status { color: var(--muted); font-size: 11px; }
  .dashboard-entry h2 { font-size: 22px; letter-spacing: -.4px; margin: 7px 0 12px; }
  .dashboard-entry-copy > p { color: var(--muted); max-width: 63ch; font-size: 13px; line-height: 1.8; }
  .dashboard-entry .document-actions { margin-top: 24px; }
  .dashboard-entry-note { grid-column: 2; border-top: 1px solid var(--line); margin-top: 30px; padding-top: 16px; color: var(--muted); font-size: 11px; }
  .result-heading > button { margin-top: 4px; flex-shrink: 0; }
  .result-notice { display: flex; align-items: flex-start; gap: 10px; border: 1px solid #dceee7; border-radius: 5px; background: #f2faf7; padding: 11px 15px; color: #006a70; font-size: 11px; }
  .result-notice svg { flex-shrink: 0; margin-top: 1px; color: var(--green); }
  .result-notice.warning { color: #805a16; background: #fffaf0; border-color: #f0e4c8; }
  .result-tabs { display: flex; gap: 7px; border-bottom: 1px solid var(--line); margin-top: 16px; }
  .result-tabs button { background: transparent; border: 0; border-bottom: 2px solid transparent; display: flex; align-items: center; gap: 8px; padding: 9px 14px; color: var(--muted); }
  .result-tabs button[aria-selected='true'] { color: #007a77; border-bottom-color: #108778; }
  .count-pill { background: #f0f4f9; color: var(--muted); font-size: 10px; padding: 3px 10px; border-radius: 30px; white-space: nowrap; }
  .result-tabs .count-pill { padding: 0 5px; }
  .document-line { display: flex; justify-content: space-between; align-items: center; gap: 15px; margin: 20px 0 17px; font-size: 11px; }
  .document-name { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .document-name span { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
  .document-name svg { flex-shrink: 0; color: var(--green); }
  .document-line > small { color: var(--muted); font-size: 11px; white-space: nowrap; }
  .metric-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 15px; margin-bottom: 18px; }
  .metric-card, .result-panel { background: #fff; border: 1px solid #eaf0f6; border-radius: 10px; box-shadow: 0 1px 3px #122d4d07; min-width: 0; }
  .metric-card { padding: 18px; min-height: 134px; position: relative; }
  .metric-label { display: block; font-size: 11px; color: var(--muted); margin-bottom: 20px; padding-right: 35px; }
  .metric-icon { position: absolute; top: 18px; right: 18px; width: 29px; height: 29px; border-radius: 5px; background: #e3f4ed; color: #007e64; display: grid; place-items: center; }
  .metric-value { display: flex; align-items: baseline; gap: 6px; line-height: 1.2; }
  .metric-value strong { font-size: 30px; letter-spacing: -.7px; font-weight: 650; }
  .metric-value .no-score { font-size: 21px; letter-spacing: -.4px; }
  .metric-value span { color: var(--muted); font-size: 12px; }
  .metric-card > p { color: var(--muted); font-size: 10.5px; margin-top: 7px; }
  .chart-grid { display: grid; grid-template-columns: 1.15fr 1fr; gap: 18px; margin-bottom: 20px; }
  .chart-panel { padding: 19px 18px 16px; min-height: 444px; display: flex; flex-direction: column; }
  .panel-heading h2 { display: flex; gap: 8px; align-items: center; font-size: 14px; font-weight: 600; letter-spacing: -.1px; }
  .panel-heading h2 svg { color: var(--green); }
  .panel-heading p { color: var(--muted); font-size: 11px; margin-top: 4px; }
  .bar-chart { display: grid; gap: 2px; margin: 20px 0 12px; }
  .bar-scale, .category-bar { display: grid; grid-template-columns: minmax(0, 1fr) minmax(100px, 1fr) 27px; gap: 9px; align-items: center; }
  .bar-scale { font-size: 10px; color: var(--muted); margin-bottom: 3px; }
  .bar-scale > div { grid-column: 2; display: flex; justify-content: space-between; }
  .category-bar { width: 100%; padding: 5px 0; border: 0; background: transparent; text-align: left; font-size: 11px; line-height: 1.4; min-height: 27px; }
  .category-bar:hover .bar-title, .category-bar[aria-pressed='true'] .bar-title { color: #00664a; text-decoration: underline; text-underline-offset: 3px; }
  .bar-title { line-height: 1.3; }
  .bar-track { height: 13px; border-radius: 1px; background: repeating-linear-gradient(to right, #f0f4f9 0, #f0f4f9 calc(33.333% - 1px), #fff calc(33.333% - 1px), #fff 33.333%); overflow: hidden; }
  .bar-fill { height: 100%; display: block; background: #148060; border-radius: 1px; }
  .bar-value { text-align: right; font-weight: 500; font-variant-numeric: tabular-nums; }
  .chart-note { margin-top: auto; border-top: 1px solid var(--line); padding-top: 12px; font-size: 10px; color: var(--muted); }
  .radar-wrap { flex: 1; display: grid; align-items: center; justify-items: center; min-height: 325px; }
  .radar-chart { display: block; width: 100%; max-width: 400px; overflow: visible; }
  .radar-chart text { font-family: inherit; fill: var(--muted); font-size: 10px; }
  .radar-legend { display: flex; justify-content: center; align-items: center; gap: 18px; color: var(--muted); font-size: 10px; margin: 5px 0 1px; }
  .radar-legend span:first-child::before { content: ''; display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: var(--green); margin-right: 6px; }
  .segments-panel { overflow: hidden; }
  .segments-heading { padding: 18px 19px 15px; }
  .segments-heading > div:first-child { display: flex; justify-content: space-between; gap: 15px; align-items: flex-start; }
  .segment-filters { display: grid; grid-template-columns: 1.25fr 1.25fr 1fr; gap: 11px; margin-top: 16px; }
  .segment-search { display: flex; align-items: center; gap: 10px; }
  .segment-search svg { flex-shrink: 0; color: var(--muted); }
  .segment-search, .segment-filters select { border: 1px solid #d4dfec; background: white; border-radius: 5px; min-height: 37px; padding: 8px 11px; min-width: 0; width: 100%; }
  .segment-search input { border: 0; background: none; outline: none; width: 100%; min-width: 0; color: var(--ink); }
  .segment-search:focus-within { outline: 2px solid #378369; outline-offset: 2px; }
  .segment-filters select { color: var(--ink); font-size: 11px; }
  .segments-table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 11px; }
  .segments-table th { text-align: left; font-weight: 400; color: var(--muted); background: #f8fafc; padding: 10px 19px; border-top: 1px solid #edf2f8; border-bottom: 1px solid #edf2f8; }
  .segments-table th:first-child { width: 54%; } .segments-table th:nth-child(2) { width: 27%; }
  .segments-table td { padding: 14px 19px; vertical-align: top; border-bottom: 1px solid #edf2f8; overflow-wrap: anywhere; }
  .segment-index { display: block; color: var(--muted); font-size: 10px; margin-bottom: 4px; }
  .segment-text { line-height: 1.75; white-space: normal; }
  .segment-text-toggle { border: 0; padding: 4px 0 0; background: none; color: var(--green); text-decoration: underline; }
  .category-tag { background: #f0f4f8; border-radius: 4px; padding: 6px 9px; font-size: 10px; display: inline-block; line-height: 1.5; }
  .row-categories, .row-grades { display: grid; gap: 8px; }
  .row-categories > div, .row-grades > div { min-height: 43px; }
  .grade-badge { display: inline-block; font-size: 11px; font-weight: 600; border-radius: 4px; padding: 3px 10px; background: #f0f4f8; color: #466382; white-space: nowrap; }
  .grade-badge[data-grade='1'] { color: #99690f; background: #fff5e3; }
  .grade-badge[data-grade='2'] { color: #007d6a; background: #e2f4ed; }
  .grade-badge[data-grade='3'] { color: white; background: #127454; }
  .grade-description { display: block; color: var(--muted); font-size: 10px; margin-top: 4px; }
  .empty-segments { text-align: center; color: var(--muted); padding: 35px 18px !important; }
  .pagination { display: flex; align-items: center; justify-content: space-between; gap: 15px; padding: 11px 19px; color: var(--muted); font-size: 10px; }
  .pagination > div { display: flex; align-items: center; gap: 12px; }
  .pagination button { width: 27px; height: 27px; border: 1px solid #e4ebf4; background: white; border-radius: 4px; display: grid; place-items: center; color: var(--muted); }
  .pagination button:hover:enabled { border-color: #13795b; color: #13795b; }
  .grade-legend { display: flex; align-items: center; flex-wrap: wrap; gap: 10px 18px; font-size: 10px; color: var(--muted); margin: 19px 4px 16px; }
  .grade-legend > strong { font-weight: 500; color: var(--ink); }
  .grade-legend > span { display: inline-flex; align-items: center; gap: 5px; }
  .grade-legend .grade-badge { font-size: 10px; padding: 1px 5px; }
  .result-footnote { font-size: 10px; color: var(--muted); margin: 0 4px; }
  .document-panel { padding: 22px; margin-top: 20px; }
  .document-panel h2 { font-size: 16px; overflow-wrap: anywhere; }
  .document-facts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 22px 0; }
  .document-facts dt { color: var(--muted); font-size: 11px; }
  .document-facts dd { margin: 4px 0 0; font-size: 13px; }
  .document-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
  .result-error { color: #a13931; margin-top: 12px; }
  .status-panel { padding: 30px; margin-top: 20px; }
  .status-panel h1, .status-panel h2 { font-size: 22px; margin-bottom: 12px; }
  .status-panel p { color: var(--muted); margin: 10px 0; }
  .status-panel a { color: var(--green); }
  .mobile-menu-button { display: none; }
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  .segment-text mark { background: #fff0bf; color: var(--ink); border-bottom: 1px solid #caa24e; }
  .segment-guidance { margin-top: 20px; padding-top: 14px; border-top: 1px solid var(--line); text-align: left; }
  .guidance-trigger { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 6px; max-width: 100%; border: 1px solid #e5d8b9; border-radius: 6px; padding: 8px 10px; background: #fffaf0; color: #73531c; text-align: left; cursor: pointer; }
  .guidance-trigger:hover { background: #fff3d9; border-color: #b08432; }
  .guidance-trigger-action { display: inline-flex; align-items: center; gap: 8px; margin-left: 8px; font-size: 10px; color: #73531c; }
  .guidance-trigger:focus-visible, .guidance-drawer button:focus-visible { outline: 2px solid #13795b; outline-offset: 3px; }
  .guidance-disclosure { border: 1px solid #e5d8b9; border-left: 3px solid #b08432; border-radius: 5px; background: #fffdf7; overflow-wrap: anywhere; }
  .guidance-disclosure > summary, .guidance-complements > summary { cursor: pointer; padding: 11px 12px; color: #73531c; font-weight: 600; line-height: 1.5; }
  .guidance-count { display: inline-grid; place-items: center; min-width: 21px; height: 21px; border-radius: 4px; background: #f4e7c6; font-weight: 600; }
  .guidance-disclosure[open] > summary { border-bottom: 1px solid #e5d8b9; }
  .segment-guidance summary:focus-visible, .general-guidance summary:focus-visible { outline: 2px solid #13795b; outline-offset: 3px; }
  .guidance-card { padding: 16px; line-height: 1.65; background: #fff; }
  .guidance-card + .guidance-card { border-top: 1px solid var(--line); }
  .guidance-card h3 { font-size: 14px; margin-bottom: 12px; line-height: 1.5; }
  .guidance-card p { margin: 5px 0 10px; }
  .guidance-observation { margin-bottom: 14px; }
  .guidance-card blockquote, .guidance-complements blockquote { margin: 9px 0; padding: 7px 10px; border-left: 2px solid #d4b474; background: #fffaf0; white-space: normal; }
  .guidance-steps { padding-left: 20px; margin: 10px 0; }
  .guidance-steps li { margin-bottom: 8px; padding-left: 3px; }
  .guidance-check { color: #445e53; font-size: 11px; }
  .guidance-reference-label { color: #256851; font-size: 11px; font-weight: 600; }
  .guidance-sources { margin-top: 14px; border-top: 1px solid var(--line); padding-top: 8px; }
  .guidance-sources > summary { cursor: pointer; color: #256851; font-weight: 600; padding: 4px 0; }
  .guidance-source { margin-top: 12px; }
  .guidance-source small { display: block; color: #52667d; }
  .guidance-source a { display: inline-block; color: #126e54; text-decoration: underline; margin-top: 6px; }
  .guidance-context { padding: 10px 12px; color: #73531c; background: #fff7e4; font-size: 11px; }
  .guidance-complements { margin-top: 10px; border: 1px solid #cce2d7; border-radius: 5px; background: #f5faf7; overflow-wrap: anywhere; }
  .guidance-complements > summary { color: #256851; }
  .guidance-complements > p, .guidance-complements > div { margin: 0 12px 12px; }
  .guidance-complements blockquote { background: #fff; border-color: #89b39e; }
  .general-guidance { margin-top: 18px; padding: 18px; }
  .general-guidance h2 { font-size: 15px; }
  .general-guidance > p { margin: 8px 0 14px; color: #52667d; }
  .general-guidance > details { margin-top: 10px; }
  dialog { color: var(--ink); border: 1px solid var(--line); border-radius: 12px; padding: 26px; width: min(440px, calc(100% - 32px)); box-shadow: 0 15px 65px #132d4d26; }
  dialog::backdrop { background: #14233766; }
  .dialog-heading { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
  .dialog-heading h2 { font-size: 18px; }
  .dialog-heading button { background: none; border: 0; display: grid; place-items: center; }
  dialog dl { display: grid; gap: 16px; margin: 25px 0; }
  dialog dt { color: var(--muted); font-size: 11px; }
  dialog dd { margin: 2px 0 0; overflow-wrap: anywhere; }
  dialog.guidance-drawer { position: fixed; inset: 0 0 0 auto; margin: 0; width: min(620px, 100%); max-width: 100%; height: 100dvh; max-height: 100dvh; padding: 0; border: 0; border-left: 1px solid var(--line); border-radius: 0; font-size: 13px; text-align: left; overflow: hidden; }
  .guidance-drawer[open] { display: flex; flex-direction: column; }
  .guidance-drawer-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 24px; border-bottom: 1px solid var(--line); background: white; }
  .guidance-drawer-heading > div { min-width: 0; }
  .guidance-drawer-heading span, .guidance-drawer-heading p { color: var(--muted); font-size: 12px; }
  .guidance-drawer-heading h2 { font-size: 19px; line-height: 1.4; margin: 4px 0 6px; }
  .guidance-drawer-heading button { flex-shrink: 0; }
  .guidance-drawer-body { padding: 24px; overflow-y: auto; overscroll-behavior: contain; min-height: 0; }
  .guidance-drawer-body > * + * { margin-top: 16px; }
  .guidance-drawer .guidance-disclosure { border-left-width: 1px; background: #f8fafc; border-color: #dce4ed; }
  .guidance-drawer .guidance-disclosure > summary { padding: 14px 16px; color: var(--ink); }
  .guidance-drawer .guidance-disclosure[open] > summary { border-bottom-color: var(--line); }
  .guidance-drawer .guidance-card h3 { display: none; }
  .guidance-drawer .guidance-card { padding: 20px 16px; }
  .guidance-drawer .guidance-check { padding: 12px; background: #f2f8f5; font-size: 12px; border-radius: 4px; }
  @media (max-width: 1100px) {
    .result-sidebar { width: 205px; } .result-workspace { margin-left: 205px; }
    .bar-scale, .category-bar { grid-template-columns: minmax(0, 1fr) minmax(80px, .8fr) 22px; gap: 6px; }
    .radar-chart { max-width: 350px; }
    .chart-grid { grid-template-columns: 1fr 1fr; gap: 14px; }
  }
  @media (max-width: 900px) {
    .chart-grid { grid-template-columns: 1fr; }
    .chart-panel { min-height: auto; }
    .bar-scale, .category-bar { grid-template-columns: minmax(0, 1fr) minmax(100px, 1.3fr) 27px; }
    .radar-wrap { min-height: 310px; }
    .metric-card { padding: 14px; } .metric-icon { right: 12px; top: 14px; }
    .metric-value strong { font-size: 27px; }
  }
  @media (max-width: 700px) {
    .workspace-location { gap: 7px; font-size: 11px; }
    .workspace-location > span, .workspace-location > svg { display: none; }
    .dashboard-entry { grid-template-columns: minmax(0, 1fr); padding: 24px 20px; gap: 20px; }
    .dashboard-entry h2 { font-size: 20px; }
    .dashboard-entry-note { grid-column: 1; margin-top: 4px; }
    .guidance-drawer-heading, .guidance-drawer-body { padding: 18px; }
    .guidance-drawer-heading h2 { font-size: 17px; }
    .result-sidebar { position: static; width: 100%; height: auto; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; border-right: 0; border-bottom: 1px solid var(--line); flex-wrap: wrap; }
    .result-brand { padding: 0; }
    .mobile-menu-button { display: grid; place-items: center; border: 1px solid #d5dfed; border-radius: 5px; width: 32px; height: 32px; background: white; }
    .result-sidebar nav { display: none; width: 100%; margin-top: 12px; } .result-sidebar nav[data-open='true'] { display: grid; }
    .result-workspace { margin-left: 0; }
    .result-topbar { padding: 0 16px; height: 59px; gap: 12px; }
    .workspace-search { height: 35px; padding: 0 9px; } .workspace-search kbd, .account-name { display: none; }
    .workspace-search input { font-size: 12px; }
    .account-menu > summary { gap: 5px; }
    .result-main { width: calc(100% - 32px); padding-top: 20px; }
    .result-heading { flex-wrap: wrap; gap: 12px; margin-bottom: 18px; }
    .result-heading h1 { font-size: 22px; }
    .result-heading > button { margin-top: 0; }
    .document-line { flex-wrap: wrap; gap: 4px; }
    .metric-grid { gap: 9px; } .metric-card { padding: 12px 10px; min-height: 145px; }
    .metric-label { padding-right: 0; font-size: 10px; min-height: 30px; margin-bottom: 12px; }
    .metric-icon { display: none; }
    .metric-value { flex-wrap: wrap; gap: 2px 4px; } .metric-value strong { font-size: 25px; }
    .metric-value .no-score { font-size: 17px; }
    .metric-card > p { font-size: 10px; }
    .segment-filters { grid-template-columns: 1fr 1fr; } .segment-search { grid-column: 1 / -1; }
    .segments-table thead { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
    .segments-table, .segments-table tbody { display: block; font-size: 12px; }
    .segments-table tr { display: grid; grid-template-columns: 1.3fr 1fr; padding: 15px 18px; border-top: 1px solid var(--line); gap: 12px; }
    .segments-table td { display: block; width: auto; padding: 0; border: 0; }
    .segments-table td:first-child { grid-column: 1 / -1; }
    .segments-table td:first-child:has(.segment-copy) { display: contents; }
    .segments-table .segment-copy { grid-column: 1 / -1; }
    .segments-table td[data-label] { order: 1; }
    .segments-table .segment-guidance { grid-column: 1 / -1; order: 2; margin-top: 0; }
    .segments-table td[data-label]::before { content: attr(data-label); display: block; color: var(--muted); font-size: 10px; margin-bottom: 7px; }
    .segments-table .empty-segments { grid-column: 1 / -1; }
    .pagination { padding: 12px; gap: 5px; } .pagination > div { gap: 7px; }
    .grade-legend { gap: 9px 12px; } .grade-legend > strong { flex-basis: 100%; }
    .document-facts { grid-template-columns: 1fr; }
    .document-panel { padding: 18px; }
  }
`;
