/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    primary: '#0A7EA4',
    secondary: '#FFB300',
    accent: '#FF7043',
    error: '#E53935',
    success: '#43A047',
    warning: '#FFA000',
    info: '#1976D2',
    border: '#E0E0E0',
    card: '#F5F7FA',
    shadow: 'rgba(10, 126, 164, 0.08)',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    gray100: '#F5F7FA',
    gray200: '#E0E0E0',
    gray300: '#BDBDBD',
    gray400: '#9E9E9E',
    gray500: '#616161',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    surface: '#23272F',
    primary: '#0A7EA4',
    secondary: '#FFB300',
    accent: '#FF7043',
    error: '#E57373',
    success: '#66BB6A',
    warning: '#FFD54F',
    info: '#64B5F6',
    border: '#23272F',
    card: '#23272F',
    shadow: 'rgba(10, 126, 164, 0.16)',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    gray100: '#23272F',
    gray200: '#2C313A',
    gray300: '#3A3F47',
    gray400: '#4B515A',
    gray500: '#6C757D',
  },
};
