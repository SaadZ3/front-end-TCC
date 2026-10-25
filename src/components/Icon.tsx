import type { SVGProps } from 'react';
const paths = {
  document: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6M8 13h8M8 17h5" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  history: <><path d="M3 11a9 9 0 1 1 2 7M3 4v7h7" /><path d="M12 7v5l3 2" /></>,
  upload: <path d="M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5" />,
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  check: <path d="m5 12 4 4L19 6" />,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
  logout: <path d="M9 4H4v16h5M9 12h12m-4-4 4 4-4 4" />,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  settings: <><path d="m9 3-.6 2.4-2 .9L4.2 6 2.7 8.6l1.6 1.8v2.4l-1.6 1.8 1.5 2.6 2.2-.3 2 .9L9 21h3l.6-3.2 2-.9 2.2.3 1.5-2.6-1.6-1.8v-2.4l1.6-1.8L16.8 6l-2.2.3-2-.9L12 3Z" /><circle cx="10.5" cy="12" r="3" /></>,
  shield: <><path d="M12 3c-3 0-5 1-8 3 0 7 3 12 8 15 5-3 8-8 8-15-3-2-5-3-8-3Z" /><path d="m7 8 5 7 5-7H7Zm5 7v3" /></>,
  badge: <><path d="m12 2 3 2 3 .5.5 3 2 3-1 3-2 2-.5 3-3 .5-2 2-3-2-3-.5-.5-3-2-2 1-3 2-3 .5-3 3-.5Z" /><path d="m8 12 3 3 5-6" /></>,
  scan: <><path d="M8 3H4v4m12-4h4v4M4 17v4h4m12-4v4h-4M3 12h18M8 7h8M8 17h8" /></>,
  shapes: <><path d="m8 3 4 6H4Z" /><circle cx="17" cy="17" r="4" /><rect x="3" y="13" width="7" height="7" rx="1" /></>,
  chart: <path d="M4 3v18h17M8 16V9m5 7V5m5 11v-5" />,
  files: <><path d="M9 3h7l4 4v12H9V3Zm7 0v4h4M5 7H3v14h11" /></>,
  download: <path d="M12 3v12m-4-4 4 4 4-4M5 17v4h14v-4" />,
  user: <><circle cx="12" cy="8" r="3" /><path d="M6 21v-3a6 6 0 0 1 12 0v3" /></>,
  chevron: <path d="m9 5 7 7-7 7" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
};
export default function Icon({ name, size = 20, ...props }: SVGProps<SVGSVGElement> & { name: keyof typeof paths; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
