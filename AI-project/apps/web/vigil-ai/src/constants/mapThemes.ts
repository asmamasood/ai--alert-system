export const MAP_STYLE_DARK = 'mapbox://styles/mapbox/dark-v11';
export const MAP_STYLE_SATELLITE = 'mapbox://styles/mapbox/satellite-streets-v12';
export const MAP_STYLE_CYBER = 'mapbox://styles/mapbox/navigation-night-v1';

export type MapTheme = 'dark' | 'satellite' | 'cyber';

export const MAP_THEMES: Record<MapTheme, string> = {
  dark: MAP_STYLE_DARK,
  satellite: MAP_STYLE_SATELLITE,
  cyber: MAP_STYLE_CYBER,
};

// ─── VIGIL AI Design System (Reference-matched) ───────────────────────────────
export const DESIGN_TOKENS = {
  colors: {
    // Backgrounds
    background: '#080C14',
    backgroundAlt: '#0B0F1A',
    surface: 'rgba(13, 18, 30, 0.92)',
    surfaceLight: 'rgba(20, 28, 48, 0.85)',
    card: 'rgba(15, 22, 38, 0.9)',

    // Glass
    glass: 'rgba(255,255,255,0.04)',
    glassBorder: 'rgba(0, 229, 255, 0.18)',
    glassBorderPurple: 'rgba(124, 58, 237, 0.3)',

    // Neon Primaries
    neonCyan: '#00E5FF',
    neonCyanDim: 'rgba(0, 229, 255, 0.15)',
    neonBlue: '#2979FF',
    neonPurple: '#7C3AED',
    neonPurpleLight: '#A78BFA',
    neonViolet: 'rgba(124, 58, 237, 0.4)',

    // Severity
    neonRed: '#FF1744',
    neonRedDim: 'rgba(255, 23, 68, 0.15)',
    neonOrange: '#FF6D00',
    neonOrangeDim: 'rgba(255, 109, 0, 0.15)',
    neonAmber: '#FFAB00',
    neonGreen: '#00E676',
    neonGreenDim: 'rgba(0, 230, 118, 0.15)',

    // Grid / UI
    grid: 'rgba(0, 229, 255, 0.06)',
    divider: 'rgba(0, 229, 255, 0.1)',
    dividerSubtle: 'rgba(255,255,255,0.06)',
    scanLine: 'rgba(0, 229, 255, 0.05)',

    // Typography
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.65)',
    textMuted: 'rgba(255,255,255,0.35)',
    textDim: 'rgba(255,255,255,0.2)',

    // Gradient stops
    gradientCyan: ['#00E5FF', '#2979FF'],
    gradientPurple: ['#7C3AED', '#2979FF'],
    gradientRed: ['#FF1744', '#FF6D00'],
    gradientSuccess: ['#00E676', '#00BCD4'],
  },

  // Blur levels
  blur: { subtle: 8, light: 16, medium: 24, heavy: 40 },

  // Radius aliases
  radius: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    xxl: 32,
    full: 999,
  },
  borderRadius: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    xxl: 32,
    full: 999,
  },

  // Spacing aliases
  space: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Typography aliases
  font: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 26,
    hero: 34,
  },
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 26,
    hero: 34,
  },

  // Shadows (glow)
  glow: {
    cyan: {
      shadowColor: '#00E5FF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.7,
      shadowRadius: 12,
      elevation: 8,
    },
    red: {
      shadowColor: '#FF1744',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 14,
      elevation: 10,
    },
    purple: {
      shadowColor: '#7C3AED',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.7,
      shadowRadius: 12,
      elevation: 8,
    },
    amber: {
      shadowColor: '#FFAB00',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.7,
      shadowRadius: 10,
      elevation: 6,
    },
  },
};

// Severity mapping matching reference image
export const SEVERITY_STYLE = {
  critical: {
    label: 'CRITICAL',
    badge: '#FF1744',
    badgeBg: 'rgba(255,23,68,0.18)',
    border: '#FF1744',
    glow: '#FF1744',
    text: '#FF4060',
    dot: '#FF1744',
  },
  high: {
    label: 'HIGH',
    badge: '#FF6D00',
    badgeBg: 'rgba(255,109,0,0.18)',
    border: '#FF6D00',
    glow: '#FF6D00',
    text: '#FF8C00',
    dot: '#FF6D00',
  },
  medium: {
    label: 'MEDIUM',
    badge: '#FFAB00',
    badgeBg: 'rgba(255,171,0,0.18)',
    border: '#FFAB00',
    glow: '#FFAB00',
    text: '#FFAB00',
    dot: '#FFAB00',
  },
  low: {
    label: 'LOW',
    badge: '#00E5FF',
    badgeBg: 'rgba(0,229,255,0.12)',
    border: '#00E5FF',
    glow: '#00E5FF',
    text: '#00E5FF',
    dot: '#00E5FF',
  },
};
