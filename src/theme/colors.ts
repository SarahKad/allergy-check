export type ThemeMode = 'light' | 'dark';

export type Verdict = 'safe' | 'caution' | 'unsafe';

export type Palette = {
  bg: string;
  bgElevated: string;
  card: string;
  cardBorder: string;
  text: string;
  textMuted: string;
  textDim: string;
  accent: string;
  accentText: string;
  inputBg: string;
  inputBorder: string;
  divider: string;

  safeBg: string;
  safeBorder: string;
  safeText: string;
  safeAccent: string;

  cautionBg: string;
  cautionBorder: string;
  cautionText: string;
  cautionAccent: string;

  unsafeBg: string;
  unsafeBorder: string;
  unsafeText: string;
  unsafeAccent: string;
};

export const lightPalette: Palette = {
  bg: '#F6F7FB',
  bgElevated: '#FFFFFF',
  card: '#FFFFFF',
  cardBorder: '#E6E8F0',
  text: '#0B1220',
  textMuted: '#475067',
  textDim: '#7A8398',
  accent: '#3B6BFF',
  accentText: '#FFFFFF',
  inputBg: '#FFFFFF',
  inputBorder: '#D8DCE8',
  divider: '#ECEEF5',

  safeBg: '#E6F7EC',
  safeBorder: '#B6E5C5',
  safeText: '#0F5F33',
  safeAccent: '#15A04A',

  cautionBg: '#FFF6E0',
  cautionBorder: '#F4DA9A',
  cautionText: '#7A5300',
  cautionAccent: '#E0A21A',

  unsafeBg: '#FDE6E6',
  unsafeBorder: '#F4B7B7',
  unsafeText: '#7A1A1A',
  unsafeAccent: '#D63333',
};

export const darkPalette: Palette = {
  bg: '#0B1220',
  bgElevated: '#121A2B',
  card: '#151E33',
  cardBorder: '#222C45',
  text: '#F2F4FA',
  textMuted: '#B7C0D6',
  textDim: '#7B85A0',
  accent: '#6E91FF',
  accentText: '#0B1220',
  inputBg: '#0F1729',
  inputBorder: '#2A3656',
  divider: '#1B2540',

  safeBg: '#0F2C1E',
  safeBorder: '#1F5236',
  safeText: '#7BE0A4',
  safeAccent: '#2ECC71',

  cautionBg: '#2D2410',
  cautionBorder: '#5A4416',
  cautionText: '#FFD480',
  cautionAccent: '#F2B53C',

  unsafeBg: '#2E1414',
  unsafeBorder: '#5C2424',
  unsafeText: '#FFA0A0',
  unsafeAccent: '#FF5C5C',
};

export function paletteFor(mode: ThemeMode): Palette {
  return mode === 'dark' ? darkPalette : lightPalette;
}

export function verdictColors(p: Palette, v: Verdict) {
  switch (v) {
    case 'safe':
      return { bg: p.safeBg, border: p.safeBorder, text: p.safeText, accent: p.safeAccent };
    case 'caution':
      return {
        bg: p.cautionBg,
        border: p.cautionBorder,
        text: p.cautionText,
        accent: p.cautionAccent,
      };
    case 'unsafe':
      return {
        bg: p.unsafeBg,
        border: p.unsafeBorder,
        text: p.unsafeText,
        accent: p.unsafeAccent,
      };
  }
}

export function levelColors(p: Palette, level: 'ok' | 'warn' | 'bad') {
  switch (level) {
    case 'ok':
      return { bg: p.safeBg, border: p.safeBorder, text: p.safeText, accent: p.safeAccent };
    case 'warn':
      return {
        bg: p.cautionBg,
        border: p.cautionBorder,
        text: p.cautionText,
        accent: p.cautionAccent,
      };
    case 'bad':
      return {
        bg: p.unsafeBg,
        border: p.unsafeBorder,
        text: p.unsafeText,
        accent: p.unsafeAccent,
      };
  }
}
