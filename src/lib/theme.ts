// Design tokens extracted from src/app/page.tsx — single source of truth for the light theme.
// Values are taken verbatim from the `C` constant in page.tsx; do not add colours
// that are not present there.

export const theme = {
  colors: {
    // Brand
    primary: '#534AB7',
    primaryTint: '#EEEDFE',
    primaryBorder: '#CECBF6',

    // Text
    textDark: '#26215C',
    textMuted: '#8A87A8',
    textTertiary: '#AFA9EC',

    // Backgrounds
    bgWhite: '#FFFFFF',
    bgLavenderSoft: '#F8F7FE',    // C.bgAlt
    bgLavenderStrong: '#EFEDFB',  // used inline in KOMISI section of page.tsx

    // Borders
    border: '#EEEDFE',

    // Success / positive
    success: '#1D9E75',
    successTint: '#E1F5EE',

    // Coral / accent
    coral: '#D4537E',
    coralTint: '#FBEAF0',

    // Dark mesh (Final CTA + Footer base in page.tsx)
    meshBase: '#0F0C2E',
  },

  fonts: {
    headline: "'Playfair Display', Georgia, serif",
    body: "'Work Sans', sans-serif",
    mono: "'Geist Mono', monospace",
  },

  shadow: {
    card: '0 8px 24px rgba(83,74,183,0.08)',
    hover: '0 16px 40px rgba(83,74,183,0.14)',
  },

  radius: {
    sm: '8px',
    md: '14px',
    lg: '20px',
    pill: '24px',
  },

  gradients: {
    darkMesh: `radial-gradient(circle at 20% 30%, rgba(127,119,221,0.55) 0%, transparent 45%),
      radial-gradient(circle at 75% 20%, rgba(212,83,126,0.45) 0%, transparent 45%),
      radial-gradient(circle at 60% 75%, rgba(127,119,221,0.4) 0%, transparent 50%),
      radial-gradient(circle at 15% 85%, rgba(237,147,177,0.4) 0%, transparent 45%),
      radial-gradient(circle at 90% 60%, rgba(83,74,183,0.5) 0%, transparent 40%)`,
  },
}
