const theme = {
  colors: {
    primary: "#236751",
    primaryLight: "#EAF2ED",
    primaryDark: "#194A3A",
    accent: "#236751",
    accentLight: "#DCECE2",
    background: "#F4F6F5",
    backgroundAlt: "#EDF2EF",
    surface: "#FFFFFF",
    text: "#24352F",
    textSecondary: "#5D6D65",
    textLight: "#DCE3DF",
    textOnPrimary: "#FFFFFF",
    border: "#DCE3DF",
    borderLight: "#E9EEEB",
  },
  fonts: {
    primary: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
  },
  fontSizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
  },
  fontWeights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem",
    "4xl": "6rem",
  },
  borderRadius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    full: "9999px",
  },
  shadows: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)",
  },
  breakpoints: {
    mobile: "480px",
    tablet: "768px",
    desktop: "1024px",
    wide: "1280px",
  },
  layout: {
    maxWidth: "1120px",
    headerHeight: "72px",
  },
} as const;

export type ThemeType = typeof theme;
export default theme;
