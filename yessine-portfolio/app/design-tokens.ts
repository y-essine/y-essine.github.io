// Exact design tokens extracted from Framer HTML
// These are the actual values used in the original site

export const colors = {
  // Primary colors from token extraction
  gray: {
    50: '#ffffff',  // token-0f1b60e9 - white
    100: '#d0a58b', // token-c89ea9f4 - accent light
    200: '#919191', // token-e2b3e115 - muted text
    300: '#2e2e2e', // token-d66f81c5 - border/divider
    400: '#292929', // token-ac9cb30b - border
    500: '#19191a', // token-ecc20de8 - surface
    600: '#141417', // token-92d8255a - background
    700: '#42342b', // token-d0fdb86e - accent dark
    900: '#000000', // token-94ac02ff - black
  },
  
  // Semantic tokens
  background: '#141417',      // Main background
  foreground: '#ffffff',      // Main text
  muted: '#919191',           // Secondary text
  mutedForeground: '#919191', // Tertiary text
  border: '#292929',          // Borders
  accent: '#42342b',          // Accent background
  accentLight: '#d0a58b',     // Accent foreground/text
  surface: '#19191a',         // Card background
  surfaceBorder: '#2e2e2e',   // Card border
} as const;

export const typography = {
  // Font sizes extracted from HTML (most common values)
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',  // Section headers
    '6xl': '60px',
    '7xl': '72px',
  },
  
  // Font weights (from extraction)
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Line heights (from extraction)
  lineHeight: {
    tight: '1.2',
    normal: '1.5',
    relaxed: '1.6',
  },
  
  // Letter spacing (from extraction)
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
  },
} as const;

export const spacing = {
  // Spacing scale extracted from HTML
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

export const borderRadius = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
} as const;

export const boxShadow = {
  sm: '0px 0.7065919983928324px 0.4239551990356995px -0.5px rgba(0, 0, 0, 0.24), 0px 1.8065619053231785px 1.0839371431939073px -1px rgba(0, 0, 0, 0.24)',
  md: '0px 3.6217592146567767px 2.1730555287940665px -1.5px rgba(0, 0, 0, 0.23), 0px 6.8655999097303715px 4.119359945838224px -2px rgba(0, 0, 0, 0.22)',
  lg: '0px 13.646761411524492px 8.188056846914698px -2.5px rgba(0, 0, 0, 0.2), 0px 30px 18.000000000000004px -3px rgba(0, 0, 0, 0.16)',
  card: '0px 0.6021873017743928px 1.5656869846134214px -1.1666666666666665px rgba(0, 0, 0, 0.27), 0px 2.288533303243457px 5.950186588432988px -2.333333333333333px rgba(0, 0, 0, 0.24), 0px 10px 26px -3.5px rgba(0, 0, 0, 0.12)',
} as const;

export const effects = {
  backdropBlur: 'blur(10px)',
} as const;

// Export all tokens
export const tokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  boxShadow,
  effects,
} as const;

export type Tokens = typeof tokens;
