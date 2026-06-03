import { Platform } from 'react-native';

export const THEME = {
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
  },
  radii: {
    sm: 8,
    md: 16,
    lg: 24,
  },
  typography: {
    title: { fontSize: 20, lineHeight: 24, fontWeight: '600', fontFamily: undefined },
    label: { fontSize: 12, lineHeight: 14, fontWeight: '600', fontFamily: undefined },
    body: { fontSize: 14, lineHeight: 20, fontWeight: '400', fontFamily: undefined },
  },
  sizes: {
    cardWidth: 545,
    cardHeight: 139,
    iconSmall: 20,
    iconMedium: 36,
    moodButtonWidth: 80,
    moodButtonHeight: 100,
    tabBarHeight: Platform.select({ web: 64, default: 92 }),
  },
};

export default THEME;
/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

// Main color palette
const primaryColor = '#6DB3C1'; // Turquoise
const secondaryColor = '#F8F3EC'; // Beige
const accentColor = '#D4E8EC'; // Light turquoise

const tintColorLight = primaryColor;
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#2B2522',
    background: secondaryColor,
    tint: tintColorLight,
    icon: '#7A6D62',
    tabIconDefault: '#B0A299',
    tabIconSelected: tintColorLight,
    primary: primaryColor,
    accent: accentColor,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: primaryColor,
    accent: accentColor,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
