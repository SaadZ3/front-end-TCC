import styled from 'styled-components';

export const LandingPage = styled.div`
  --green: #236751;
  --dark-green: #194a3a;
  --ink: #24352f;
  --muted: #5d6d65;
  --soft: #eff6f1;
  --line: #dce7df;
  background: #fff; color: var(--ink);
  h1, h2, h3 { color: var(--ink); }
  a { color: var(--green); }
  svg { flex-shrink: 0; }
  .container { width: min(1140px, calc(100% - 64px)); margin-inline: auto; }
  .landing-header { display: flex; align-items: center; justify-content: space-between; gap: 28px; min-height: 88px; border-bottom: 1px solid var(--line); }
  .brand { display: inline-flex; align-items: center; gap: 9px; color: var(--ink); font-size: 20px; font-weight: 650; letter-spacing: -.6px; white-space: nowrap; text-decoration: none; }
  .brand-icon { width: 38px; height: 40px; border-radius: 10px; background: var(--soft); color: var(--green); display: grid; place-items: center; }
  .brand-note { border-left: 1px solid var(--line); padding-left: 9px; margin-left: 2px; font-size: 11px; font-weight: 400; color: var(--muted); letter-spacing: 0; }
  .landing-header nav { display: flex; gap: 30px; font-size: 13px; }
  .landing-header nav a { color: var(--muted); }
  .account-button { border: 1px solid #c7d9cd; border-radius: 7px; background: white; color: var(--green); display: inline-flex; align-items: center; gap: 12px; padding: 9px 17px; min-height: 42px; font-size: 13px; font-weight: 600; }
  .account-button:hover { background: var(--soft); }
  .hero { display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 65px; padding-top: 68px; padding-bottom: 68px; }
  .hero-copy { min-width: 0; }
  .project-label { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; color: var(--green); font-weight: 600; }
  .hero h1 { font-size: clamp(36px, 4vw, 54px); letter-spacing: -1.8px; line-height: 1.12; font-weight: 650; max-width: 18ch; margin: 20px 0 24px; text-wrap: balance; }
  .hero-copy > p { max-width: 45ch; font-size: 16px; line-height: 1.8; color: var(--muted); }
  .hero-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 24px; margin-top: 30px; }
  .primary-action { display: inline-flex; justify-content: center; align-items: center; gap: 18px; padding: 13px 20px; min-height: 48px; border: 1px solid var(--green); border-radius: 8px; background: var(--green); color: #fff; font-size: 14px; font-weight: 600; text-decoration: none; transition: background .15s; }
  .primary-action:hover { background: var(--dark-green); border-color: var(--dark-green); }
  .hero-actions > a { font-size: 13px; font-weight: 500; }
  .format-note { margin-top: 21px; display: flex; align-items: center; gap: 8px; color: var(--muted); font-size: 11px; }
  .demo { background: white; padding: 27px; border: 1px solid var(--line); border-radius: 16px; box-shadow: 0 12px 36px #194a3a0a; position: relative; min-width: 0; }
  .demo::before { content: ''; position: absolute; z-index: 0; inset: -15px 15px 15px -15px; background: var(--soft); border-radius: 22px; }
  .demo > * { position: relative; }
  .demo-header { display: flex; align-items: center; gap: 13px; }
  .icon-tile { display: inline-grid; place-items: center; width: 44px; height: 44px; border-radius: 12px; color: var(--green); background: #e5f0e9; flex-shrink: 0; }
  .demo-header h2 { font-size: 18px; font-weight: 600; letter-spacing: -.3px; }
  .demo-header p { color: var(--muted); font-size: 12px; margin-top: 4px; }
  .topic-buttons { display: flex; flex-wrap: wrap; gap: 7px; margin: 25px 0 20px; }
  .topic-buttons button { border: 1px solid #d4e1d8; border-radius: 6px; background: #fff; padding: 8px 11px; min-height: 37px; color: var(--muted); font-size: 11px; }
  .topic-buttons button:hover { border-color: var(--green); }
  .topic-buttons button[aria-pressed='true'] { color: #fff; background: var(--green); border-color: var(--green); }
  .example-result { background: white; border: 1px solid var(--line); border-radius: 9px; padding: 20px; min-height: 268px; }
  .document-label { color: var(--muted); font-size: 11px; display: flex; align-items: center; gap: 8px; }
  .example-result blockquote { margin: 18px 0 24px; font-size: 15px; line-height: 1.9; min-height: 86px; overflow-wrap: anywhere; }
  .example-result mark { background: #e3f0e7; color: var(--dark-green); padding: 3px 2px; box-decoration-break: clone; -webkit-box-decoration-break: clone; }
  .insight { display: flex; align-items: start; gap: 10px; padding-top: 17px; border-top: 1px solid var(--line); }
  .insight > svg { color: var(--green); margin-top: 2px; }
  .insight h3 { font-size: 13px; line-height: 1.5; }
  .insight p { color: var(--muted); font-size: 12px; line-height: 1.7; margin-top: 6px; }
  .demo footer { margin-top: 16px; display: flex; align-items: start; gap: 12px; }
  .example-tag { font-size: 10px; white-space: nowrap; color: var(--green); border: 1px solid #c9ddcf; border-radius: 4px; padding: 3px 6px; }
  .demo footer p { color: var(--muted); font-size: 10px; line-height: 1.65; }
  .section-heading h2 { font-size: clamp(25px, 2.8vw, 32px); font-weight: 600; letter-spacing: -.7px; }
  .section-heading > p { margin-top: 12px; font-size: 14px; color: var(--muted); }
  .process { border-top: 1px solid var(--line); padding: 42px 0 58px; }
  .steps { list-style: none; margin: 32px 0 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 38px; }
  .steps li { display: flex; align-items: start; gap: 13px; }
  .step-number { display: grid; place-items: center; width: 29px; height: 29px; border-radius: 50%; background: var(--soft); border: 1px solid var(--line); color: var(--green); font-size: 12px; font-weight: 600; flex-shrink: 0; }
  .steps h3 { font-size: 16px; margin: 4px 0 10px; }
  .steps p { font-size: 13px; color: var(--muted); line-height: 1.8; }
  .resources { padding: 58px 0; background: #f5f8f5; border-block: 1px solid #e6eee8; }
  .feature-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 22px; margin-top: 30px; }
  .feature-grid article { display: flex; flex-direction: column; align-items: start; background: #fff; border: 1px solid var(--line); border-radius: 12px; padding: 26px; }
  .feature-grid h3 { font-size: 18px; letter-spacing: -.3px; margin: 22px 0 12px; }
  .feature-grid p { font-size: 13px; color: var(--muted); line-height: 1.85; margin-bottom: 22px; }
  .feature-detail { display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--green); margin-top: auto; }
  .format-tags { display: flex; flex-wrap: wrap; gap: 7px; margin-top: auto; }
  .format-tags span { padding: 4px 8px; background: var(--soft); color: var(--green); font-size: 10px; border-radius: 4px; }
  .about-and-questions { padding-block: 68px; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; }
  .about h2 { font-size: 29px; line-height: 1.25; letter-spacing: -.7px; margin: 16px 0 20px; max-width: 27ch; }
  .about > p { font-size: 14px; line-height: 1.8; color: var(--muted); margin-top: 15px; }
  .research-note { display: flex; align-items: start; gap: 14px; margin-top: 26px; background: var(--soft); border-radius: 9px; padding: 20px; }
  .research-note > svg { color: var(--green); margin-top: 2px; }
  .research-note h3 { font-size: 14px; line-height: 1.5; }
  .research-note p { font-size: 12px; color: var(--muted); margin-top: 8px; line-height: 1.8; }
  .questions h2 { font-size: 25px; letter-spacing: -.6px; margin-bottom: 10px; }
  .questions > p { color: var(--muted); font-size: 13px; margin-bottom: 22px; }
  .questions details { border-bottom: 1px solid var(--line); padding: 20px 0; }
  .questions summary { display: flex; align-items: center; justify-content: space-between; gap: 16px; cursor: pointer; list-style: none; font-size: 13px; font-weight: 600; }
  .questions summary::-webkit-details-marker { display: none; }
  .questions summary svg { color: var(--green); }
  .questions details[open] summary svg { transform: rotate(45deg); }
  .questions details p { margin-top: 14px; color: var(--muted); font-size: 13px; line-height: 1.8; }
  .closing { background: var(--soft); border: 1px solid var(--line); border-radius: 14px; padding: 36px 40px; display: flex; align-items: center; justify-content: space-between; gap: 28px; margin-bottom: 54px; }
  .closing h2 { font-size: 25px; letter-spacing: -.6px; }
  .closing p { font-size: 13px; color: var(--muted); margin-top: 10px; }
  .closing .primary-action { flex-shrink: 0; }
  .landing-footer { border-top: 1px solid var(--line); display: flex; align-items: center; justify-content: space-between; gap: 22px; padding-block: 25px; }
  .landing-footer .brand { font-size: 16px; }
  .landing-footer .brand > svg { color: var(--green); }
  .landing-footer p, .landing-footer > a:last-child { color: var(--muted); font-size: 11px; }
  @media(max-width: 1000px) {
    .hero { gap: 34px; } .demo { padding: 21px; }
    .hero h1 { font-size: 43px; }
    .topic-buttons button { padding-inline: 8px; }
    .about-and-questions { gap: 42px; }
    .feature-grid { gap: 16px; } .feature-grid article { padding: 22px; }
  }
  @media(max-width: 760px) {
    .container { width: calc(100% - 40px); }
    .landing-header { flex-wrap: wrap; gap: 14px; padding-block: 16px; }
    .landing-header nav { order: 3; width: 100%; justify-content: space-between; gap: 16px; border-top: 1px solid var(--line); padding-top: 12px; font-size: 12px; }
    .hero { grid-template-columns: minmax(0, 1fr); padding-top: 38px; padding-bottom: 42px; gap: 42px; }
    .hero h1 { font-size: clamp(35px, 6vw, 46px); letter-spacing: -1.3px; max-width: 22ch; }
    .hero-copy > p { font-size: 15px; max-width: 54ch; }
    .hero-actions { margin-top: 24px; gap: 20px; }
    .primary-action { font-size: 13px; }
    .demo { margin-left: 9px; }
    .demo::before { inset: -10px 10px 10px -10px; }
    .example-result { min-height: 0; }
    .example-result blockquote { min-height: 0; }
    .steps { grid-template-columns: 1fr; gap: 26px; margin-top: 26px; }
    .steps p { max-width: 60ch; }
    .process { padding-block: 32px 40px; }
    .resources { padding-block: 40px; }
    .feature-grid { grid-template-columns: 1fr; gap: 16px; }
    .feature-grid article { padding: 24px; }
    .feature-grid h3 { margin-top: 17px; }
    .feature-grid p { max-width: 58ch; }
    .about-and-questions { grid-template-columns: minmax(0, 1fr); padding-block: 42px; gap: 36px; }
    .about h2 { font-size: 27px; }
    .closing { padding: 28px 24px; flex-direction: column; align-items: start; margin-bottom: 34px; gap: 23px; }
    .closing h2 { font-size: 24px; }
    .landing-footer { flex-wrap: wrap; gap: 15px; }
  }
  @media(max-width: 380px) {
    .demo { padding: 18px; }
    .demo-header { gap: 10px; }
    .demo-header h2 { font-size: 16px; }
    .demo-header p { font-size: 11px; }
    .topic-buttons { gap: 6px; }
    .topic-buttons button { padding: 8px; }
    .example-result { padding: 16px; }
    .example-result blockquote { font-size: 14px; }
    .demo footer { flex-direction: column; gap: 8px; }
    .format-note { font-size: 10px; }
  }
`;
